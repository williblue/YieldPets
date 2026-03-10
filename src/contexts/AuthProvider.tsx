"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import "@/lib/flow";
import { GET_COA_ADDRESS, CREATE_COA, CHECK_PYUSD_VAULT, SETUP_PYUSD_VAULT } from "@/lib/flow";
import { useMagic } from "./MagicProvider";

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean;
  email: string | null;
  address: string | null;
  balance: number | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  magicAuthz: any;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  isLoading: true,
  email: null,
  address: null,
  balance: null,
  login: async () => {},
  logout: async () => {},
  refreshBalance: async () => {},
  magicAuthz: null,
});

// Persist auth state so the UI can render immediately without waiting for Magic SDK
function getCachedAuth(): { loggedIn: boolean; email: string | null; address: string | null } {
  if (typeof window === "undefined") return { loggedIn: false, email: null, address: null };
  try {
    const raw = localStorage.getItem("yp_auth_cache");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { loggedIn: false, email: null, address: null };
}

function setCachedAuth(loggedIn: boolean, email: string | null, address: string | null) {
  try {
    if (loggedIn) {
      localStorage.setItem("yp_auth_cache", JSON.stringify({ loggedIn, email, address }));
    } else {
      localStorage.removeItem("yp_auth_cache");
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { magic } = useMagic();
  const cached = getCachedAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(cached.loggedIn);
  // If cached as logged in: skip loading (show UI immediately, validate in background)
  // If not cached: also skip loading (show egg immediately for new users)
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(cached.email);
  const [address, setAddress] = useState<string | null>(cached.address);
  const [balance, setBalance] = useState<number | null>(null);

  const magicAuthz = magic?.flow?.authorization ?? null;

  // Silently ensure COA and PYUSD0 vault exist
  const ensureWalletSetup = useCallback(
    async (flowAddress: string, authz: unknown) => {
      if (!authz) return;
      try {
        // Check & create COA
        const coaAddr = await fcl.query({
          cadence: GET_COA_ADDRESS,
          args: (arg: typeof fcl.arg) => [arg(flowAddress, t.Address)],
        });
        if (!coaAddr) {
          const txId = await fcl.mutate({
            cadence: CREATE_COA,
            limit: 9999,
            authorizations: [authz],
            payer: authz,
            proposer: authz,
          });
          await fcl.tx(txId).onceSealed();
        }

        // Check & create PYUSD0 vault
        const hasVault = await fcl.query({
          cadence: CHECK_PYUSD_VAULT,
          args: (arg: typeof fcl.arg) => [arg(flowAddress, t.Address)],
        });
        if (!hasVault) {
          const txId = await fcl.mutate({
            cadence: SETUP_PYUSD_VAULT,
            limit: 9999,
            authorizations: [authz],
            payer: authz,
            proposer: authz,
          });
          await fcl.tx(txId).onceSealed();
        }
      } catch (err) {
        console.error("Background wallet setup failed:", err);
      }
    },
    []
  );

  const refreshBalance = useCallback(
    async (addr?: string) => {
      const target = addr || address;
      if (!target) return;
      try {
        const account = await fcl.account(target);
        setBalance(Number(account.balance) / 100_000_000);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    },
    [address]
  );

  // Check existing session on mount
  useEffect(() => {
    if (!magic) return;
    let cancelled = false;

    const checkSession = async () => {
      try {
        const loggedIn = await magic.user.isLoggedIn();
        if (cancelled) return;

        if (loggedIn) {
          const metadata = await magic.user.getInfo();
          if (cancelled) return;

          let flowAddress: string | null = null;
          try {
            const flowAccount = await magic.flow.getAccount();
            flowAddress = flowAccount ?? null;
          } catch {
            // Flow account may not be created yet
          }

          setEmail(metadata.email ?? null);
          setAddress(flowAddress);
          setIsLoggedIn(true);
          setCachedAuth(true, metadata.email ?? null, flowAddress);
          if (flowAddress) {
            await refreshBalance(flowAddress);
            ensureWalletSetup(flowAddress, magic.flow.authorization);
          }
        } else {
          // Not logged in — clear any stale cache
          setIsLoggedIn(false);
          setCachedAuth(false, null, null);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [magic, refreshBalance, ensureWalletSetup]);

  const login = useCallback(
    async (emailInput: string) => {
      if (!magic) return;
      setIsLoading(true);
      try {
        await magic.auth.loginWithEmailOTP({ email: emailInput, showUI: true });
        const metadata = await magic.user.getInfo();

        let flowAddress: string | null = null;
        try {
          const flowAccount = await magic.flow.getAccount();
          flowAddress = flowAccount ?? null;
        } catch {
          // Flow account may not be created yet
        }

        setEmail(metadata.email ?? null);
        setAddress(flowAddress);
        setIsLoggedIn(true);
        setCachedAuth(true, metadata.email ?? null, flowAddress);
        if (flowAddress) {
          await refreshBalance(flowAddress);
          ensureWalletSetup(flowAddress, magic.flow.authorization);
        }
      } catch (err) {
        console.error("Login failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [magic, refreshBalance, ensureWalletSetup]
  );

  const logout = useCallback(async () => {
    if (!magic) return;
    setIsLoading(true);
    try {
      await magic.user.logout();
    } finally {
      setIsLoggedIn(false);
      setEmail(null);
      setAddress(null);
      setBalance(null);
      setIsLoading(false);
      setCachedAuth(false, null, null);
    }
  }, [magic]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        email,
        address,
        balance,
        login,
        logout,
        refreshBalance,
        magicAuthz,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

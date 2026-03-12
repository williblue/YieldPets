"use client";

import { useState, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import {
  DEPOSIT_STGUSDC,
  WITHDRAW_STGUSDC,
  GET_USDC_VAULT_POSITION,
  GET_COA_ADDRESS,
} from "@/lib/flow";

const FLOW_EVM_RPC = "https://mainnet.evm.nodes.onflow.org";
const STGUSDC_ADDRESS = "0xf1815bd50389c46847f0bda824ec8da914045d14";
import { useAuth } from "@/contexts/AuthProvider";
import { useGame } from "@/contexts/GameProvider";

export interface UsdcVaultPosition {
  totalDeposited: number;
  aTokenBalance: number; // includes accrued yield
  growthScore: number;
  depositCount: number;
  evmAddress: string;
}

export function useUsdcVault() {
  const { address, magicAuthz } = useAuth();
  const game = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Query the on-chain USDC vault position */
  const getVaultPosition = useCallback(async (): Promise<UsdcVaultPosition | null> => {
    if (!address) return null;
    try {
      const result = await fcl.query({
        cadence: GET_USDC_VAULT_POSITION,
        args: (arg: typeof fcl.arg) => [arg(address, t.Address)],
      });
      return {
        totalDeposited: parseFloat(result.totalDeposited) || 0,
        aTokenBalance: Number(result.aTokenBalance) / 1_000_000 || 0, // 6 decimals
        growthScore: parseFloat(result.growthScore) || 0,
        depositCount: parseInt(result.depositCount) || 0,
        evmAddress: result.evmAddress || "",
      };
    } catch {
      return null;
    }
  }, [address]);

  /** Query stgUSDC balance in the COA via Flow EVM JSON-RPC */
  const getStgUsdcBalance = useCallback(async (): Promise<number> => {
    if (!address) return 0;
    try {
      // First get the COA's EVM address from Cadence
      const coaAddr = await fcl.query({
        cadence: GET_COA_ADDRESS,
        args: (arg: typeof fcl.arg) => [arg(address, t.Address)],
      });
      if (!coaAddr) return 0;

      // Query balanceOf via eth_call on Flow EVM gateway
      // balanceOf(address) selector = 0x70a08231 + address padded to 32 bytes
      const paddedAddr = coaAddr.replace("0x", "").padStart(64, "0");
      const callData = "0x70a08231" + paddedAddr;

      const resp = await fetch(FLOW_EVM_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: STGUSDC_ADDRESS, data: callData }, "latest"],
        }),
      });
      const json = await resp.json();
      if (json.error || !json.result) return 0;
      return Number(BigInt(json.result)) / 1_000_000; // 6 decimals
    } catch {
      return 0;
    }
  }, [address]);

  /** Deposit stgUSDC from COA into MoreMarkets lending */
  const depositUsdc = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!magicAuthz || amount <= 0) return false;
      setIsLoading(true);
      setError(null);
      try {
        const txId = await fcl.mutate({
          cadence: DEPOSIT_STGUSDC,
          args: (arg: typeof fcl.arg) => [arg(amount.toFixed(8), t.UFix64)],
          limit: 9999,
          authorizations: [magicAuthz],
          payer: magicAuthz,
          proposer: magicAuthz,
        });
        await fcl.tx(txId).onceSealed();
        // Update local game state to reflect the on-chain deposit
        game.depositUsdc(amount);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Deposit failed";
        setError(msg);
        console.error("USDC deposit failed:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [magicAuthz, game]
  );

  /** Withdraw stgUSDC from MoreMarkets lending back to COA */
  const withdrawUsdc = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!magicAuthz) return false;
      setIsLoading(true);
      setError(null);
      try {
        // amount = 0 means withdraw all (principal + yield)
        const txId = await fcl.mutate({
          cadence: WITHDRAW_STGUSDC,
          args: (arg: typeof fcl.arg) => [arg(amount.toFixed(8), t.UFix64)],
          limit: 9999,
          authorizations: [magicAuthz],
          payer: magicAuthz,
          proposer: magicAuthz,
        });
        await fcl.tx(txId).onceSealed();
        // Update local game state
        if (amount === 0) {
          // Withdrew all — sync from on-chain position
          const position = await getVaultPosition();
          if (position) {
            game.withdrawUsdc(position.totalDeposited);
          }
        } else {
          game.withdrawUsdc(amount);
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Withdrawal failed";
        setError(msg);
        console.error("USDC withdrawal failed:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [magicAuthz, game, getVaultPosition]
  );

  return {
    isLoading,
    error,
    depositUsdc,
    withdrawUsdc,
    getVaultPosition,
    getStgUsdcBalance,
  };
}

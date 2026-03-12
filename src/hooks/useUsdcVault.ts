"use client";

import { useState, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import {
  DEPOSIT_STGUSDC,
  WITHDRAW_STGUSDC,
  GET_USDC_VAULT_POSITION,
  CHECK_STGUSDC_BALANCE,
} from "@/lib/flow";
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

  /** Query stgUSDC balance in the COA (available to deposit) */
  const getStgUsdcBalance = useCallback(async (): Promise<number> => {
    if (!address) return 0;
    try {
      const result = await fcl.query({
        cadence: CHECK_STGUSDC_BALANCE,
        args: (arg: typeof fcl.arg) => [arg(address, t.Address)],
      });
      return Number(result) / 1_000_000; // 6 decimals → human-readable
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

"use client";

import { useState, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useAuth } from "@/contexts/AuthProvider";
import {
  SETUP_PROFILE,
  GET_PROFILE,
  PROFILE_FEED,
  PROFILE_BUY_FOOD,
  PROFILE_BUY_FURNITURE,
  PROFILE_PLACE_FURNITURE,
  PROFILE_REMOVE_FURNITURE,
  PROFILE_SET_PET_NAME,
  PROFILE_SET_TRAINER_NAME,
  PROFILE_DAILY_LOGIN,
  PROFILE_ACCRUE_YIELD,
  PROFILE_DEPOSIT,
  PROFILE_DEPOSIT_USDC,
  PROFILE_WITHDRAW,
  PROFILE_WITHDRAW_USDC,
  PROFILE_SET_HEARTS,
} from "@/lib/flow";
import type { GameState, Transaction } from "@/contexts/GameProvider";
import type { HeartCount } from "@/types";

/** On-chain profile state returned by getFullState() */
export interface OnChainProfile {
  petName: string;
  trainerName: string;
  hearts: HeartCount;
  lastFedAt: number;
  nuggets: number;
  depositBalance: number;
  usdcDepositBalance: number;
  totalYieldEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  dailyBonusClaimed: boolean;
  ownedFurniture: string[];
  placedFurniture: string[];
  foodInventory: Record<string, number>;
  transactions: Transaction[];
  createdAt: number;
}

function parseProfile(raw: Record<string, unknown>): OnChainProfile {
  // Parse on-chain transactions into local format
  const rawTxns = (raw.transactions as Array<Record<string, unknown>>) || [];
  const transactions: Transaction[] = rawTxns.map((tx, i) => ({
    id: `chain_${i}_${tx.timestamp}`,
    type: (tx.txType as string) as Transaction["type"],
    label: (tx.label as string) || "",
    amount: parseFloat(tx.amount as string) || 0,
    timestamp: parseFloat(tx.timestamp as string) * 1000, // Cadence UFix64 seconds → JS ms
  }));

  // Parse food inventory from Cadence {String: UInt64}
  const rawFood = (raw.foodInventory as Record<string, string>) || {};
  const foodInventory: Record<string, number> = {};
  for (const [key, val] of Object.entries(rawFood)) {
    foodInventory[key] = parseInt(val) || 0;
  }

  return {
    petName: (raw.petName as string) || "Sprout",
    trainerName: (raw.trainerName as string) || "Trainer",
    hearts: Math.min(4, parseInt(raw.hearts as string) || 0) as HeartCount,
    lastFedAt: parseFloat(raw.lastFedAt as string) * 1000 || Date.now(),
    nuggets: parseInt(raw.nuggets as string) || 0,
    depositBalance: parseFloat(raw.depositBalance as string) || 0,
    usdcDepositBalance: parseFloat(raw.usdcDepositBalance as string) || 0,
    totalYieldEarned: parseFloat(raw.totalYieldEarned as string) || 0,
    currentStreak: parseInt(raw.currentStreak as string) || 1,
    longestStreak: parseInt(raw.longestStreak as string) || 1,
    lastLoginDate: (raw.lastLoginDate as string) || "",
    dailyBonusClaimed: raw.dailyBonusClaimed === true,
    ownedFurniture: (raw.ownedFurniture as string[]) || [],
    placedFurniture: (raw.placedFurniture as string[]) || [],
    foodInventory,
    transactions,
    createdAt: parseFloat(raw.createdAt as string) * 1000 || Date.now(),
  };
}

/** Convert OnChainProfile → partial GameState for merging into local store */
export function profileToGameState(profile: OnChainProfile): Partial<GameState> {
  return {
    petName: profile.petName,
    trainerName: profile.trainerName,
    hearts: profile.hearts,
    lastFedAt: profile.lastFedAt,
    nuggets: profile.nuggets,
    depositBalance: profile.depositBalance,
    usdcDepositBalance: profile.usdcDepositBalance,
    totalYieldEarned: profile.totalYieldEarned,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastLoginDate: profile.lastLoginDate,
    dailyBonusClaimed: profile.dailyBonusClaimed,
    ownedFurniture: profile.ownedFurniture,
    placedFurniture: profile.placedFurniture,
    foodInventory: profile.foodInventory,
    transactions: profile.transactions,
    createdAt: profile.createdAt,
  };
}

export function useOnChainGame() {
  const { address, magicAuthz } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: send a transaction and wait for seal
  const sendTx = useCallback(
    async (cadence: string, args: (arg: typeof fcl.arg) => unknown[]) => {
      if (!magicAuthz) throw new Error("Not authenticated");
      const txId = await fcl.mutate({
        cadence,
        args,
        limit: 9999,
        authorizations: [magicAuthz],
        payer: magicAuthz,
        proposer: magicAuthz,
      });
      await fcl.tx(txId).onceSealed();
      return txId;
    },
    [magicAuthz]
  );

  // Helper: wrap an async action with loading/error state
  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fn();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setError(msg);
        console.error("On-chain action failed:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /** Read full game state from chain */
  const getProfile = useCallback(async (): Promise<OnChainProfile | null> => {
    if (!address) return null;
    try {
      const result = await fcl.query({
        cadence: GET_PROFILE,
        args: (arg: typeof fcl.arg) => [arg(address, t.Address)],
      });
      if (!result) return null;
      return parseProfile(result);
    } catch {
      return null;
    }
  }, [address]);

  /** Setup profile resource (idempotent) */
  const setupProfile = useCallback(async (): Promise<boolean> => {
    const result = await withLoading(async () => {
      await sendTx(SETUP_PROFILE, () => []);
      return true;
    });
    return result === true;
  }, [sendTx, withLoading]);

  /** Feed the pet */
  const feedOnChain = useCallback(
    async (foodId?: string, heartRestore: number = 1): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_FEED, (arg) => [
          arg(foodId || "", t.String),
          arg(String(heartRestore), t.UInt8),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Buy food */
  const buyFoodOnChain = useCallback(
    async (foodId: string, price: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_BUY_FOOD, (arg) => [
          arg(foodId, t.String),
          arg(String(price), t.UInt64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Buy furniture */
  const buyFurnitureOnChain = useCallback(
    async (furnitureId: string, price: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_BUY_FURNITURE, (arg) => [
          arg(furnitureId, t.String),
          arg(String(price), t.UInt64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Place furniture */
  const placeFurnitureOnChain = useCallback(
    async (furnitureId: string): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_PLACE_FURNITURE, (arg) => [
          arg(furnitureId, t.String),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Remove furniture */
  const removeFurnitureOnChain = useCallback(
    async (furnitureId: string): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_REMOVE_FURNITURE, (arg) => [
          arg(furnitureId, t.String),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Set pet name */
  const setPetNameOnChain = useCallback(
    async (name: string): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_SET_PET_NAME, (arg) => [arg(name, t.String)]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Set trainer name */
  const setTrainerNameOnChain = useCallback(
    async (name: string): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_SET_TRAINER_NAME, (arg) => [arg(name, t.String)]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Claim daily login bonus */
  const checkDailyLoginOnChain = useCallback(
    async (today: string, yesterday: string, bonusAmount: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_DAILY_LOGIN, (arg) => [
          arg(today, t.String),
          arg(yesterday, t.String),
          arg(String(bonusAmount), t.UInt64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Sync yield accrual to chain */
  const accrueYieldOnChain = useCallback(
    async (pyusdEarned: number, usdcEarned: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_ACCRUE_YIELD, (arg) => [
          arg(pyusdEarned.toFixed(8), t.UFix64),
          arg(usdcEarned.toFixed(8), t.UFix64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Record PYUSD0 deposit */
  const depositOnChain = useCallback(
    async (amount: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_DEPOSIT, (arg) => [
          arg(amount.toFixed(8), t.UFix64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Record stgUSDC deposit */
  const depositUsdcOnChain = useCallback(
    async (amount: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_DEPOSIT_USDC, (arg) => [
          arg(amount.toFixed(8), t.UFix64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Record PYUSD0 withdrawal */
  const withdrawOnChain = useCallback(
    async (amount: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_WITHDRAW, (arg) => [
          arg(amount.toFixed(8), t.UFix64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Record stgUSDC withdrawal */
  const withdrawUsdcOnChain = useCallback(
    async (amount: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_WITHDRAW_USDC, (arg) => [
          arg(amount.toFixed(8), t.UFix64),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  /** Sync heart count to chain */
  const setHeartsOnChain = useCallback(
    async (hearts: number): Promise<boolean> => {
      const result = await withLoading(async () => {
        await sendTx(PROFILE_SET_HEARTS, (arg) => [
          arg(String(hearts), t.UInt8),
        ]);
        return true;
      });
      return result === true;
    },
    [sendTx, withLoading]
  );

  return {
    isLoading,
    error,
    getProfile,
    setupProfile,
    feedOnChain,
    buyFoodOnChain,
    buyFurnitureOnChain,
    placeFurnitureOnChain,
    removeFurnitureOnChain,
    setPetNameOnChain,
    setTrainerNameOnChain,
    checkDailyLoginOnChain,
    accrueYieldOnChain,
    depositOnChain,
    depositUsdcOnChain,
    withdrawOnChain,
    withdrawUsdcOnChain,
    setHeartsOnChain,
  };
}

"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useUsdcVault } from "@/hooks/useUsdcVault";

/**
 * Global hook: polls for stgUSDC in the user's COA every 10s.
 * When a balance is detected, auto-deposits it into MoreMarkets to earn yield.
 * Mount this once at the app level (page.tsx).
 */
export function useAutoDeposit() {
  const { address } = useAuth();
  const { getStgUsdcBalance, depositUsdc, isLoading } = useUsdcVault();
  const depositingRef = useRef(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    const poll = async () => {
      if (depositingRef.current) return;

      const bal = await getStgUsdcBalance();
      if (cancelled || bal <= 0 || depositingRef.current) return;

      depositingRef.current = true;
      console.log(`[auto-deposit] Detected $${bal.toFixed(2)} stgUSDC, depositing...`);
      const success = await depositUsdc(bal);
      if (!cancelled) {
        if (success) {
          console.log(`[auto-deposit] $${bal.toFixed(2)} deposited to MoreMarkets`);
        } else {
          console.warn("[auto-deposit] Deposit failed, will retry next poll");
        }
        depositingRef.current = false;
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [address, getStgUsdcBalance, depositUsdc]);
}

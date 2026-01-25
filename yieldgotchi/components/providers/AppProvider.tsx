'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Guardian, Vault, ArmorItem, ActivityEvent, WalletState } from '@/lib/types';
import * as mockChain from '@/lib/mockChain';
import { calculateAccruedYield } from '@/lib/gameLogic';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'levelup';
}

interface AppContextType {
  // State
  wallet: string | null; // wallet address or null if not connected
  guardian: Guardian | null;
  vault: Vault | null;
  armor: ArmorItem[];
  activity: ActivityEvent[];
  isLoading: boolean;
  realTimeYield: number;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  mintGuardian: (name: string) => Promise<boolean>;
  deposit: (amount: number) => Promise<{ leveledUp: boolean }>;
  withdraw: (amount: number) => Promise<{ leveledDown: boolean; died: boolean }>;
  claimYieldAndBuyArmor: () => Promise<ArmorItem | null>;
  toggleArmorEquip: (armorId: string) => Promise<void>;
  refreshState: () => Promise<void>;
  resetState: () => Promise<void>;
  
  // Toast
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  
  // Confetti
  showConfetti: boolean;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({ connected: false, address: null });
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [armor, setArmor] = useState<ArmorItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeYield, setRealTimeYield] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Derive wallet address from state
  const wallet = walletState.address;

  // Real-time yield ticker
  useEffect(() => {
    if (!vault || vault.principal <= 0) {
      setRealTimeYield(0);
      return;
    }

    const updateYield = () => {
      const pendingYield = calculateAccruedYield(
        vault.principal,
        vault.apy,
        vault.lastUpdatedAt
      );
      setRealTimeYield(vault.accruedYield + pendingYield);
    };

    updateYield();
    const interval = setInterval(updateYield, 1000);
    return () => clearInterval(interval);
  }, [vault]);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const state = await mockChain.getFullState();
        setWalletState(state.wallet);
        setGuardian(state.guardian);
        setVault(state.vault);
        setArmor(state.armor);
        setActivity(state.activity);
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const refreshState = useCallback(async () => {
    const state = await mockChain.getFullState();
    setWalletState(state.wallet);
    setGuardian(state.guardian);
    setVault(state.vault);
    setArmor(state.armor);
    setActivity(state.activity);
  }, []);

  const resetState = useCallback(async () => {
    await mockChain.resetState();
    setWalletState({ connected: false, address: null });
    setGuardian(null);
    setVault(null);
    setArmor([]);
    setActivity([]);
    addToast('All data has been reset', 'info');
  }, [addToast]);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const newWalletState = await mockChain.connectWallet();
      setWalletState(newWalletState);
      await refreshState();
      addToast('Wallet connected!', 'success');
    } catch (error) {
      addToast('Failed to connect wallet', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshState, addToast]);

  const disconnectWallet = useCallback(async () => {
    await mockChain.disconnectWallet();
    setWalletState({ connected: false, address: null });
    setGuardian(null);
    setVault(null);
    setArmor([]);
    setActivity([]);
    addToast('Wallet disconnected', 'info');
  }, [addToast]);

  const mintGuardian = useCallback(async (name: string): Promise<boolean> => {
    if (!wallet) return false;
    setIsLoading(true);
    try {
      await mockChain.mintGuardian(wallet, name);
      await refreshState();
      addToast(`${name} has been born!`, 'success');
      triggerConfetti();
      return true;
    } catch (error) {
      addToast('Failed to mint guardian', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, refreshState, addToast, triggerConfetti]);

  const deposit = useCallback(async (amount: number) => {
    if (!wallet) return { leveledUp: false };
    setIsLoading(true);
    try {
      const result = await mockChain.depositUSDC(wallet, amount);
      await refreshState();
      triggerConfetti();
      
      if (result.leveledUp) {
        addToast(`Level Up! Your guardian evolved to ${result.guardian.stage}!`, 'levelup');
      } else {
        addToast(`Deposited $${amount.toFixed(2)} successfully!`, 'success');
      }
      
      return { leveledUp: result.leveledUp };
    } catch (error) {
      addToast('Deposit failed', 'error');
      return { leveledUp: false };
    } finally {
      setIsLoading(false);
    }
  }, [wallet, refreshState, addToast, triggerConfetti]);

  const withdraw = useCallback(async (amount: number) => {
    if (!wallet) return { leveledDown: false, died: false };
    setIsLoading(true);
    try {
      const result = await mockChain.withdrawUSDC(wallet, amount);
      await refreshState();
      
      if (result.died) {
        addToast('Your guardian has perished...', 'error');
      } else if (result.leveledDown) {
        addToast(`Your guardian regressed to ${result.guardian.stage}`, 'warning');
      } else {
        addToast(`Withdrew $${amount.toFixed(2)}`, 'info');
      }
      
      return { leveledDown: result.leveledDown, died: result.died };
    } catch (error) {
      addToast('Withdrawal failed', 'error');
      return { leveledDown: false, died: false };
    } finally {
      setIsLoading(false);
    }
  }, [wallet, refreshState, addToast]);

  const claimYieldAndBuyArmorFn = useCallback(async () => {
    if (!wallet) return null;
    setIsLoading(true);
    try {
      const result = await mockChain.claimYieldAndBuyArmor(wallet);
      await refreshState();
      
      if (result.armor) {
        triggerConfetti();
        addToast(`New ${result.armor.rarity} armor: ${result.armor.name}!`, 'success');
        return result.armor;
      } else {
        addToast('Not enough yield for armor yet', 'info');
        return null;
      }
    } catch (error) {
      addToast('Failed to claim armor', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, refreshState, addToast, triggerConfetti]);

  const toggleArmorEquipFn = useCallback(async (armorId: string) => {
    if (!wallet) return;
    try {
      const updatedArmor = await mockChain.toggleArmorEquip(wallet, armorId);
      setArmor(updatedArmor);
      
      const item = updatedArmor.find(a => a.id === armorId);
      if (item) {
        addToast(item.equipped ? `Equipped ${item.name}` : `Unequipped ${item.name}`, 'info');
      }
    } catch (error) {
      addToast('Failed to update armor', 'error');
    }
  }, [wallet, addToast]);

  return (
    <AppContext.Provider
      value={{
        wallet,
        guardian,
        vault,
        armor,
        activity,
        isLoading,
        realTimeYield,
        connectWallet,
        disconnectWallet,
        mintGuardian,
        deposit,
        withdraw,
        claimYieldAndBuyArmor: claimYieldAndBuyArmorFn,
        toggleArmorEquip: toggleArmorEquipFn,
        refreshState,
        resetState,
        toasts,
        addToast,
        removeToast,
        showConfetti,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

'use client';

import React from 'react';
import { Vault } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatPercentage, daysBetween, formatDuration, getArmorUnlockProgress, getYieldToNextArmor } from '@/lib/gameLogic';
import { ARMOR_UNLOCK_THRESHOLD } from '@/lib/constants';
import { TrendingUp, Lock, Gift, Clock } from 'lucide-react';

interface VaultCardProps {
  vault: Vault;
  realTimeYield: number;
  compact?: boolean;
}

export function VaultCard({ vault, realTimeYield, compact = false }: VaultCardProps) {
  const daysLocked = daysBetween(vault.depositedAt, Date.now());
  const unlockProgress = getArmorUnlockProgress(vault.totalYieldClaimed + realTimeYield);
  const yieldToNextArmor = getYieldToNextArmor(vault.totalYieldClaimed + realTimeYield);

  if (compact) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-vault-muted">Principal</p>
              <p className="text-lg font-bold text-white">{formatCurrency(vault.principal)}</p>
            </div>
            <div>
              <p className="text-xs text-vault-muted">Yield</p>
              <p className="text-lg font-bold text-vault-success">{formatCurrency(realTimeYield)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glow={vault.principal > 0}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-vault-accent" />
          Vault Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Principal and APY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-vault-bg rounded-xl p-4">
            <div className="flex items-center gap-2 text-vault-muted mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Principal Locked</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(vault.principal)}</p>
          </div>
          <div className="bg-vault-bg rounded-xl p-4">
            <div className="flex items-center gap-2 text-vault-muted mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">APY</span>
            </div>
            <p className="text-2xl font-bold text-vault-success">{formatPercentage(vault.apy)}</p>
          </div>
        </div>

        {/* Yield and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-vault-bg rounded-xl p-4">
            <div className="flex items-center gap-2 text-vault-muted mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Yield Accrued</span>
            </div>
            <p className="text-2xl font-bold text-vault-success animate-pulse">
              {formatCurrency(realTimeYield)}
            </p>
          </div>
          <div className="bg-vault-bg rounded-xl p-4">
            <div className="flex items-center gap-2 text-vault-muted mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Time Locked</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatDuration(daysLocked)}</p>
          </div>
        </div>

        {/* Next armor unlock progress */}
        <div className="bg-vault-bg rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-vault-muted">
              <Gift className="w-4 h-4" />
              <span className="text-sm">Next Armor Unlock</span>
            </div>
            <span className="text-sm text-vault-accent">
              {formatCurrency(yieldToNextArmor)} to go
            </span>
          </div>
          <div className="h-3 bg-vault-card rounded-full overflow-hidden">
            <div 
              className="h-full progress-bar rounded-full"
              style={{ width: `${unlockProgress}%` }}
            />
          </div>
          <p className="text-xs text-vault-muted mt-1">
            Unlock armor every ${ARMOR_UNLOCK_THRESHOLD} yield earned
          </p>
        </div>

        {/* Total claimed */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-vault-muted">Total Yield Claimed</span>
          <span className="text-white font-medium">{formatCurrency(vault.totalYieldClaimed)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

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
              <p className="text-xs text-pastel-textLight font-medium">Principal</p>
              <p className="text-lg font-bold text-pastel-text">{formatCurrency(vault.principal)}</p>
            </div>
            <div>
              <p className="text-xs text-pastel-textLight font-medium">Yield</p>
              <p className="text-lg font-bold text-pastel-success">{formatCurrency(realTimeYield)}</p>
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
          <Lock className="w-5 h-5 text-pastel-pink" />
          Vault Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Principal and APY */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-pastel-cream to-pastel-peach/30 rounded-2xl p-4 border border-pastel-border">
            <div className="flex items-center gap-2 text-pastel-textLight mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">Principal</span>
            </div>
            <p className="text-xl font-bold text-pastel-text">{formatCurrency(vault.principal)}</p>
          </div>
          <div className="bg-gradient-to-br from-pastel-mint/30 to-pastel-blue/20 rounded-2xl p-4 border border-pastel-border">
            <div className="flex items-center gap-2 text-pastel-textLight mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">APY</span>
            </div>
            <p className="text-xl font-bold text-pastel-success">{formatPercentage(vault.apy)}</p>
          </div>
        </div>

        {/* Yield and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-pastel-blue/20 to-pastel-lavender/20 rounded-2xl p-4 border border-pastel-border">
            <div className="flex items-center gap-2 text-pastel-textLight mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Yield</span>
            </div>
            <p className="text-xl font-bold text-pastel-success animate-pulse">
              {formatCurrency(realTimeYield)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-pastel-peach/30 to-pastel-pink/20 rounded-2xl p-4 border border-pastel-border">
            <div className="flex items-center gap-2 text-pastel-textLight mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Locked</span>
            </div>
            <p className="text-xl font-bold text-pastel-text">{formatDuration(daysLocked)}</p>
          </div>
        </div>

        {/* Next armor unlock progress */}
        <div className="bg-pastel-cream rounded-2xl p-4 border border-pastel-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-pastel-textLight">
              <Gift className="w-4 h-4" />
              <span className="text-xs font-semibold">Next Armor</span>
            </div>
            <span className="text-xs text-pastel-pink font-bold">
              {formatCurrency(yieldToNextArmor)} to go
            </span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden border border-pastel-border">
            <div
              className="h-full bg-gradient-to-r from-pastel-pink to-pastel-lavender rounded-full transition-all duration-500"
              style={{ width: `${unlockProgress}%` }}
            />
          </div>
          <p className="text-xs text-pastel-textLight mt-1 font-medium">
            Unlock every ${ARMOR_UNLOCK_THRESHOLD} yield
          </p>
        </div>

        {/* Total claimed */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-pastel-border">
          <span className="text-pastel-textLight font-medium">Total Claimed</span>
          <span className="text-pastel-text font-bold">{formatCurrency(vault.totalYieldClaimed)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

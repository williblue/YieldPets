'use client';

import React from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { Coins, Heart, Zap, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TopHUD() {
  const { wallet, vault, guardian, connectWallet, isLoading } = useApp();

  if (!wallet?.connected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-pastel-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-pink to-pastel-lavender flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">
                YieldPets
              </span>
            </div>
            <Button onClick={connectWallet} isLoading={isLoading} size="sm">
              <Wallet className="w-4 h-4" />
              Connect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalValue = vault ? vault.principal + vault.accruedYield : 0;
  const moodPercent = guardian ? guardian.mood : 0;
  const totalHearts = 5;
  const filledHearts = Math.ceil((moodPercent / 100) * totalHearts);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-pastel-border shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Coins */}
          <div className="flex items-center gap-2 bg-pastel-cream rounded-full px-3 py-1.5 shadow-sm border border-pastel-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-pastel-text text-sm">
              {totalValue.toFixed(0)}
            </span>
          </div>

          {/* Center: Hearts */}
          <div className="flex items-center gap-1 bg-pastel-cream rounded-full px-3 py-1.5 shadow-sm border border-pastel-border">
            {[...Array(totalHearts)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < filledHearts
                    ? 'text-red-400 fill-red-400'
                    : 'text-gray-300 fill-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Right: Energy/Stage */}
          <div className="flex items-center gap-2 bg-pastel-cream rounded-full px-3 py-1.5 shadow-sm border border-pastel-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pastel-blue to-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-pastel-text text-sm capitalize">
              {guardian?.stage || 'egg'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

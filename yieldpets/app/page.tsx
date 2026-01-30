'use client';

import React from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { GuardianCard } from '@/components/guardian/GuardianCard';
import { VaultCard } from '@/components/vault/VaultCard';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { EquipSlots } from '@/components/armory/EquipSlots';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Wallet, Sparkles, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { wallet, guardian, vault, armor, activity, connectWallet, isLoading } = useApp();

  // Not connected state
  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-8 animate-float">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pastel-pink to-pastel-lavender flex items-center justify-center shadow-lg">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-pastel-pink flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-pastel-pink" />
          </div>
        </div>

        <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
          Welcome to YieldPets
        </h1>
        <p className="text-pastel-textLight max-w-md mb-8 text-base">
          Mint your Vault Guardian, deposit USDC, and watch it grow.
          Your principal earns yield while your guardian evolves!
        </p>

        <Button onClick={connectWallet} isLoading={isLoading} size="lg">
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </Button>

        <div className="grid grid-cols-3 gap-6 mt-12 max-w-md w-full">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pastel-pink to-pastel-pinkDark flex items-center justify-center mx-auto mb-3 shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-pastel-text font-semibold">Mint Guardian</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pastel-mint to-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-pastel-text font-semibold">Earn Yield</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pastel-lavender to-purple-400 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-pastel-text font-semibold">Unlock Armor</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected but no guardian
  if (!guardian) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-8">
          <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center border-4 border-dashed border-pastel-pink shadow-lg">
            <div className="text-6xl animate-float">🥚</div>
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold mb-4 text-pastel-text">
          Your Guardian Awaits
        </h1>
        <p className="text-pastel-textLight max-w-md mb-8">
          Mint your unique Vault Guardian to start earning yield
          and collecting armor. Your journey begins here!
        </p>

        <Link href="/mint">
          <Button size="lg">
            <Sparkles className="w-5 h-5" />
            Mint Guardian
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Full dashboard with guardian
  const equippedArmor = armor.filter(item => item.equipped);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero Section */}
      <div className="grid gap-4">
        <GuardianCard guardian={guardian} vault={vault} equippedArmor={equippedArmor} />
        <VaultCard vault={vault} guardian={guardian} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 justify-center">
        <Link href="/vault" className="flex-1">
          <Button className="w-full">
            <TrendingUp className="w-4 h-4" />
            Manage Vault
          </Button>
        </Link>
        <Link href="/armory" className="flex-1">
          <Button variant="secondary" className="w-full">
            <Shield className="w-4 h-4" />
            Armory ({armor.length})
          </Button>
        </Link>
      </div>

      {/* Secondary Info */}
      <div className="grid gap-4">
        <EquipSlots equippedArmor={equippedArmor} />
        <ActivityTimeline events={activity} limit={5} />
      </div>
    </div>
  );
}

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-vault-accent/20 to-purple-500/20 flex items-center justify-center animate-pulse-glow">
            <Shield className="w-16 h-16 text-vault-accent" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-vault-card border-2 border-vault-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-vault-accent" />
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
          Welcome to YieldGotchi
        </h1>
        <p className="text-vault-muted max-w-md mb-8">
          Mint your Vault Guardian, deposit USDC, and watch it grow. 
          Your principal earns yield while your guardian evolves!
        </p>
        
        <Button onClick={connectWallet} isLoading={isLoading} size="lg">
          <Wallet className="w-5 h-5 mr-2" />
          Connect Wallet
        </Button>

        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl w-full">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-vault-accent/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-vault-accent" />
            </div>
            <p className="text-sm text-vault-muted">Mint Guardian</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-vault-success/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-vault-success" />
            </div>
            <p className="text-sm text-vault-muted">Earn Yield</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm text-vault-muted">Unlock Armor</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected but no guardian
  if (!guardian) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-8">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-vault-accent/10 to-purple-500/10 flex items-center justify-center border-2 border-dashed border-vault-border">
            <div className="text-6xl animate-float">🥚</div>
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-4">
          Your Guardian Awaits
        </h1>
        <p className="text-vault-muted max-w-md mb-8">
          Mint your unique Vault Guardian to start earning yield 
          and collecting armor. Your journey begins here!
        </p>
        
        <Link href="/mint">
          <Button size="lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Mint Guardian
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  // Full dashboard with guardian
  const equippedArmor = armor.filter(item => item.equipped);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GuardianCard guardian={guardian} vault={vault} equippedArmor={equippedArmor} />
        <VaultCard vault={vault} guardian={guardian} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/vault">
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                Manage Vault
              </Button>
            </Link>
            <Link href="/armory">
              <Button variant="secondary">
                <Shield className="w-4 h-4 mr-2" />
                View Armory ({armor.length})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EquipSlots equippedArmor={equippedArmor} />
        <ActivityTimeline events={activity} limit={5} />
      </div>
    </div>
  );
}

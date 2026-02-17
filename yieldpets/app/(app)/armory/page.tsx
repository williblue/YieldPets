'use client';

import React from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { GuardianSVG } from '@/components/guardian/GuardianSVG';
import { ArmorGrid } from '@/components/armory/ArmorGrid';
import { EquipSlots } from '@/components/armory/EquipSlots';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  ArrowLeft, 
  Shield, 
  Wallet, 
  Sparkles,
  TrendingUp,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, calculateArmorUnlockProgress } from '@/lib/gameLogic';
import { ARMOR_UNLOCK_THRESHOLD } from '@/lib/constants';

export default function ArmoryPage() {
  const { 
    wallet, 
    guardian, 
    vault,
    armor, 
    toggleArmorEquip, 
    connectWallet, 
    isLoading 
  } = useApp();

  // Not connected
  if (!wallet) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Wallet className="w-16 h-16 text-vault-muted mx-auto mb-6" />
        <h1 className="text-2xl font-display font-bold mb-4">
          Connect Wallet
        </h1>
        <p className="text-vault-muted mb-6">
          Connect your wallet to view your armory.
        </p>
        <Button onClick={connectWallet} isLoading={isLoading}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  // No guardian
  if (!guardian) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Shield className="w-16 h-16 text-vault-muted mx-auto mb-6" />
        <h1 className="text-2xl font-display font-bold mb-4">
          Mint Your Guardian First
        </h1>
        <p className="text-vault-muted mb-6">
          You need a guardian to collect and equip armor.
        </p>
        <Link href="/mint">
          <Button>Mint Guardian</Button>
        </Link>
      </div>
    );
  }

  const equippedArmor = armor.filter(item => item.equipped);
  const unlockProgress = vault ? calculateArmorUnlockProgress(vault.accruedYield) : { current: 0, threshold: ARMOR_UNLOCK_THRESHOLD, percentage: 0 };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-vault-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-vault-accent" />
            Armory
          </h1>
          <p className="text-vault-muted mt-1">
            Equip your guardian with collected armor
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-vault-muted">Total Collected</p>
          <p className="text-2xl font-display font-bold text-vault-accent">
            {armor.length}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Guardian Preview */}
        <div className="space-y-4">
          <Card glow>
            <CardContent className="py-6">
              <div className="w-48 h-48 mx-auto mb-4">
                <GuardianSVG 
                  stage={guardian.stage} 
                  mood={guardian.mood}
                  equippedArmor={equippedArmor}
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-display font-bold">{guardian.name}</h2>
                <p className="text-sm text-vault-muted capitalize">{guardian.stage} Stage</p>
              </div>
            </CardContent>
          </Card>

          <EquipSlots equippedArmor={equippedArmor} />

          {/* Next Unlock Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Next Armor Unlock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-vault-muted">Progress</span>
                  <span className="text-white font-medium">
                    {formatCurrency(unlockProgress.current)} / {formatCurrency(unlockProgress.threshold)}
                  </span>
                </div>
                <div className="h-2 bg-vault-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-vault-accent transition-all duration-500"
                    style={{ width: `${unlockProgress.percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-vault-muted">
                  <TrendingUp className="w-3 h-3" />
                  <span>Earn more yield to unlock armor</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Armor Collection */}
        <div className="lg:col-span-2">
          {armor.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-vault-border/50 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-vault-muted" />
                </div>
                <h2 className="text-xl font-display font-bold mb-2">
                  No Armor Yet
                </h2>
                <p className="text-vault-muted max-w-sm mx-auto mb-6">
                  Earn yield from your vault deposits to automatically unlock 
                  armor pieces for your guardian.
                </p>
                <div className="p-4 bg-vault-bg rounded-lg inline-block">
                  <p className="text-sm text-vault-muted mb-1">Unlock threshold</p>
                  <p className="text-xl font-display font-bold text-vault-accent">
                    {formatCurrency(ARMOR_UNLOCK_THRESHOLD)} yield
                  </p>
                </div>
                <div className="mt-6">
                  <Link href="/vault">
                    <Button>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Make a Deposit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ArmorGrid 
              armor={armor} 
              onToggleEquip={toggleArmorEquip}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

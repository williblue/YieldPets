'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { GuardianSVG } from '@/components/guardian/GuardianSVG';
import { VaultCard } from '@/components/vault/VaultCard';
import { DepositForm } from '@/components/vault/DepositForm';
import { WithdrawForm } from '@/components/vault/WithdrawForm';
import { StageIndicator } from '@/components/guardian/StageIndicator';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Wallet, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type Tab = 'deposit' | 'withdraw';

export default function VaultPage() {
  const { wallet, guardian, vault, armor, connectWallet, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('deposit');

  // Not connected
  if (!wallet) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Wallet className="w-16 h-16 text-vault-muted mx-auto mb-6" />
        <h1 className="text-2xl font-display font-bold mb-4">
          Connect Wallet
        </h1>
        <p className="text-vault-muted mb-6">
          Connect your wallet to access your vault.
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
        <div className="text-7xl mb-6 animate-float">🥚</div>
        <h1 className="text-2xl font-display font-bold mb-4">
          Mint Your Guardian First
        </h1>
        <p className="text-vault-muted mb-6">
          You need a guardian before you can use the vault.
        </p>
        <Link href="/mint">
          <Button>Mint Guardian</Button>
        </Link>
      </div>
    );
  }

  const equippedArmor = armor.filter(item => item.equipped);
  const isDead = guardian.stage === 'dead';

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-vault-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Guardian Preview - Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="py-6">
              <div className="w-40 h-40 mx-auto mb-4">
                <GuardianSVG 
                  stage={guardian.stage} 
                  mood={guardian.mood}
                  equippedArmor={equippedArmor}
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-display font-bold">{guardian.name}</h2>
                <StageIndicator stage={guardian.stage} size="sm" />
              </div>
            </CardContent>
          </Card>

          {isDead && (
            <Card className="border-vault-danger">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-vault-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-vault-danger">Guardian is Dead</p>
                    <p className="text-xs text-vault-muted mt-1">
                      Make a deposit to revive your guardian!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <VaultCard vault={vault} guardian={guardian} compact />
        </div>

        {/* Deposit/Withdraw Forms - Main Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="border-b border-vault-border">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                    font-medium transition-all
                    ${activeTab === 'deposit'
                      ? 'bg-vault-accent text-white'
                      : 'bg-vault-bg text-vault-muted hover:text-white'
                    }
                  `}
                >
                  <ArrowUpCircle className="w-5 h-5" />
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                    font-medium transition-all
                    ${activeTab === 'withdraw'
                      ? 'bg-vault-danger text-white'
                      : 'bg-vault-bg text-vault-muted hover:text-white'
                    }
                  `}
                >
                  <ArrowDownCircle className="w-5 h-5" />
                  Withdraw
                </button>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              {activeTab === 'deposit' ? (
                <DepositForm />
              ) : (
                <WithdrawForm />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

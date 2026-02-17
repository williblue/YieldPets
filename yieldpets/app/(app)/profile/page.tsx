'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { GuardianSVG } from '@/components/guardian/GuardianSVG';
import { StageProgress } from '@/components/guardian/StageIndicator';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowLeft, 
  User, 
  Wallet, 
  Clock, 
  TrendingUp, 
  Shield,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatTimeAgo, calculateGrowthScore } from '@/lib/gameLogic';

export default function ProfilePage() {
  const { 
    wallet, 
    guardian, 
    vault, 
    armor,
    activity, 
    connectWallet, 
    disconnectWallet,
    resetState,
    isLoading 
  } = useApp();
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not connected
  if (!wallet) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <User className="w-16 h-16 text-vault-muted mx-auto mb-6" />
        <h1 className="text-2xl font-display font-bold mb-4">
          Connect Wallet
        </h1>
        <p className="text-vault-muted mb-6">
          Connect your wallet to view your profile.
        </p>
        <Button onClick={connectWallet} isLoading={isLoading}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  const equippedArmor = armor.filter(item => item.equipped);
  const growthScore = vault && guardian 
    ? calculateGrowthScore(vault.principal, vault.depositedAt)
    : 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-vault-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-display font-bold flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-vault-accent" />
        Profile
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="space-y-4">
          {/* Wallet Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-vault-accent" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-vault-bg px-3 py-2 rounded-lg truncate">
                  {wallet}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-vault-bg rounded-lg transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-vault-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-vault-muted" />
                  )}
                </button>
              </div>
              <Button 
                variant="secondary" 
                onClick={disconnectWallet}
                className="w-full"
              >
                Disconnect
              </Button>
            </CardContent>
          </Card>

          {/* Guardian Stats */}
          {guardian && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-vault-accent" />
                  Guardian Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-32 h-32 mx-auto">
                  <GuardianSVG 
                    stage={guardian.stage} 
                    mood={guardian.mood}
                    equippedArmor={equippedArmor}
                  />
                </div>
                
                <div className="text-center border-b border-vault-border pb-4">
                  <h3 className="font-display font-bold text-lg">{guardian.name}</h3>
                  <p className="text-sm text-vault-muted capitalize">{guardian.stage} Stage</p>
                </div>

                <StageProgress stage={guardian.stage} growthScore={growthScore} />

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-vault-bg rounded-lg">
                    <p className="text-xs text-vault-muted">Mood</p>
                    <p className="text-lg font-bold">{guardian.mood}%</p>
                  </div>
                  <div className="p-3 bg-vault-bg rounded-lg">
                    <p className="text-xs text-vault-muted">Armor</p>
                    <p className="text-lg font-bold">{armor.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-vault-muted">
                  <Clock className="w-3 h-3" />
                  <span>Created {formatTimeAgo(guardian.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vault Stats */}
          {vault && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-vault-success" />
                  Vault Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-vault-muted">Principal</span>
                    <span className="font-medium">{formatCurrency(vault.principal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vault-muted">Total Yield</span>
                    <span className="font-medium text-vault-success">
                      {formatCurrency(vault.accruedYield)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vault-muted">APY</span>
                    <span className="font-medium">{(vault.apy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vault-muted">Deposited</span>
                    <span className="font-medium">{formatTimeAgo(vault.depositedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-vault-danger/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-vault-danger">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-vault-muted mb-4">
                Reset all data including your guardian, vault, and armor. 
                This action cannot be undone.
              </p>
              <Button 
                variant="danger"
                onClick={() => setShowResetModal(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity History */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-vault-accent" />
            Activity History
          </h2>
          <ActivityTimeline events={activity} />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Data?"
      >
        <div className="space-y-4">
          <div className="p-4 bg-vault-danger/10 border border-vault-danger/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-vault-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-vault-danger">This cannot be undone!</p>
                <p className="text-sm text-vault-muted mt-1">
                  You will lose your guardian, all vault deposits, armor collection, 
                  and activity history.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowResetModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={async () => {
                await resetState();
                setShowResetModal(false);
              }}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

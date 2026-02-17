'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { GuardianSVG } from '@/components/guardian/GuardianSVG';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sparkles, ArrowLeft, Check, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function MintPage() {
  const router = useRouter();
  const { wallet, guardian, mintGuardian, isLoading, connectWallet } = useApp();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'name' | 'confirm' | 'success'>('name');

  // Already has a guardian
  if (guardian) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-48 h-48 mx-auto mb-6">
          <GuardianSVG stage={guardian.stage} mood={guardian.mood} />
        </div>
        <h1 className="text-2xl font-display font-bold mb-4">
          You Already Have a Guardian!
        </h1>
        <p className="text-vault-muted mb-6">
          Meet <span className="text-vault-accent font-semibold">{guardian.name}</span>, 
          your loyal companion.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Not connected
  if (!wallet) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <div className="text-7xl animate-float">🥚</div>
        </div>
        <h1 className="text-2xl font-display font-bold mb-4">
          Connect to Mint
        </h1>
        <p className="text-vault-muted mb-6">
          Connect your wallet to mint your Vault Guardian.
        </p>
        <Button onClick={connectWallet} isLoading={isLoading}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  const handleMint = async () => {
    if (!name.trim()) return;
    const success = await mintGuardian(name.trim());
    if (success) {
      setStep('success');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-vault-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      {step === 'success' ? (
        <div className="text-center py-12 animate-scale-in">
          <div className="w-48 h-48 mx-auto mb-6">
            <GuardianSVG stage="egg" mood={100} />
          </div>
          <div className="w-16 h-16 rounded-full bg-vault-success/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-vault-success" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4 gradient-text">
            {name} Has Been Born!
          </h1>
          <p className="text-vault-muted">
            Redirecting to your dashboard...
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-56 h-56 mb-4">
              <GuardianSVG 
                stage="egg" 
                mood={100} 
              />
            </div>
            <p className="text-vault-muted text-sm text-center">
              Your guardian starts as an egg and evolves as you deposit!
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-vault-accent" />
                  Mint Your Guardian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 'name' && (
                  <>
                    <Input
                      label="Guardian Name"
                      placeholder="Enter a name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={20}
                    />
                    <Button 
                      onClick={() => setStep('confirm')}
                      disabled={!name.trim()}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </>
                )}

                {step === 'confirm' && (
                  <>
                    <div className="p-4 bg-vault-bg rounded-lg border border-vault-border">
                      <p className="text-sm text-vault-muted mb-2">Guardian Name</p>
                      <p className="text-xl font-display font-bold text-vault-accent">
                        {name}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-vault-accent/5 rounded-lg">
                        <Zap className="w-5 h-5 text-vault-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Free to Mint</p>
                          <p className="text-xs text-vault-muted">No gas fees in this demo</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-vault-success/5 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-vault-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Earn 8% APY</p>
                          <p className="text-xs text-vault-muted">On your deposited USDC</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-500/5 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Unlock Armor</p>
                          <p className="text-xs text-vault-muted">Every $5 yield earned</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        onClick={() => setStep('name')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleMint}
                        isLoading={isLoading}
                        className="flex-1"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Mint Guardian
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StageIndicator } from '@/components/guardian/StageIndicator';
import { GuardianSVG } from '@/components/guardian/GuardianSVG';
import { Vault, Guardian, GuardianStage } from '@/lib/types';
import { getStageAfterWithdrawal, formatCurrency } from '@/lib/gameLogic';
import { Minus, AlertTriangle, ArrowDown, Skull, ChevronRight } from 'lucide-react';

interface WithdrawFormProps {
  vault: Vault;
  guardian: Guardian;
  onWithdraw: (amount: number) => Promise<{ leveledDown: boolean; died: boolean }>;
  isLoading: boolean;
}

export function WithdrawForm({ vault, guardian, onWithdraw, isLoading }: WithdrawFormProps) {
  const [amount, setAmount] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState('');

  const withdrawAmount = parseFloat(amount) || 0;
  
  const projectedStage = useMemo(() => {
    if (withdrawAmount <= 0) return guardian.stage;
    return getStageAfterWithdrawal(
      vault.principal,
      withdrawAmount,
      vault.depositedAt
    );
  }, [withdrawAmount, vault, guardian.stage]);

  const willDie = projectedStage === 'dead';
  const willLevelDown = projectedStage !== guardian.stage && !willDie;

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (value > vault.principal) {
      setError('Amount exceeds available principal');
      return;
    }
    setError('');
    setShowWarning(true);
  };

  const confirmWithdraw = async () => {
    const value = parseFloat(amount);
    await onWithdraw(value);
    setAmount('');
    setShowWarning(false);
  };

  return (
    <>
      <Card className="border-vault-danger/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-vault-danger">
            <Minus className="w-5 h-5" />
            Withdraw USDC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning banner */}
          <div className="flex items-start gap-2 p-3 bg-vault-danger/10 rounded-lg border border-vault-danger/30">
            <AlertTriangle className="w-5 h-5 text-vault-danger flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-vault-danger font-medium">Warning: Withdrawals harm your Guardian</p>
              <p className="text-vault-muted">
                Reducing your principal will lower your Guardian's growth score and may cause it to de-level or die.
              </p>
            </div>
          </div>

          {/* Available balance */}
          <div className="flex justify-between items-center p-3 bg-vault-bg rounded-lg">
            <span className="text-vault-muted">Available to withdraw</span>
            <span className="text-white font-bold">{formatCurrency(vault.principal)}</span>
          </div>

          {/* Amount input */}
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            suffix="USDC"
            error={error}
          />

          {/* Max button */}
          <button
            onClick={() => setAmount(vault.principal.toString())}
            className="text-sm text-vault-danger hover:text-red-400 transition-colors"
          >
            Withdraw All (Guardian will die)
          </button>

          {/* Live preview */}
          {withdrawAmount > 0 && (
            <div className={`
              p-4 rounded-lg border transition-all
              ${willDie 
                ? 'bg-vault-danger/20 border-vault-danger animate-shake' 
                : willLevelDown 
                  ? 'bg-vault-warning/10 border-vault-warning/30' 
                  : 'bg-vault-bg border-vault-border'
              }
            `}>
              <p className="text-sm text-vault-muted mb-3">After withdrawal:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StageIndicator stage={guardian.stage} size="sm" />
                  <ChevronRight className="w-4 h-4 text-vault-muted" />
                  <StageIndicator stage={projectedStage} size="sm" />
                </div>
                {willDie && (
                  <span className="text-vault-danger font-bold flex items-center gap-1">
                    <Skull className="w-4 h-4" />
                    DEATH
                  </span>
                )}
                {willLevelDown && !willDie && (
                  <span className="text-vault-warning font-medium flex items-center gap-1">
                    <ArrowDown className="w-4 h-4" />
                    Level Down
                  </span>
                )}
              </div>
            </div>
          )}

          <Button 
            variant="danger" 
            className="w-full"
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
          >
            <Minus className="w-4 h-4" />
            Withdraw
          </Button>
        </CardContent>
      </Card>

      {/* Scary Warning Modal */}
      <Modal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title={willDie ? "⚠️ YOUR GUARDIAN WILL DIE ⚠️" : "Confirm Withdrawal"}
        size="md"
      >
        <div className="space-y-4">
          {willDie ? (
            <>
              {/* Death warning */}
              <div className="bg-vault-danger/20 border border-vault-danger rounded-xl p-4 animate-pulse">
                <div className="flex justify-center mb-4">
                  <GuardianSVG stage="dead" mood={0} size={120} animate={false} />
                </div>
                <p className="text-center text-vault-danger font-bold text-lg">
                  This withdrawal will KILL your Guardian!
                </p>
                <p className="text-center text-vault-muted mt-2">
                  Withdrawing {formatCurrency(withdrawAmount)} will reduce your principal to $0. 
                  Your guardian {guardian.name} will perish.
                </p>
              </div>

              <div className="bg-vault-bg rounded-lg p-4 space-y-2 text-sm">
                <p className="text-vault-muted">You will lose:</p>
                <ul className="list-disc list-inside text-vault-danger space-y-1">
                  <li>Your guardian's current stage ({guardian.stage})</li>
                  <li>All growth progress</li>
                  <li>Guardian mood and happiness</li>
                </ul>
                <p className="text-vault-muted mt-3">
                  You can revive your guardian later by depositing again.
                </p>
              </div>
            </>
          ) : willLevelDown ? (
            <>
              {/* Level down warning */}
              <div className="bg-vault-warning/10 border border-vault-warning/30 rounded-xl p-4">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <div className="text-center">
                    <GuardianSVG stage={guardian.stage} mood={guardian.mood} size={80} />
                    <p className="text-xs text-vault-muted mt-1">Current</p>
                  </div>
                  <ArrowDown className="w-8 h-8 text-vault-warning" />
                  <div className="text-center">
                    <GuardianSVG stage={projectedStage} mood={Math.max(0, guardian.mood - 20)} size={80} />
                    <p className="text-xs text-vault-muted mt-1">After</p>
                  </div>
                </div>
                <p className="text-center text-vault-warning font-semibold">
                  Your guardian will regress from {guardian.stage} to {projectedStage}
                </p>
              </div>

              <div className="bg-vault-bg rounded-lg p-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-vault-muted">Withdraw Amount</span>
                  <span className="text-white font-medium">{formatCurrency(withdrawAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-vault-muted">Remaining Principal</span>
                  <span className="text-white font-medium">{formatCurrency(vault.principal - withdrawAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vault-muted">Mood Penalty</span>
                  <span className="text-vault-danger font-medium">-20</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Safe withdrawal */}
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(withdrawAmount)}
                </p>
                <p className="text-vault-muted mt-1">
                  will be withdrawn from your vault
                </p>
              </div>

              <div className="bg-vault-bg rounded-lg p-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-vault-muted">Remaining Principal</span>
                  <span className="text-white font-medium">{formatCurrency(vault.principal - withdrawAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vault-muted">Guardian Stage</span>
                  <span className="text-white font-medium">Unchanged ({projectedStage})</span>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => setShowWarning(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1"
              onClick={confirmWithdraw}
              isLoading={isLoading}
            >
              {willDie ? "Kill Guardian & Withdraw" : "Confirm Withdrawal"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

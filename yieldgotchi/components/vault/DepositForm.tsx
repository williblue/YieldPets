'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';

interface DepositFormProps {
  onDeposit: (amount: number) => Promise<{ leveledUp: boolean }>;
  isLoading: boolean;
}

export function DepositForm({ onDeposit, isLoading }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const presetAmounts = [100, 500, 1000, 5000];

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const confirmDeposit = async () => {
    const value = parseFloat(amount);
    await onDeposit(value);
    setAmount('');
    setShowConfirm(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-vault-success" />
            Deposit USDC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`
                  py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${amount === preset.toString() 
                    ? 'bg-vault-accent text-white' 
                    : 'bg-vault-bg text-vault-muted hover:bg-vault-border hover:text-white'
                  }
                `}
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            suffix="USDC"
            error={error}
          />

          {/* Info text */}
          <div className="flex items-start gap-2 p-3 bg-vault-success/10 rounded-lg border border-vault-success/20">
            <Sparkles className="w-5 h-5 text-vault-success flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-vault-success font-medium">Grow your Guardian!</p>
              <p className="text-vault-muted">
                Deposits earn 8% APY and help your guardian evolve. The longer you stake, the stronger it becomes!
              </p>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleSubmit}
            disabled={!amount || isLoading}
          >
            <ArrowRight className="w-4 h-4" />
            Continue to Deposit
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Deposit"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <Sparkles className="w-12 h-12 text-vault-accent mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">
              ${parseFloat(amount || '0').toFixed(2)} USDC
            </p>
            <p className="text-vault-muted mt-1">
              will be deposited into your vault
            </p>
          </div>

          <div className="bg-vault-bg rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-vault-muted">APY</span>
              <span className="text-vault-success font-medium">8.0%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-vault-muted">Est. Daily Yield</span>
              <span className="text-white font-medium">
                ${((parseFloat(amount || '0') * 0.08) / 365).toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={confirmDeposit}
              isLoading={isLoading}
            >
              Deposit
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

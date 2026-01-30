'use client';

import React from 'react';
import { Guardian, Vault, ArmorItem } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GuardianSVG } from './GuardianSVG';
import { MoodMeter } from './MoodMeter';
import { StageIndicator, StageProgress } from './StageIndicator';
import { calculateGrowthScore, daysBetween, formatDuration } from '@/lib/gameLogic';
import { Clock, Zap } from 'lucide-react';

interface GuardianCardProps {
  guardian: Guardian;
  vault: Vault | null;
  equippedArmor?: ArmorItem[];
  showDetails?: boolean;
}

export function GuardianCard({ 
  guardian, 
  vault, 
  equippedArmor = [],
  showDetails = true 
}: GuardianCardProps) {
  const growthScore = vault 
    ? calculateGrowthScore(vault.principal, vault.depositedAt) 
    : 0;
  
  const daysLocked = vault 
    ? daysBetween(vault.depositedAt, Date.now()) 
    : 0;

  const isDead = guardian.stage === 'dead';

  return (
    <Card className={`relative overflow-hidden ${isDead ? 'border-vault-danger/30' : ''}`}>
      {/* Background glow */}
      {!isDead && (
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${
              guardian.stage === 'legendary' ? '#fbbf24' : '#06b6d4'
            } 0%, transparent 50%)`
          }}
        />
      )}

      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{guardian.name}</CardTitle>
          <StageIndicator stage={guardian.stage} size="sm" />
        </div>
        {!isDead && <MoodMeter mood={guardian.mood} showLabel={false} />}
      </CardHeader>

      <CardContent>
        {/* Guardian visualization */}
        <div className="flex justify-center py-4">
          <GuardianSVG 
            stage={guardian.stage} 
            mood={guardian.mood}
            equippedArmor={equippedArmor}
            size={180}
          />
        </div>

        {isDead && (
          <div className="text-center py-4">
            <p className="text-vault-danger font-semibold">Your guardian has perished</p>
            <p className="text-vault-muted text-sm mt-1">Deposit USDC to revive</p>
          </div>
        )}

        {showDetails && !isDead && (
          <div className="space-y-4 mt-4">
            {/* Stage progress */}
            <div>
              <p className="text-sm text-vault-muted mb-2">Evolution Progress</p>
              <StageProgress currentStage={guardian.stage} />
            </div>

            {/* Mood */}
            <MoodMeter mood={guardian.mood} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-vault-accent" />
                <div>
                  <p className="text-xs text-vault-muted">Growth Score</p>
                  <p className="font-semibold text-white">{growthScore.toFixed(1)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-vault-accent" />
                <div>
                  <p className="text-xs text-vault-muted">Time Locked</p>
                  <p className="font-semibold text-white">{formatDuration(daysLocked)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

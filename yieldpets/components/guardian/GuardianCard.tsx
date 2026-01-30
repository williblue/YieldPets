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
    <Card className={`relative overflow-hidden ${isDead ? 'border-pastel-danger' : ''}`}>
      {/* Background glow */}
      {!isDead && (
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${
              guardian.stage === 'legendary' ? '#D4B5F9' : '#FFB5C5'
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
        <div className="flex justify-center py-6 bg-gradient-to-br from-pastel-cream to-pastel-peach/20 rounded-3xl mb-4 border border-pastel-border">
          <GuardianSVG
            stage={guardian.stage}
            mood={guardian.mood}
            equippedArmor={equippedArmor}
            size={180}
          />
        </div>

        {isDead && (
          <div className="text-center py-4">
            <p className="text-pastel-danger font-bold">Your guardian has perished</p>
            <p className="text-pastel-textLight text-sm mt-1">Deposit USDC to revive</p>
          </div>
        )}

        {showDetails && !isDead && (
          <div className="space-y-4">
            {/* Stage progress */}
            <div>
              <p className="text-sm text-pastel-textLight font-semibold mb-2">Evolution Progress</p>
              <StageProgress currentStage={guardian.stage} />
            </div>

            {/* Mood */}
            <MoodMeter mood={guardian.mood} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-pastel-cream rounded-2xl p-3 border border-pastel-border">
                <Zap className="w-4 h-4 text-pastel-pink" />
                <div>
                  <p className="text-xs text-pastel-textLight font-medium">Growth</p>
                  <p className="font-bold text-pastel-text">{growthScore.toFixed(1)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-pastel-cream rounded-2xl p-3 border border-pastel-border">
                <Clock className="w-4 h-4 text-pastel-blue" />
                <div>
                  <p className="text-xs text-pastel-textLight font-medium">Locked</p>
                  <p className="font-bold text-pastel-text">{formatDuration(daysLocked)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

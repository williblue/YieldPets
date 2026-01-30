'use client';

import React from 'react';
import { GuardianStage } from '@/lib/types';
import { STAGE_NAMES, STAGE_COLORS } from '@/lib/constants';
import { Egg, Baby, User, Crown, Skull, Sparkles } from 'lucide-react';

interface StageIndicatorProps {
  stage: GuardianStage;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StageIndicator({ stage, size = 'md', showLabel = true }: StageIndicatorProps) {
  const icons: Record<GuardianStage, React.ReactNode> = {
    egg: <Egg className="w-full h-full" />,
    baby: <Baby className="w-full h-full" />,
    teen: <User className="w-full h-full" />,
    adult: <Crown className="w-full h-full" />,
    legendary: <Sparkles className="w-full h-full" />,
    dead: <Skull className="w-full h-full" />,
  };

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizes[size]} rounded-full flex items-center justify-center shadow-sm
          stage-${stage}
        `}
      >
        <div className={`${iconSizes[size]} text-white`}>
          {icons[stage]}
        </div>
      </div>
      {showLabel && (
        <span
          className="font-bold text-pastel-text"
        >
          {STAGE_NAMES[stage]}
        </span>
      )}
    </div>
  );
}

// Stage progress indicator showing all stages
export function StageProgress({ currentStage }: { currentStage: GuardianStage }) {
  const stages: GuardianStage[] = ['egg', 'baby', 'teen', 'adult', 'legendary'];
  const currentIndex = stages.indexOf(currentStage === 'dead' ? 'egg' : currentStage);

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => (
        <React.Fragment key={stage}>
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm
              ${index <= currentIndex ? `stage-${stage}` : 'bg-pastel-border'}
              ${index === currentIndex ? 'ring-2 ring-pastel-pink ring-offset-2 ring-offset-white scale-110' : ''}
            `}
            title={STAGE_NAMES[stage]}
          >
            <span className="text-xs text-white font-bold">
              {index + 1}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div
              className={`w-6 h-1 rounded-full ${index < currentIndex ? 'bg-gradient-to-r from-pastel-pink to-pastel-lavender' : 'bg-pastel-border'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface MoodMeterProps {
  mood: number; // 0-100
  showLabel?: boolean;
}

export function MoodMeter({ mood, showLabel = true }: MoodMeterProps) {
  const getMoodLabel = () => {
    if (mood >= 80) return 'Ecstatic';
    if (mood >= 60) return 'Happy';
    if (mood >= 40) return 'Content';
    if (mood >= 20) return 'Sad';
    return 'Miserable';
  };

  const getMoodColor = () => {
    if (mood >= 60) return 'bg-vault-success';
    if (mood >= 40) return 'bg-vault-warning';
    return 'bg-vault-danger';
  };

  return (
    <div className="flex items-center gap-3">
      <Heart 
        className={`w-5 h-5 ${mood >= 60 ? 'text-vault-success' : mood >= 40 ? 'text-vault-warning' : 'text-vault-danger'}`}
        fill={mood >= 50 ? 'currentColor' : 'none'}
      />
      <div className="flex-1">
        {showLabel && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-vault-muted">Mood</span>
            <span className="text-white font-medium">{getMoodLabel()}</span>
          </div>
        )}
        <div className="h-2 bg-vault-bg rounded-full overflow-hidden">
          <div 
            className={`h-full ${getMoodColor()} rounded-full transition-all duration-500`}
            style={{ width: `${mood}%` }}
          />
        </div>
      </div>
    </div>
  );
}

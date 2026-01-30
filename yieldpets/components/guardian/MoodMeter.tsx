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
    if (mood >= 60) return 'bg-gradient-to-r from-pastel-mint to-emerald-300';
    if (mood >= 40) return 'bg-gradient-to-r from-pastel-warning to-yellow-300';
    return 'bg-gradient-to-r from-pastel-danger to-red-300';
  };

  return (
    <div className="flex items-center gap-3">
      <Heart
        className={`w-5 h-5 ${mood >= 60 ? 'text-pastel-success' : mood >= 40 ? 'text-pastel-warning' : 'text-pastel-danger'}`}
        fill={mood >= 50 ? 'currentColor' : 'none'}
      />
      <div className="flex-1">
        {showLabel && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-pastel-textLight">Mood</span>
            <span className="text-pastel-text font-semibold">{getMoodLabel()}</span>
          </div>
        )}
        <div className="h-3 bg-pastel-cream rounded-full overflow-hidden border border-pastel-border">
          <div
            className={`h-full ${getMoodColor()} rounded-full transition-all duration-500`}
            style={{ width: `${mood}%` }}
          />
        </div>
      </div>
    </div>
  );
}

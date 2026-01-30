'use client';

import React from 'react';
import { GuardianStage, ArmorItem } from '@/lib/types';

interface GuardianSVGProps {
  stage: GuardianStage;
  mood: number;
  equippedArmor?: ArmorItem[];
  size?: number;
  animate?: boolean;
}

export function GuardianSVG({ 
  stage, 
  mood, 
  equippedArmor = [], 
  size = 200,
  animate = true 
}: GuardianSVGProps) {
  const isDead = stage === 'dead';
  
  // Get equipped items by slot
  const head = equippedArmor.find(a => a.slot === 'head' && a.equipped);
  const body = equippedArmor.find(a => a.slot === 'body' && a.equipped);
  const weapon = equippedArmor.find(a => a.slot === 'weapon' && a.equipped);
  const pet = equippedArmor.find(a => a.slot === 'pet' && a.equipped);

  // Mood affects expression
  const moodExpression = mood > 70 ? 'happy' : mood > 40 ? 'neutral' : 'sad';

  return (
    <div 
      className={`
        guardian-container relative
        ${animate && !isDead ? 'animate-float' : ''}
        ${isDead ? 'guardian-dead' : ''}
      `}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 200 200" 
        width={size} 
        height={size}
        className="overflow-visible"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Stage gradients */}
          <linearGradient id="eggGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          
          <linearGradient id="babyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399"/>
            <stop offset="100%" stopColor="#059669"/>
          </linearGradient>
          
          <linearGradient id="teenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#2563eb"/>
          </linearGradient>
          
          <linearGradient id="adultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          
          <linearGradient id="legendaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24"/>
            <stop offset="50%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#d97706"/>
          </linearGradient>
          
          <linearGradient id="deadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4b5563"/>
            <stop offset="100%" stopColor="#374151"/>
          </linearGradient>
        </defs>

        {/* Render based on stage */}
        {stage === 'egg' && <EggStage />}
        {stage === 'baby' && <BabyStage mood={moodExpression} />}
        {stage === 'teen' && <TeenStage mood={moodExpression} />}
        {stage === 'adult' && <AdultStage mood={moodExpression} />}
        {stage === 'legendary' && <LegendaryStage mood={moodExpression} />}
        {stage === 'dead' && <DeadStage />}
        
        {/* Armor overlays */}
        {!isDead && head && <HeadArmor item={head} stage={stage} />}
        {!isDead && body && <BodyArmor item={body} stage={stage} />}
        {!isDead && weapon && <WeaponArmor item={weapon} stage={stage} />}
        {!isDead && pet && <PetArmor item={pet} />}
      </svg>
    </div>
  );
}

// Stage components
function EggStage() {
  return (
    <g>
      {/* Egg body */}
      <ellipse 
        cx="100" 
        cy="110" 
        rx="45" 
        ry="55" 
        fill="url(#eggGradient)"
        filter="url(#glow)"
      />
      {/* Crack pattern */}
      <path 
        d="M70 100 L80 90 L90 105 L100 85 L110 100 L120 88 L130 100" 
        stroke="#e5e7eb" 
        strokeWidth="2" 
        fill="none"
        opacity="0.5"
      />
      {/* Sparkle */}
      <circle cx="80" cy="85" r="3" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function BabyStage({ mood }: { mood: string }) {
  return (
    <g filter="url(#glow)">
      {/* Body */}
      <ellipse cx="100" cy="130" rx="35" ry="30" fill="url(#babyGradient)"/>
      {/* Head */}
      <circle cx="100" cy="85" r="35" fill="url(#babyGradient)"/>
      {/* Eyes */}
      <circle cx="88" cy="80" r="8" fill="white"/>
      <circle cx="112" cy="80" r="8" fill="white"/>
      <circle cx="90" cy="82" r="4" fill="#1f2937"/>
      <circle cx="114" cy="82" r="4" fill="#1f2937"/>
      {/* Eye shine */}
      <circle cx="92" cy="80" r="2" fill="white"/>
      <circle cx="116" cy="80" r="2" fill="white"/>
      {/* Mouth based on mood */}
      {mood === 'happy' && (
        <path d="M90 95 Q100 105 110 95" stroke="#1f2937" strokeWidth="2" fill="none"/>
      )}
      {mood === 'neutral' && (
        <line x1="90" y1="98" x2="110" y2="98" stroke="#1f2937" strokeWidth="2"/>
      )}
      {mood === 'sad' && (
        <path d="M90 100 Q100 92 110 100" stroke="#1f2937" strokeWidth="2" fill="none"/>
      )}
      {/* Cheeks */}
      <circle cx="75" cy="90" r="6" fill="#f87171" opacity="0.3"/>
      <circle cx="125" cy="90" r="6" fill="#f87171" opacity="0.3"/>
    </g>
  );
}

function TeenStage({ mood }: { mood: string }) {
  return (
    <g filter="url(#glow)">
      {/* Body */}
      <ellipse cx="100" cy="140" rx="30" ry="35" fill="url(#teenGradient)"/>
      {/* Arms */}
      <ellipse cx="65" cy="130" rx="12" ry="20" fill="url(#teenGradient)"/>
      <ellipse cx="135" cy="130" rx="12" ry="20" fill="url(#teenGradient)"/>
      {/* Head */}
      <circle cx="100" cy="75" r="40" fill="url(#teenGradient)"/>
      {/* Ears/horns */}
      <ellipse cx="70" cy="50" rx="8" ry="15" fill="url(#teenGradient)"/>
      <ellipse cx="130" cy="50" rx="8" ry="15" fill="url(#teenGradient)"/>
      {/* Eyes */}
      <ellipse cx="85" cy="70" rx="10" ry="12" fill="white"/>
      <ellipse cx="115" cy="70" rx="10" ry="12" fill="white"/>
      <circle cx="87" cy="72" r="5" fill="#1f2937"/>
      <circle cx="117" cy="72" r="5" fill="#1f2937"/>
      <circle cx="89" cy="70" r="2" fill="white"/>
      <circle cx="119" cy="70" r="2" fill="white"/>
      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M85 92 Q100 105 115 92" stroke="#1f2937" strokeWidth="2" fill="none"/>
      )}
      {mood === 'neutral' && (
        <line x1="88" y1="95" x2="112" y2="95" stroke="#1f2937" strokeWidth="2"/>
      )}
      {mood === 'sad' && (
        <path d="M88 98 Q100 88 112 98" stroke="#1f2937" strokeWidth="2" fill="none"/>
      )}
    </g>
  );
}

function AdultStage({ mood }: { mood: string }) {
  return (
    <g filter="url(#glow)">
      {/* Body */}
      <ellipse cx="100" cy="145" rx="35" ry="40" fill="url(#adultGradient)"/>
      {/* Arms */}
      <ellipse cx="58" cy="130" rx="15" ry="25" fill="url(#adultGradient)"/>
      <ellipse cx="142" cy="130" rx="15" ry="25" fill="url(#adultGradient)"/>
      {/* Head */}
      <circle cx="100" cy="65" r="45" fill="url(#adultGradient)"/>
      {/* Crown-like protrusions */}
      <polygon points="65,35 70,15 75,35" fill="url(#adultGradient)"/>
      <polygon points="95,30 100,5 105,30" fill="url(#adultGradient)"/>
      <polygon points="125,35 130,15 135,35" fill="url(#adultGradient)"/>
      {/* Eyes */}
      <ellipse cx="80" cy="60" rx="12" ry="14" fill="white"/>
      <ellipse cx="120" cy="60" rx="12" ry="14" fill="white"/>
      <circle cx="82" cy="62" r="6" fill="#1f2937"/>
      <circle cx="122" cy="62" r="6" fill="#1f2937"/>
      <circle cx="84" cy="60" r="2" fill="white"/>
      <circle cx="124" cy="60" r="2" fill="white"/>
      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M80 85 Q100 100 120 85" stroke="#1f2937" strokeWidth="3" fill="none"/>
      )}
      {mood === 'neutral' && (
        <line x1="85" y1="90" x2="115" y2="90" stroke="#1f2937" strokeWidth="2"/>
      )}
      {mood === 'sad' && (
        <path d="M85 95 Q100 82 115 95" stroke="#1f2937" strokeWidth="2" fill="none"/>
      )}
      {/* Gem on forehead */}
      <polygon points="100,40 105,50 100,55 95,50" fill="#06b6d4">
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
      </polygon>
    </g>
  );
}

function LegendaryStage({ mood }: { mood: string }) {
  return (
    <g filter="url(#glow)">
      {/* Aura */}
      <circle cx="100" cy="100" r="80" fill="none" stroke="url(#legendaryGradient)" strokeWidth="2" opacity="0.3">
        <animate attributeName="r" values="75;85;75" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Wings */}
      <path d="M45 80 Q20 60 30 100 Q40 120 60 110" fill="url(#legendaryGradient)" opacity="0.8"/>
      <path d="M155 80 Q180 60 170 100 Q160 120 140 110" fill="url(#legendaryGradient)" opacity="0.8"/>
      {/* Body */}
      <ellipse cx="100" cy="145" rx="35" ry="40" fill="url(#legendaryGradient)"/>
      {/* Arms */}
      <ellipse cx="55" cy="125" rx="18" ry="28" fill="url(#legendaryGradient)"/>
      <ellipse cx="145" cy="125" rx="18" ry="28" fill="url(#legendaryGradient)"/>
      {/* Head */}
      <circle cx="100" cy="60" r="48" fill="url(#legendaryGradient)"/>
      {/* Crown */}
      <polygon points="55,30 65,0 75,30" fill="#fbbf24"/>
      <polygon points="85,25 100,-10 115,25" fill="#f59e0b"/>
      <polygon points="125,30 135,0 145,30" fill="#fbbf24"/>
      {/* Eyes - more majestic */}
      <ellipse cx="78" cy="55" rx="14" ry="16" fill="white"/>
      <ellipse cx="122" cy="55" rx="14" ry="16" fill="white"/>
      <circle cx="80" cy="57" r="7" fill="#1f2937"/>
      <circle cx="124" cy="57" r="7" fill="#1f2937"/>
      <circle cx="83" cy="54" r="3" fill="white"/>
      <circle cx="127" cy="54" r="3" fill="white"/>
      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M78 82 Q100 98 122 82" stroke="#1f2937" strokeWidth="3" fill="none"/>
      )}
      {mood === 'neutral' && (
        <line x1="83" y1="88" x2="117" y2="88" stroke="#1f2937" strokeWidth="2"/>
      )}
      {mood === 'sad' && (
        <path d="M83 92 Q100 78 117 92" stroke="#1f2937" strokeWidth="2" fill="none"/>
      )}
      {/* Multiple gems */}
      <polygon points="100,30 107,43 100,50 93,43" fill="#06b6d4">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
      </polygon>
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <circle 
          key={i}
          cx={60 + i * 16} 
          cy={170 - (i % 3) * 10} 
          r="3" 
          fill="#fbbf24"
          opacity="0.6"
        >
          <animate 
            attributeName="cy" 
            values={`${170 - (i % 3) * 10};${160 - (i % 3) * 10};${170 - (i % 3) * 10}`} 
            dur={`${2 + i * 0.3}s`} 
            repeatCount="indefinite"
          />
          <animate 
            attributeName="opacity" 
            values="0.6;0.2;0.6" 
            dur={`${2 + i * 0.3}s`} 
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function DeadStage() {
  return (
    <g>
      {/* Ghost body */}
      <path 
        d="M60 180 L60 100 Q60 50 100 50 Q140 50 140 100 L140 180 
           Q130 170 120 180 Q110 170 100 180 Q90 170 80 180 Q70 170 60 180"
        fill="url(#deadGradient)"
        opacity="0.7"
      />
      {/* X eyes */}
      <path d="M75 80 L90 95 M90 80 L75 95" stroke="#1f2937" strokeWidth="3"/>
      <path d="M110 80 L125 95 M125 80 L110 95" stroke="#1f2937" strokeWidth="3"/>
      {/* Wavy mouth */}
      <path d="M80 115 Q90 120 100 115 Q110 110 120 115" stroke="#1f2937" strokeWidth="2" fill="none"/>
      {/* Halo (broken) */}
      <ellipse cx="100" cy="35" rx="25" ry="8" fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5"/>
    </g>
  );
}

// Armor overlay components (simplified representations)
function HeadArmor({ item, stage }: { item: ArmorItem; stage: GuardianStage }) {
  const y = stage === 'egg' ? 55 : stage === 'baby' ? 50 : stage === 'teen' ? 35 : stage === 'adult' ? 20 : 10;
  return (
    <g>
      <rect x="80" y={y} width="40" height="15" rx="5" fill={getRarityColor(item.rarity)} opacity="0.8"/>
      <circle cx="100" cy={y + 7} r="4" fill="white" opacity="0.6"/>
    </g>
  );
}

function BodyArmor({ item, stage }: { item: ArmorItem; stage: GuardianStage }) {
  const y = stage === 'egg' ? 90 : stage === 'baby' ? 110 : stage === 'teen' ? 120 : stage === 'adult' ? 125 : 125;
  return (
    <rect x="75" y={y} width="50" height="30" rx="5" fill={getRarityColor(item.rarity)} opacity="0.6"/>
  );
}

function WeaponArmor({ item, stage }: { item: ArmorItem; stage: GuardianStage }) {
  return (
    <g transform="translate(140, 100)">
      <rect x="0" y="-20" width="8" height="40" rx="2" fill={getRarityColor(item.rarity)}/>
      <polygon points="4,-25 -5,-35 13,-35" fill={getRarityColor(item.rarity)}/>
    </g>
  );
}

function PetArmor({ item }: { item: ArmorItem }) {
  return (
    <g transform="translate(150, 160)">
      <circle cx="0" cy="0" r="12" fill={getRarityColor(item.rarity)} opacity="0.8"/>
      <circle cx="-4" cy="-3" r="3" fill="white"/>
      <circle cx="4" cy="-3" r="3" fill="white"/>
      <circle cx="-3" cy="-2" r="1.5" fill="#1f2937"/>
      <circle cx="5" cy="-2" r="1.5" fill="#1f2937"/>
    </g>
  );
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    default: return '#9ca3af';
  }
}

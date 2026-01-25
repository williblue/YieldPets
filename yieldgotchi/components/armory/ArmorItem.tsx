'use client';

import React from 'react';
import { ArmorItem as ArmorItemType } from '@/lib/types';
import { RARITY_COLORS } from '@/lib/constants';
import { Shield, Crown, Sword, Heart, Check } from 'lucide-react';

interface ArmorItemProps {
  item: ArmorItemType;
  onToggleEquip: (id: string) => void;
  isLoading?: boolean;
}

export function ArmorItemCard({ item, onToggleEquip, isLoading }: ArmorItemProps) {
  const slotIcons = {
    head: Crown,
    body: Shield,
    weapon: Sword,
    pet: Heart,
  };

  const SlotIcon = slotIcons[item.slot];

  return (
    <button
      onClick={() => onToggleEquip(item.id)}
      disabled={isLoading}
      className={`
        relative p-4 rounded-xl border transition-all text-left w-full
        rarity-${item.rarity}
        ${item.equipped 
          ? 'bg-vault-accent/10 border-vault-accent' 
          : 'bg-vault-card border-vault-border hover:border-vault-accent/50'
        }
      `}
    >
      {/* Equipped badge */}
      {item.equipped && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-vault-accent rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${RARITY_COLORS[item.rarity]}20` }}
      >
        <SlotIcon 
          className="w-6 h-6" 
          style={{ color: RARITY_COLORS[item.rarity] }}
        />
      </div>

      {/* Name */}
      <p className="font-semibold text-white text-sm">{item.name}</p>

      {/* Rarity */}
      <p 
        className="text-xs font-medium capitalize"
        style={{ color: RARITY_COLORS[item.rarity] }}
      >
        {item.rarity}
      </p>

      {/* Slot */}
      <p className="text-xs text-vault-muted capitalize mt-1">
        {item.slot}
      </p>
    </button>
  );
}

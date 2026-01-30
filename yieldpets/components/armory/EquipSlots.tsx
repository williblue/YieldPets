'use client';

import React from 'react';
import { ArmorItem } from '@/lib/types';
import { RARITY_COLORS } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Shield, Crown, Sword, Heart } from 'lucide-react';

interface EquipSlotsProps {
  equippedArmor: ArmorItem[];
}

export function EquipSlots({ equippedArmor }: EquipSlotsProps) {
  const slots = [
    { key: 'head', icon: Crown, label: 'Head' },
    { key: 'body', icon: Shield, label: 'Body' },
    { key: 'weapon', icon: Sword, label: 'Weapon' },
    { key: 'pet', icon: Heart, label: 'Pet' },
  ] as const;

  const getEquippedItem = (slot: string) => 
    equippedArmor.find(item => item.slot === slot && item.equipped);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipped Gear</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {slots.map(({ key, icon: Icon, label }) => {
            const item = getEquippedItem(key);
            return (
              <div
                key={key}
                className={`
                  p-3 rounded-lg border transition-all
                  ${item 
                    ? 'border-vault-accent bg-vault-accent/5' 
                    : 'border-vault-border border-dashed bg-vault-bg/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${item ? '' : 'bg-vault-border'}
                    `}
                    style={item ? { backgroundColor: `${RARITY_COLORS[item.rarity]}20` } : {}}
                  >
                    <Icon 
                      className="w-5 h-5"
                      style={{ color: item ? RARITY_COLORS[item.rarity] : '#6b7280' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-vault-muted">{label}</p>
                    {item ? (
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ color: RARITY_COLORS[item.rarity] }}
                      >
                        {item.name}
                      </p>
                    ) : (
                      <p className="text-sm text-vault-muted">Empty</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import { ArmorItem } from '@/lib/types';
import { ArmorItemCard } from './ArmorItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Shield, Package } from 'lucide-react';

interface ArmorGridProps {
  armor: ArmorItem[];
  onToggleEquip: (id: string) => void;
  isLoading?: boolean;
}

export function ArmorGrid({ armor, onToggleEquip, isLoading }: ArmorGridProps) {
  if (armor.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="w-12 h-12 text-vault-muted mx-auto mb-4" />
          <p className="text-vault-muted font-medium">No armor collected yet</p>
          <p className="text-sm text-vault-muted mt-1">
            Earn yield from your vault to unlock armor pieces
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by slot
  const slots = ['head', 'body', 'weapon', 'pet'] as const;
  const groupedArmor = slots.reduce((acc, slot) => {
    acc[slot] = armor.filter(item => item.slot === slot);
    return acc;
  }, {} as Record<string, ArmorItem[]>);

  return (
    <div className="space-y-6">
      {slots.map(slot => {
        const items = groupedArmor[slot];
        if (items.length === 0) return null;

        return (
          <Card key={slot}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                <Shield className="w-5 h-5 text-vault-accent" />
                {slot} ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map(item => (
                  <ArmorItemCard
                    key={item.id}
                    item={item}
                    onToggleEquip={onToggleEquip}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

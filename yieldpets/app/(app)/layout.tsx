'use client';

import React from 'react';
import { TopHUD } from '@/components/layout/TopHUD';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopHUD />
      <main className="flex-1 container mx-auto px-4 pt-20 pb-24 max-w-lg">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

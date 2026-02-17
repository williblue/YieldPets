import React from 'react';
import type { Metadata } from 'next';
import { Nunito, Fredoka, Varela_Round } from 'next/font/google';

const nunito = Nunito({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-nunito',
});

const fredoka = Fredoka({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fredoka',
});

const varelaRound = Varela_Round({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-varela',
});

export const metadata: Metadata = {
  title: 'YieldPets | A companion that grows with your savings',
  description: 'Hatch your YieldPet and watch it grow with your savings',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${nunito.variable} ${fredoka.variable} ${varelaRound.variable} ${nunito.className}`}>
      {children}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Vault, Shield, User, Sparkles } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/vault', label: 'Vault', icon: Vault },
    { href: '/mint', label: 'Mint', icon: Sparkles },
    { href: '/armory', label: 'Armory', icon: Shield },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-pastel-border shadow-lg pb-safe">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-around gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 min-w-[60px]
                  transition-all duration-200
                  ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'}
                `}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-pastel-pink to-pastel-lavender shadow-lg'
                        : 'bg-pastel-cream hover:bg-pastel-peach/50'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-pastel-text'
                    }`}
                  />
                </div>
                <span
                  className={`
                    text-xs font-medium
                    ${
                      isActive
                        ? 'text-pastel-pink font-semibold'
                        : 'text-pastel-textLight'
                    }
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

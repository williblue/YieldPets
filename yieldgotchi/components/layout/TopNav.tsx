'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { Button } from '@/components/ui/Button';
import { Wallet, Home, Sparkles, Shield, User, Vault } from 'lucide-react';

export function TopNav() {
  const pathname = usePathname();
  const { wallet, guardian, connectWallet, disconnectWallet, isLoading } = useApp();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/vault', label: 'Vault', icon: Vault },
    { href: '/armory', label: 'Armory', icon: Shield },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-vault-bg/80 backdrop-blur-lg border-b border-vault-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vault-accent to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">
              YieldGotchi
            </span>
          </Link>

          {/* Navigation */}
          {wallet.connected && guardian && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-vault-accent/10 text-vault-accent' 
                        : 'text-vault-muted hover:text-white hover:bg-vault-card'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {wallet.connected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-vault-card rounded-lg border border-vault-border">
                  <div className="w-2 h-2 rounded-full bg-vault-success animate-pulse" />
                  <span className="text-sm text-vault-muted font-mono">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={connectWallet}
                isLoading={isLoading}
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {wallet.connected && guardian && (
          <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-vault-accent/10 text-vault-accent' 
                      : 'text-vault-muted hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

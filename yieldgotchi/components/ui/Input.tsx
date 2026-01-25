'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export function Input({ label, error, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-vault-muted mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3
            text-white placeholder-vault-muted
            focus:border-vault-accent focus:ring-1 focus:ring-vault-accent
            transition-colors duration-200
            ${suffix ? 'pr-16' : ''}
            ${error ? 'border-vault-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-vault-muted font-medium">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-vault-danger">{error}</p>
      )}
    </div>
  );
}

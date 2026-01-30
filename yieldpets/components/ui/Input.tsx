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
        <label className="block text-sm font-semibold text-pastel-text mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-white border-2 border-pastel-border rounded-full px-5 py-3
            text-pastel-text placeholder-pastel-textLight
            focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20
            transition-all duration-200
            ${suffix ? 'pr-16' : ''}
            ${error ? 'border-pastel-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-pastel-textLight font-medium">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-pastel-danger font-medium">{error}</p>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'levelup';
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-pastel-success" />,
    error: <AlertCircle className="w-5 h-5 text-pastel-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-pastel-warning" />,
    info: <Info className="w-5 h-5 text-pastel-pink" />,
    levelup: <Sparkles className="w-5 h-5 text-pastel-lavender" />,
  };

  const backgrounds = {
    success: 'border-pastel-success bg-pastel-mint/30',
    error: 'border-pastel-danger bg-pastel-danger/20',
    warning: 'border-pastel-warning bg-pastel-warning/30',
    info: 'border-pastel-pink bg-pastel-pink/20',
    levelup: 'border-pastel-lavender bg-pastel-lavender/30',
  };

  return (
    <div
      className={`
        toast-enter flex items-center gap-3 px-4 py-3 rounded-full border-2
        ${backgrounds[type]}
        shadow-lg backdrop-blur-sm bg-white/95
      `}
    >
      {icons[type]}
      <span className="text-pastel-text font-semibold flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-pastel-textLight hover:text-pastel-pink transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps['type'] extends string ? Array<{ id: string; message: string; type: ToastProps['type'] }> : never; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

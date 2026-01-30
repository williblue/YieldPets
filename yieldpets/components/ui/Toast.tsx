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
    success: <CheckCircle className="w-5 h-5 text-vault-success" />,
    error: <AlertCircle className="w-5 h-5 text-vault-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-vault-warning" />,
    info: <Info className="w-5 h-5 text-vault-accent" />,
    levelup: <Sparkles className="w-5 h-5 text-yellow-400" />,
  };

  const backgrounds = {
    success: 'border-vault-success/30 bg-vault-success/10',
    error: 'border-vault-danger/30 bg-vault-danger/10',
    warning: 'border-vault-warning/30 bg-vault-warning/10',
    info: 'border-vault-accent/30 bg-vault-accent/10',
    levelup: 'border-yellow-400/30 bg-yellow-400/10',
  };

  return (
    <div
      className={`
        toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border
        ${backgrounds[type]}
        shadow-lg backdrop-blur-sm
      `}
    >
      {icons[type]}
      <span className="text-white font-medium flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-vault-muted hover:text-white transition-colors"
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

'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AdminIcon, AdminIconName } from '../navigation/AdminIcons';

// ─── Types ───

type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

// ─── Context ───

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ─── Variant Config ───

const variantConfig: Record<ToastVariant, { accent: string; icon: AdminIconName; iconColor: string; bg: string }> = {
  success: {
    accent: 'bg-emerald-500',
    icon: 'check',
    iconColor: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  danger: {
    accent: 'bg-red-500',
    icon: 'alert',
    iconColor: 'text-red-600',
    bg: 'bg-red-50',
  },
  warning: {
    accent: 'bg-amber-500',
    icon: 'alert',
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  info: {
    accent: 'bg-blue-500',
    icon: 'eye',
    iconColor: 'text-blue-600',
    bg: 'bg-blue-50',
  },
};

// ─── Toast Item ───

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = variantConfig[toast.variant];
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div className="flex items-stretch bg-white border border-slate-200 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden max-w-[360px] w-full animate-in slide-in-from-right-full duration-200">
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 ${config.accent}`} />

      {/* Content */}
      <div className="flex items-start gap-3 p-3 flex-1 min-w-0">
        <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <AdminIcon name={config.icon} className={`w-3.5 h-3.5 ${config.iconColor}`} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 -mt-0.5 -mr-0.5"
        >
          <AdminIcon name="x" className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Provider ───

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, description) => addToast({ title, description, variant: 'success' }),
    error: (title, description) => addToast({ title, description, variant: 'danger' }),
    warning: (title, description) => addToast({ title, description, variant: 'warning' }),
    info: (title, description) => addToast({ title, description, variant: 'info' }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container — bottom right */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

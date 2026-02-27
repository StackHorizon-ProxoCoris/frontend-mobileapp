import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { registerNetworkErrorCallback, unregisterNetworkErrorCallback } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 3000
}

export interface ToastItem extends ToastConfig {
  id: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (config: ToastConfig) => void;
  hideToast: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((config: ToastConfig) => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}-${Date.now()}`;
    const duration = config.duration ?? 3000;

    const toast: ToastItem = { ...config, id };
    setToasts(prev => [...prev, toast]);

    // Auto-dismiss
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, [hideToast]);

  // ─── Global Network Error → Toast ────────────────────────────────────
  // api.ts bukan React component, jadi network error di-bridge lewat callback
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    registerNetworkErrorCallback((message) => {
      showToastRef.current({
        type: 'error',
        title: 'Koneksi Gagal',
        message,
        duration: 4000,
      });
    });
    return () => unregisterNetworkErrorCallback();
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

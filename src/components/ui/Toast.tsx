"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onClick?: () => void;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, onClick?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", onClick?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, onClick }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const icons: Record<ToastType, ReactNode> = {
    success: (
      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
      </svg>
    ),
  };

  return (
    <div
      role={toast.onClick ? "button" : undefined}
      onClick={() => {
        if (toast.onClick) {
          try {
            toast.onClick();
          } catch {}
        }
      }}
      className={cn(
        "pointer-events-auto flex items-center gap-3 bg-white border border-gray-100 shadow-modal rounded-xl px-4 py-3 transition-all duration-300 max-w-sm",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        toast.onClick ? "cursor-pointer" : ""
      )}
    >
      {icons[toast.type]}
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(toast.id);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss toast"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
    if (!ctx) {
      // If a component calls useToast outside of the provider, avoid throwing in production
      // and return a no-op implementation so components can still render safely.
      // This prevents runtime crashes in pages/layouts that don't include the provider.
      // eslint-disable-next-line no-console
      console.warn("useToast used outside ToastProvider — returning no-op toast");
      return {
        toast: () => {},
      };
    }

  return ctx;
}

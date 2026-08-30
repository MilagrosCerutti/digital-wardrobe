import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { ToastContext } from './ToastContext';
import type { ToastOptions, ToastVariant } from './ToastContext';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  default: 'border-border',
  success: 'border-primary',
  error: 'border-destructive',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = crypto.randomUUID();
    const variant = options.variant ?? 'default';
    setToasts((current) => [
      ...current,
      { id, title: options.title, description: options.description, variant },
    ]);

    const durationMs = options.durationMs ?? 4000;
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
          {toasts.map((item) => (
            <div
              key={item.id}
              role="status"
              className={cn('dw-panel border-l-4 p-3 shadow-lg', VARIANT_CLASSES[item.variant])}
            >
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

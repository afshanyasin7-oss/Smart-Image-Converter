import { createContext, useCallback, useState, type ReactNode } from 'react';
import ToastContainer, { type ToastItem, type ToastVariant } from './Toast';

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismiss}
        data-icod-id="src_components_ui_toastprovider_tsx_7ac0" />
    </ToastContext.Provider>
  );
}

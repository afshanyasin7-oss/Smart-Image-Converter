import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success/20 bg-card text-foreground',
  error: 'border-destructive/20 bg-card text-foreground',
  warning: 'border-warning/20 bg-card text-foreground',
  info: 'border-border bg-card text-foreground',
};

const iconMap: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-muted-foreground',
};

function ToastEntry({ toast, onDismiss }: ToastProps) {
  const Icon = iconMap[toast.variant];

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        variantStyles[toast.variant],
      )}
    >
      <Icon
        className={cn('mt-0.5 h-5 w-5 shrink-0', iconColorMap[toast.variant])}
        data-icod-id="src_components_ui_toast_tsx_85ee" />
      <p
        className="flex-1 text-sm leading-relaxed"
        data-icod-id="src_components_ui_toast_tsx_8086">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label="Dismiss notification"
        data-icod-id="src_components_ui_toast_tsx_4935">
        <X className="h-4 w-4" data-icod-id="src_components_ui_toast_tsx_bf27" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const handleDismiss = useCallback(
    (id: string) => {
      onDismiss(id);
    },
    [onDismiss],
  );

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-3"
      aria-label="Notifications"
      data-icod-id="src_components_ui_toast_tsx_109b">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastEntry
            key={toast.id}
            toast={toast}
            onDismiss={handleDismiss}
            data-icod-id={`src_components_ui_toast_tsx_c4f9_${toast.id}`} />
        ))}
      </AnimatePresence>
    </div>
  );
}

import { useContext } from 'react';
import { ToastContext } from '@/components/ui/ToastProvider';
import type { ToastVariant } from '@/components/ui/Toast';

/**
 * Hook for showing toast notifications from any component.
 * Must be used inside <ToastProvider>.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast('File uploaded successfully', 'success');
 *   toast('Something went wrong', 'error');
 */
export function useToast(): { toast: (message: string, variant?: ToastVariant) => void } {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return { toast: ctx.toast };
}

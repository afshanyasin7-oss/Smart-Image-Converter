import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

const variantClass: Record<AlertVariant, string> = {
  error: 'border-destructive/20 bg-destructive/[0.04] text-destructive',
  success: 'border-success/20 bg-success/[0.04] text-success',
  warning: 'border-warning/20 bg-warning/[0.04] text-warning',
  info: 'border-black/[0.06] bg-muted/50 text-muted-foreground',
};

const icons: Record<AlertVariant, typeof Info> = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}

/** Inline status banner: form errors, save confirmations, empty-result notices. */
export default function Alert({ variant = 'error', className, children }: AlertProps) {
  const Icon = icons[variant];
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed',
        variantClass[variant],
        className,
      )}
      data-icod-id="src_components_ui_alert_tsx_55c5">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 opacity-80"
        data-icod-id="src_components_ui_alert_tsx_2e90" />
      <div className="min-w-0" data-icod-id="src_components_ui_alert_tsx_5f6c">{children}</div>
    </div>
  );
}

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-in-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-px hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)] hover:bg-primary/85',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-black/[0.03] hover:-translate-y-px',
  outline:
    'border border-black/[0.04] bg-transparent text-foreground hover:border-black/[0.08] hover:bg-black/[0.03] hover:-translate-y-px',
  ghost:
    'text-muted-foreground hover:bg-black/[0.03] hover:text-foreground hover:opacity-75',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/85 hover:-translate-y-px',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
  icon: 'h-9 w-9 p-0',
};

/**
 * The Button look as a class string — for an element that must stay an <a> or a
 * react-router <Link>:
 *   <Link to="/signup" className={buttonClass({ size: 'sm' })}>Sign up</Link>
 */
export function buttonClass(
  opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {},
): string {
  const { variant = 'primary', size = 'md', className } = opts;
  return cn(base, variantClass[variant], sizeClass[size], className);
}

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

/** Every clickable action in the app. An icon-only button is size="icon". */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || loading}
      data-icod-id="src_components_ui_button_tsx_40b3"
      {...rest}>
      {loading && <Spinner
        size="sm"
        className="border-current border-t-transparent"
        data-icod-id="src_components_ui_button_tsx_8bb5" />}
      {children}
    </button>
  );
});

export default Button;

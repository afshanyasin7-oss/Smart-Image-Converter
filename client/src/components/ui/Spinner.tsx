import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-2',
} as const;

/**
 * Indeterminate loading spinner. Never hand-write an animated <svg> for this.
 *
 * On a coloured surface, inherit the text colour instead of the brand colour:
 *   <Spinner size="sm" className="border-current border-t-transparent" />
 */
export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-primary/30 border-t-primary',
        sizeClass[size],
        className,
      )}
      data-icod-id="src_components_ui_spinner_tsx_f8fc" />
  );
}

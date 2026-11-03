import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

export type CardProps = ComponentPropsWithoutRef<'div'>;

/**
 * Bordered surface: content card, dashboard tile, form panel, list row.
 * Pass padding and layout through className — <Card className="p-4 flex gap-3">.
 *
 * Editorial aesthetic: floating ambient shadow, barely-visible border, glass-like effect.
 */
export default function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-black/[0.04] bg-white/80 backdrop-blur-sm text-card-foreground shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-black/[0.08] hover:shadow-[0_8px_40px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)]',
        className,
      )}
      data-icod-id="src_components_ui_card_tsx_6f5d"
      {...rest} />
  );
}

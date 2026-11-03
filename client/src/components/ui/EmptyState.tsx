import type { ComponentType, ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  /** A lucide-react icon component, e.g. icon={StickyNote}. */
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  /** Primary call to action, usually a <Button>. */
  action?: ReactNode;
  className?: string;
}

/** "Nothing here yet" placeholder for empty lists, grids, and search results. */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-20 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
        <Icon className="h-8 w-8 text-accent-foreground" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

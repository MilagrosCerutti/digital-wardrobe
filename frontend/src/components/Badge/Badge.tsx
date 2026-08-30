import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const VARIANT_CLASSES = {
  default: 'bg-secondary text-secondary-foreground border-border',
  accent: 'bg-accent text-accent-foreground border-border',
  outline: 'bg-transparent text-foreground border-border',
  destructive: 'bg-destructive text-destructive-foreground border-destructive',
} as const;

export type BadgeVariant = keyof typeof VARIANT_CLASSES;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius)] border px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}

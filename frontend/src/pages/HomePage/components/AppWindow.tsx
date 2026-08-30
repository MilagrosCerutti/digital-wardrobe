import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface AppWindowProps {
  title: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}

export function AppWindow({ title, meta, children, className }: AppWindowProps) {
  return (
    <div className={cn('dw-panel overflow-hidden', className)}>
      <div className="dw-chrome flex items-center justify-between gap-3 px-4 py-2.5">
        <span className="dw-micro truncate text-foreground">{title}</span>
        <div className="flex shrink-0 items-center gap-3">
          {meta && <span className="dw-micro hidden sm:inline">{meta}</span>}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-border" />
            <span className="size-1.5 rounded-full bg-border" />
            <span className="size-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </div>
      <div className="bg-cream p-4 sm:p-5">{children}</div>
    </div>
  );
}

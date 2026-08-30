import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        'dw-reveal flex flex-col gap-4',
        isRevealed && 'dw-reveal-in',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-primary/50" aria-hidden="true" />
        <span className="dw-micro text-primary">{eyebrow}</span>
      </div>
      <h2 className="max-w-2xl text-2xl leading-[1.15] font-bold tracking-tight text-foreground md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

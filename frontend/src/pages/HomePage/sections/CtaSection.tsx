import { NavLink } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/utils/cn';

export function CtaSection() {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="dw-grain relative scroll-mt-24 overflow-hidden px-5 py-20 sm:px-8 md:py-28">
      <div
        ref={ref}
        className={cn(
          'dw-panel dw-dotgrid relative mx-auto flex max-w-3xl flex-col items-center gap-5 bg-cream px-6 py-16 text-center shadow-sm',
          'dw-reveal',
          isRevealed && 'dw-reveal-in',
        )}
      >
        <span className="dw-tape absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden="true" />
        <span className="dw-panel dw-micro rounded-full px-3 py-1.5 text-primary shadow-sm">
          welcome back
        </span>
        <span className="dw-micro text-primary">THE DOOR / 011</span>
        <h2 className="text-3xl leading-[1.05] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Ready to meet your <span className="text-primary italic">wardrobe</span>?
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">Step into your personal fashion world.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <NavLink
            to="/register"
            className="dw-lift inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3 text-xs font-semibold tracking-wide text-primary-foreground uppercase"
          >
            Enter Digital Wardrobe
            <span aria-hidden="true">→</span>
          </NavLink>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-border bg-transparent px-5 py-3 text-xs font-semibold tracking-wide text-foreground uppercase hover:bg-muted"
          >
            Explore the Experience
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <span className="dw-panel dw-micro absolute -right-2 -bottom-6 rotate-2 px-3 py-1.5 text-accent-foreground shadow-sm">
          128 pieces inside
        </span>
      </div>
    </section>
  );
}

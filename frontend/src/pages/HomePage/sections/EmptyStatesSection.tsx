import { NavLink } from 'react-router-dom';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { cn } from '@/utils/cn';

const CARDS = [
  {
    icon: '👚',
    label: 'Empty closet',
    description: 'Your closet is waiting for its first piece.',
    action: 'Add your first item',
    bg: 'bg-paper border-dashed',
  },
  {
    icon: '📷',
    label: 'No looks',
    description: 'No looks yet — time to style one.',
    action: 'Create a look',
    bg: 'bg-secondary',
  },
  {
    icon: '♡',
    label: 'No favorites',
    description: 'Nothing saved here yet.',
    action: 'Explore your closet',
    bg: 'bg-cream',
  },
];

export function EmptyStatesSection() {
  return (
    <section className="relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="010 / CHARM LAYER"
          title="Even empty, it still feels like yours."
          description="Nothing in the wardrobe is a dead end — every empty screen is an invitation."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.label}
              className={cn('dw-panel flex flex-col items-center gap-3 border p-6 text-center', card.bg)}
            >
              <div className="dw-panel flex size-16 items-center justify-center bg-paper text-2xl text-primary/60">
                <span aria-hidden="true">{card.icon}</span>
              </div>
              <span className="dw-micro">{card.label}</span>
              <p className="text-sm text-foreground">{card.description}</p>
              <NavLink
                to="/register"
                className="dw-micro border border-border px-4 py-2 text-foreground hover:bg-muted"
              >
                {card.action} <span aria-hidden="true">→</span>
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

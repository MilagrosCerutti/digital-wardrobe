import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';

const REASONS = [
  { index: '01', title: 'Personal', description: 'Built around your wardrobe and your style.' },
  { index: '02', title: 'Playful', description: 'Styling should feel creative and fun.' },
  { index: '03', title: 'Visual', description: 'Your clothes are the main character.' },
  {
    index: '04',
    title: 'Nostalgic',
    description: 'Inspired by Y2K fashion games and digital scrapbooks.',
  },
];

export function WhySection() {
  return (
    <section className="dw-grain relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="009 / WHY DIGITAL WARDROBE"
          title="Not a dashboard. A fashion world."
          align="center"
        />
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.index} className="dw-dotgrid bg-paper p-6">
              <span className="dw-micro text-primary">{reason.index}</span>
              <p className="mt-2 font-semibold text-foreground">{reason.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

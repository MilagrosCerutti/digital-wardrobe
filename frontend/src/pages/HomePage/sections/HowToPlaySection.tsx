import cardigan from '@/assets/homepage/item-cardigan.png';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { AppWindow } from '@/pages/HomePage/components/AppWindow';
import { cn } from '@/utils/cn';

const STEPS = [
  { index: '01', title: 'Add your clothes', description: 'Upload and organize your pieces.' },
  { index: '02', title: 'Explore your closet', description: 'Browse everything visually.' },
  { index: '03', title: 'Style your looks', description: 'Mix pieces and experiment with outfits.' },
  { index: '04', title: 'Save what you love', description: 'Keep your favorite looks and pieces.' },
];

export function HowToPlaySection() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="003 / HOW TO PLAY"
          title="Your wardrobe, four steps at a time."
          description="A little tutorial screen for your own closet."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ol className="flex flex-col">
            {STEPS.map((step, i) => (
              <li
                key={step.index}
                className={cn(
                  'flex items-start gap-4 border-b border-border py-5',
                  i === 0 && 'border-t',
                )}
              >
                <span
                  className={cn(
                    'dw-micro text-lg font-semibold',
                    i === 0 ? 'text-primary' : 'text-muted-foreground/50',
                  )}
                >
                  {step.index}
                </span>
                <div>
                  <p className={cn('font-semibold', i === 0 ? 'text-foreground' : 'text-muted-foreground')}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="lg:sticky lg:top-28">
            <AppWindow title="STEP 01 — ADD YOUR CLOTHES" meta="HOW TO PLAY">
              <div className="dw-panel dw-dotgrid flex flex-col items-center gap-4 bg-cream px-6 py-10 text-center">
                <span className="dw-micro">Drop a photo here</span>
                <div className="size-24">
                  <img
                    src={cardigan}
                    alt="Cropped cardigan"
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="dw-micro">Cardigan · Baby Pink</span>
              </div>
            </AppWindow>
            <p className="dw-hand mt-3 text-center text-lg text-primary">1 of 128 pieces</p>
          </div>
        </div>
      </div>
    </section>
  );
}

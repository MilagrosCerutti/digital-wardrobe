import { NavLink } from 'react-router-dom';
import cardigan from '@/assets/homepage/item-cardigan.png';
import tank from '@/assets/homepage/item-tank.png';
import skirt from '@/assets/homepage/item-skirt.png';
import doll from '@/assets/homepage/doll.png';
import { AppWindow } from '@/pages/HomePage/components/AppWindow';

const MARQUEE_WORDS = [
  'Closet',
  'Style It',
  'My Looks',
  'Favorites',
  'My Doll',
  'Scrapbook',
  'Pastel Dreams',
];

function MarqueeStrip() {
  const content = (
    <div className="flex shrink-0 gap-8 pr-8">
      {MARQUEE_WORDS.map((word) => (
        <span key={word} className="dw-micro whitespace-nowrap text-foreground">
          {word} <span className="text-primary">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative mt-16 overflow-hidden border-y border-border bg-blush py-3">
      <div className="flex w-max animate-[marquee_24s_linear_infinite]">
        {content}
        {content}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="dw-grain relative overflow-hidden px-5 pt-12 pb-16 sm:px-8 md:pt-16">
      <div className="dw-dotgrid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="dw-micro text-primary">DIGITAL WARDROBE / 001</span>
            <span className="h-px w-8 bg-primary/50" aria-hidden="true" />
            <span className="dw-micro">EST. Y2K</span>
          </div>
          <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-foreground sm:text-5xl">
            Your digital
            <br />
            <span className="text-primary italic">fashion</span>
            <br />
            world.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Organize your clothes. Style your looks. Build your own fashion universe.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <NavLink
              to="/register"
              className="dw-lift inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3 text-xs font-semibold tracking-wide text-primary-foreground uppercase"
            >
              Enter the Wardrobe
              <span aria-hidden="true">→</span>
            </NavLink>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-border bg-transparent px-5 py-3 text-xs font-semibold tracking-wide text-foreground uppercase hover:bg-muted"
            >
              See How It Works
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="relative">
          <span className="dw-panel dw-hand absolute -top-4 left-8 -rotate-2 px-3 py-1 text-sm text-primary shadow-sm">
            New season
          </span>
          <AppWindow title="WARDROBE.EXE — MY CLOSET" meta="AUTUMN / 2026">
            <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3">
              <div className="flex flex-col gap-3">
                <span className="dw-micro">Pieces</span>
                <div className="aspect-square bg-secondary p-3">
                  <img src={cardigan} alt="Cropped cardigan" className="h-full w-full object-contain" />
                </div>
                <div className="aspect-square bg-lavender p-3">
                  <img src={tank} alt="Ribbed tank" className="h-full w-full object-contain" />
                </div>
                <div className="aspect-square bg-cream p-3">
                  <img src={skirt} alt="Pleated mini" className="h-full w-full object-contain" />
                </div>
              </div>

              <div className="dw-panel relative flex flex-col justify-between bg-cream p-3">
                <span className="dw-micro">Avatar / Mila</span>
                <img src={doll} alt="Digital fashion doll wearing today's outfit" className="mx-auto h-auto max-h-64 w-auto" />
                <span className="dw-hand self-end text-base text-primary">today's look</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="dw-panel bg-paper p-3">
                  <span className="dw-micro">Outfit</span>
                  <p className="mt-1 text-xs text-foreground">
                    slip dress
                    <br />
                    pearl trim
                  </p>
                </div>
                <div className="dw-panel bg-accent p-3">
                  <span className="dw-micro">Mood</span>
                  <p className="mt-1 text-xs text-foreground">soft glam</p>
                </div>
                <div className="dw-panel bg-paper p-3">
                  <span className="dw-micro">Palette</span>
                  <div className="mt-2 flex gap-1.5">
                    <span className="size-4 rounded-full bg-blush" />
                    <span className="size-4 rounded-full bg-lavender" />
                    <span className="size-4 rounded-full bg-secondary" />
                  </div>
                </div>
              </div>
            </div>
          </AppWindow>
          <span className="dw-panel dw-hand absolute -bottom-4 left-6 -rotate-3 px-3 py-1 text-sm text-accent-foreground shadow-sm">
            drag to style
          </span>
          <span className="dw-panel dw-micro absolute -right-2 -bottom-6 px-3 py-1.5 text-primary shadow-sm">
            ♡ 12 favorites
          </span>
        </div>
      </div>

      <MarqueeStrip />
    </section>
  );
}

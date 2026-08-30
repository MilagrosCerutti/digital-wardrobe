import { useState } from 'react';
import cardigan from '@/assets/homepage/item-cardigan.png';
import tank from '@/assets/homepage/item-tank.png';
import skirt from '@/assets/homepage/item-skirt.png';
import bag from '@/assets/homepage/item-bag.png';
import shoes from '@/assets/homepage/item-shoes.png';
import doll from '@/assets/homepage/doll.png';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { AppWindow } from '@/pages/HomePage/components/AppWindow';
import { Button } from '@/components/Button';
import { cn } from '@/utils/cn';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Accessories'];

export function StyleItPreviewSection() {
  const [activeCategory, setActiveCategory] = useState('Tops');

  return (
    <section className="relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="005 / STYLE IT"
          title="Style it your way."
          description="Mix pieces. Preview the look. Save the outfit."
        />
        <div className="mt-12">
          <AppWindow title="STYLE-IT.EXE — DRESSING ROOM" meta="MODE: MIX & MATCH">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        'dw-micro rounded-full border px-3 py-1.5 transition-colors',
                        activeCategory === category
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="dw-panel relative bg-secondary p-3">
                    <span className="dw-micro absolute top-2 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[0.6rem] text-primary-foreground">
                      On
                    </span>
                    <img
                      src={cardigan}
                      alt="Cropped cardigan"
                      loading="lazy"
                      className="aspect-square w-full object-contain"
                    />
                    <p className="mt-2 truncate text-xs text-foreground">
                      Cropped cardigan <span className="dw-micro">Baby pink</span>
                    </p>
                  </div>
                  <div className="dw-panel bg-lavender p-3">
                    <img
                      src={tank}
                      alt="Ribbed tank"
                      loading="lazy"
                      className="aspect-square w-full object-contain"
                    />
                    <p className="mt-2 truncate text-xs text-foreground">
                      Ribbed tank <span className="dw-micro">Lilac</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="dw-panel dw-dotgrid relative flex flex-col bg-cream p-4">
                <span className="dw-micro">Live preview</span>
                <img
                  src={doll}
                  alt="Fashion doll wearing the current outfit"
                  loading="lazy"
                  className="mx-auto h-64 w-auto sm:h-80"
                />
                {[
                  { img: cardigan, position: 'top-2 right-2' },
                  { img: skirt, position: 'top-1/3 left-2' },
                  { img: bag, position: 'bottom-2 left-2' },
                  { img: shoes, position: 'bottom-2 right-2' },
                ].map(({ img, position }) => (
                  <div key={position} className={cn('dw-panel absolute size-12 bg-paper p-1.5', position)}>
                    <img src={img} alt="" loading="lazy" className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div className="dw-panel bg-paper p-3">
                  <span className="dw-micro">Current look</span>
                  <dl className="mt-2 flex flex-col gap-1 text-xs">
                    {[
                      ['Tops', 'Cropped cardigan'],
                      ['Bottoms', 'Pleated mini'],
                      ['Shoes', 'Platform mary janes'],
                      ['Accessories', 'Pearl baguette'],
                    ].map(([term, value]) => (
                      <div key={term} className="flex justify-between gap-2">
                        <dt className="dw-micro">{term}</dt>
                        <dd className="text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="dw-panel bg-secondary p-3">
                  <span className="dw-micro">Palette</span>
                  <div className="mt-2 flex gap-1.5">
                    <span className="size-4 rounded-full bg-blush" />
                    <span className="size-4 rounded-full bg-lavender" />
                    <span className="size-4 rounded-full bg-cream" />
                  </div>
                </div>
                <Button className="w-full uppercase">Save Look</Button>
              </div>
            </div>
          </AppWindow>
        </div>
      </div>
    </section>
  );
}

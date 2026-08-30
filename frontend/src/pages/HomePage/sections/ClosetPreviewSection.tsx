import { useState } from 'react';
import cardigan from '@/assets/homepage/item-cardigan.png';
import tank from '@/assets/homepage/item-tank.png';
import skirt from '@/assets/homepage/item-skirt.png';
import jeans from '@/assets/homepage/item-jeans.png';
import shoes from '@/assets/homepage/item-shoes.png';
import bag from '@/assets/homepage/item-bag.png';
import accessories from '@/assets/homepage/item-accessories.png';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { AppWindow } from '@/pages/HomePage/components/AppWindow';
import { cn } from '@/utils/cn';

const FILTERS = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

const CLOSET_ITEMS = [
  { image: cardigan, label: 'Cropped cardigan', color: 'Baby pink' },
  { image: tank, label: 'Ribbed tank', color: 'Lilac' },
  { image: skirt, label: 'Pleated mini', color: 'Cream' },
  { image: jeans, label: 'Low-rise denim', color: 'Light wash' },
  { image: shoes, label: 'Platform mary janes', color: 'Pink' },
  { image: bag, label: 'Pearl baguette', color: 'Lilac' },
  { image: accessories, label: 'Butterfly clips', color: 'Pink / Lilac' },
];

export function ClosetPreviewSection() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <section className="dw-grain relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="004 / THE CLOSET"
          title="Your closet, arranged like a fashion story."
          description="Every piece photographed, labelled and filed — a personal fashion archive instead of a product catalogue."
        />
        <div className="relative mt-12">
          <span className="dw-panel dw-hand absolute -top-4 right-6 rotate-2 px-3 py-1 text-sm text-primary shadow-sm">
            filter by color
          </span>
          <AppWindow title="CLOSET.DIR — 128 ITEMS" meta="VIEW: ARCHIVE">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      'dw-micro rounded-full border px-3 py-1.5 transition-colors',
                      activeFilter === filter
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="dw-micro hidden sm:inline">{CLOSET_ITEMS.length} pieces</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CLOSET_ITEMS.map((item) => (
                <div key={item.label} className="dw-panel bg-paper p-3">
                  <div className="aspect-square">
                    <img
                      src={item.image}
                      alt={item.label}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="truncate text-xs text-foreground">{item.label}</span>
                    <span className="dw-micro shrink-0">{item.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </AppWindow>
        </div>
      </div>
    </section>
  );
}

import cardigan from '@/assets/homepage/item-cardigan.png';
import tank from '@/assets/homepage/item-tank.png';
import skirt from '@/assets/homepage/item-skirt.png';
import jeans from '@/assets/homepage/item-jeans.png';
import shoes from '@/assets/homepage/item-shoes.png';
import bag from '@/assets/homepage/item-bag.png';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';

const FAVORITES = [
  { image: cardigan, color: 'Baby pink' },
  { image: tank, color: 'Lilac' },
  { image: skirt, color: 'Cream' },
  { image: jeans, color: 'Light wash' },
  { image: shoes, color: 'Pink' },
  { image: bag, color: 'Lilac' },
];

export function FavoritesSection() {
  return (
    <section className="relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading
            eyebrow="008 / FAVORITES"
            title="Collect what feels like you."
            description="This isn't just storing clothes. This is collecting your style — the pieces, notes and little details you keep coming back to."
          />
          <div className="relative">
            <span className="dw-hand absolute -top-8 right-2 text-lg text-primary">my favorites ♡</span>
            <div className="dw-panel grid grid-cols-2 gap-px overflow-hidden bg-border p-px sm:grid-cols-3">
              {FAVORITES.map((item, i) => (
                <div key={item.color + i} className="relative bg-cream p-4">
                  <span
                    className="dw-tape absolute -top-1.5 left-1/2 -translate-x-1/2 -rotate-2"
                    aria-hidden="true"
                  />
                  {i === 2 && (
                    <span className="dw-panel dw-micro absolute -top-2 -right-2 rounded-full px-2 py-1 text-primary shadow-sm">
                      ♡ keep
                    </span>
                  )}
                  <img
                    src={item.image}
                    alt={item.color}
                    loading="lazy"
                    className="aspect-square w-full object-contain"
                  />
                  <span className="dw-hand mt-2 block text-base text-primary">{item.color}</span>
                </div>
              ))}
            </div>
            <span className="dw-panel dw-micro absolute -bottom-4 left-4 -rotate-2 px-3 py-1.5 text-accent-foreground shadow-sm">
              wear more lilac
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

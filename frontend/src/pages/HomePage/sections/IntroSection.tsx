import cardigan from '@/assets/homepage/item-cardigan.png';
import tank from '@/assets/homepage/item-tank.png';
import jeans from '@/assets/homepage/item-jeans.png';
import skirt from '@/assets/homepage/item-skirt.png';
import shoes from '@/assets/homepage/item-shoes.png';
import bag from '@/assets/homepage/item-bag.png';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { cn } from '@/utils/cn';

interface FeatureCardProps {
  index: string;
  title: string;
  description: string;
  bgClassName: string;
  icons?: string[];
}

function FeatureCard({ index, title, description, bgClassName, icons }: FeatureCardProps) {
  return (
    <div className={cn('dw-panel dw-lift flex flex-col justify-between gap-6 p-5', bgClassName)}>
      <div className="flex items-start justify-between">
        <span className="dw-micro">{index}</span>
        <span className="dw-micro text-lg leading-none">+</span>
      </div>
      {icons && (
        <div className="flex gap-2">
          {icons.map((icon) => (
            <div key={icon} className="dw-panel size-12 bg-paper/70 p-2">
              <img src={icon} alt="" loading="lazy" className="h-full w-full object-contain" />
            </div>
          ))}
        </div>
      )}
      <div>
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function IntroSection() {
  return (
    <section className="relative px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <SectionHeading
            eyebrow="002 / WHAT IS DIGITAL WARDROBE"
            title="A wardrobe made for your world."
            description="Digital Wardrobe turns your real clothes into a visual archive. Photograph your pieces, arrange them like an editorial, build outfits, and keep the looks that feel like you — all in one soft little universe."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <FeatureCard
                index="01"
                title="Closet"
                description="Your clothes, beautifully organized."
                bgClassName="bg-cream"
                icons={[cardigan, tank, jeans, skirt]}
              />
              <FeatureCard
                index="04"
                title="Favorites"
                description="Collect the pieces that feel like you."
                bgClassName="bg-cream"
              />
            </div>
            <div className="flex flex-col gap-3">
              <FeatureCard
                index="02"
                title="Style It"
                description="Mix pieces and create new looks."
                bgClassName="bg-secondary"
                icons={[shoes, bag]}
              />
              <FeatureCard
                index="03"
                title="My Looks"
                description="Save the outfits you actually love."
                bgClassName="bg-lavender"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

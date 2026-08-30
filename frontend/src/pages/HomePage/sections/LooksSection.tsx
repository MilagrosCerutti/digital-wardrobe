import look1 from '@/assets/homepage/look-1.jpg';
import look2 from '@/assets/homepage/look-2.jpg';
import look3 from '@/assets/homepage/look-3.jpg';
import look4 from '@/assets/homepage/look-4.jpg';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { PolaroidCard } from '@/pages/HomePage/components/PolaroidCard';

const LOOKS = [
  { image: look1, label: 'Monday', caption: 'soft start of the week', tilt: -2, offset: '' },
  { image: look2, label: 'Date night', caption: 'lilac + pearls', tilt: 2, offset: 'lg:mt-14' },
  { image: look3, label: 'Summer', caption: 'denim forever', tilt: -1, offset: 'lg:-mt-6' },
  { image: look4, label: 'Casual', caption: 'the cardigan one', tilt: 3, offset: 'lg:mt-20' },
];

export function LooksSection() {
  return (
    <section className="dw-grain relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="007 / MY LOOKS"
          title="Looks worth remembering."
          description="A personal fashion journal of the outfits you actually wore."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {LOOKS.map((look) => (
            <PolaroidCard
              key={look.label}
              image={look.image}
              alt={`Saved look: ${look.label}`}
              label={look.label}
              caption={look.caption}
              tilt={look.tilt}
              offsetClassName={look.offset}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

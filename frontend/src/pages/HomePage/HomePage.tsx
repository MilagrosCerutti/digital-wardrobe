import { HeroSection } from '@/pages/HomePage/sections/HeroSection';
import { IntroSection } from '@/pages/HomePage/sections/IntroSection';
import { HowToPlaySection } from '@/pages/HomePage/sections/HowToPlaySection';
import { ClosetPreviewSection } from '@/pages/HomePage/sections/ClosetPreviewSection';
import { StyleItPreviewSection } from '@/pages/HomePage/sections/StyleItPreviewSection';
import { DollPreviewSection } from '@/pages/HomePage/sections/DollPreviewSection';
import { LooksSection } from '@/pages/HomePage/sections/LooksSection';
import { FavoritesSection } from '@/pages/HomePage/sections/FavoritesSection';
import { WhySection } from '@/pages/HomePage/sections/WhySection';
import { EmptyStatesSection } from '@/pages/HomePage/sections/EmptyStatesSection';
import { CtaSection } from '@/pages/HomePage/sections/CtaSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <HowToPlaySection />
      <ClosetPreviewSection />
      <StyleItPreviewSection />
      <DollPreviewSection />
      <LooksSection />
      <FavoritesSection />
      <WhySection />
      <EmptyStatesSection />
      <CtaSection />
    </>
  );
}

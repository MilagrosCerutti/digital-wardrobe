import doll from '@/assets/homepage/doll.png';
import { SectionHeading } from '@/pages/HomePage/components/SectionHeading';
import { AppWindow } from '@/pages/HomePage/components/AppWindow';

const STYLE_TAGS = ['Soft Glam', 'Y2K Lover', 'Pastel Dreamer', 'Vintage Girl'];
const FAVORITE_COLORS = ['bg-blush', 'bg-lavender', 'bg-cream', 'bg-secondary'];
const STYLE_METER = [
  { label: 'Soft', value: 90 },
  { label: 'Playful', value: 75 },
  { label: 'Editorial', value: 85 },
];

export function DollPreviewSection() {
  return (
    <section className="relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="relative order-2 lg:order-1">
            <span className="dw-panel dw-hand absolute -top-4 left-6 -rotate-2 px-3 py-1 text-sm text-primary shadow-sm">
              collectible
            </span>
            <AppWindow title="MY-DOLL.CARD — PROFILE" meta="LV. 12 STYLIST">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="dw-panel bg-secondary p-3">
                  <span className="dw-micro">Mila / She-Her</span>
                  <img
                    src={doll}
                    alt="Mila, your digital fashion doll"
                    loading="lazy"
                    className="mx-auto mt-2 h-64 w-auto"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="dw-panel bg-paper p-3">
                    <span className="dw-micro">Style tags</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {STYLE_TAGS.map((tag) => (
                        <span
                          key={tag}
                          className="dw-micro rounded-full border border-border px-2.5 py-1 text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="dw-panel bg-paper p-3">
                    <span className="dw-micro">Favorite colors</span>
                    <div className="mt-2 flex gap-1.5">
                      {FAVORITE_COLORS.map((color) => (
                        <span key={color} className={`size-4 rounded-full border border-border ${color}`} />
                      ))}
                    </div>
                  </div>
                  <div className="dw-panel bg-cream p-3">
                    <span className="dw-micro">Style meter</span>
                    <div className="mt-2 flex flex-col gap-2">
                      {STYLE_METER.map((item) => (
                        <div key={item.label}>
                          <span className="dw-micro">{item.label}</span>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AppWindow>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="006 / MY DOLL"
              title="Meet your digital fashion self."
              description="Your doll grows with your wardrobe — the colors you reach for, the silhouettes you repeat, the looks you save. It becomes a small portrait of your style."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

export function ShoeFlats({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.2} strokeWidth={1.5}>
      <path d="M 102 548 L 138 548 L 140 559 C 140 566, 131 571, 118 571 C 102 571, 92 566, 92 559 C 92 553, 96 549, 102 548 Z" />
      <path d="M 162 548 L 198 548 C 204 549, 208 553, 208 559 C 208 566, 198 571, 182 571 C 169 571, 160 566, 160 559 Z" />
      <path d="M118 548 Q118 558 118 566" stroke="black" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />
      <path d="M182 548 Q182 558 182 566" stroke="black" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />
    </g>
  );
}

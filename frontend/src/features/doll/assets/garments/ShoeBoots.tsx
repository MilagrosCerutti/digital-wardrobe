import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

export function ShoeBoots({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.2} strokeWidth={1.5}>
      <path d="M 98 492 L 140 492 L 140 560 C 140 568, 133 577, 119 577 C 102 577, 91 572, 88 563 C 86 556, 90 549, 98 547 Z" />
      <path d="M 160 492 L 202 492 L 202 547 C 210 549, 214 556, 212 563 C 209 572, 198 577, 181 577 C 167 577, 160 568, 160 560 Z" />
    </g>
  );
}

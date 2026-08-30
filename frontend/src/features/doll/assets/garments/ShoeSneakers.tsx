import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

export function ShoeSneakers({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.2} strokeWidth={1.5}>
      <path d="M 99 544 L 139 544 L 141 560 C 141 568, 134 575, 120 575 C 103 575, 89 570, 86 561 C 84 554, 89 548, 99 544 Z" />
      <path d="M 161 544 L 201 544 C 211 548, 216 554, 214 561 C 211 570, 197 575, 180 575 C 166 575, 159 568, 159 560 Z" />
      <path d="M99 552 L141 552" stroke="black" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />
      <path d="M159 552 L201 552" stroke="black" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />
    </g>
  );
}

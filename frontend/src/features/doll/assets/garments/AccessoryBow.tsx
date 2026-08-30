import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** A hair bow worn at the crown, just above the hairline. */
export function AccessoryBow({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.15} strokeWidth={1}>
      <path d="M104 34 C 112 24, 126 24, 132 34 C 126 38, 126 44, 132 48 C 126 52, 112 52, 104 48 C 110 44, 110 38, 104 34 Z" />
      <circle cx="118" cy="41" r="4.5" fill="#fff" fillOpacity={0.6} />
    </g>
  );
}

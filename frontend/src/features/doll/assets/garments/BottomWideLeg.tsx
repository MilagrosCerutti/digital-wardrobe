import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** Wide-leg trousers, waist to ankle. */
export function BottomWideLeg({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.15} strokeWidth={1.5}>
      <path d="M 108 228 C 100 245, 95 258, 94 266 L 82 540 L 118 540 L 143 270 L 146 270 L 150 400 L 154 270 L 157 270 L 182 540 L 218 540 L 206 266 C 204 258, 200 245, 192 228 C 197 218, 203 205, 205 185 L 192 190 C 185 205, 178 216, 166 222 C 160 225, 140 225, 134 222 C 122 216, 115 205, 108 190 L 95 185 C 97 205, 103 218, 108 228 Z" />
    </g>
  );
}

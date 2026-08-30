import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** A-line mini skirt, waist to mid-thigh. */
export function BottomSkirt({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.15} strokeWidth={1.5}>
      <path d="M 108 228 C 100 245, 96 258, 96 264 C 92 300, 84 335, 72 365 L 228 365 C 216 335, 208 300, 204 264 C 204 258, 200 245, 192 228 C 197 218, 203 205, 205 185 L 192 190 C 185 205, 178 216, 166 222 C 160 225, 140 225, 134 222 C 122 216, 115 205, 108 190 L 95 185 C 97 205, 103 218, 108 228 Z" />
    </g>
  );
}

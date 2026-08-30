import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** Straight-leg jeans, waist to ankle. */
export function BottomJeans({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.15} strokeWidth={1.5}>
      <path d="M 108 228 C 100 245, 96 258, 96 268 L 100 420 C 101 470, 103 510, 106 548 L 138 548 L 143 400 C 144 350, 145 300, 146 262 L 154 262 C 155 300, 156 350, 157 400 L 162 548 L 194 548 C 197 510, 199 470, 200 420 L 204 268 C 204 258, 200 245, 192 228 C 197 218, 203 205, 205 185 L 192 190 C 185 205, 178 216, 166 222 C 160 225, 140 225, 134 222 C 122 216, 115 205, 108 190 L 95 185 C 97 205, 103 218, 108 228 Z" />
      <path d="M150 232 L150 400" stroke="black" strokeOpacity={0.2} strokeWidth={1} fill="none" />
    </g>
  );
}

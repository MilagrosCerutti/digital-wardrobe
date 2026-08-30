import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** Fitted mini dress with gathered short sleeves. */
export function DressMini({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.12} strokeWidth={1.5}>
      <path d="M 117 131 C 104 137, 94 149, 89 164 L 107 178 C 111 164, 117 153, 125 145 L 121 175 L 130 178 L 122 340 C 114 355, 108 368, 102 380 L 198 380 C 192 368, 186 355, 178 340 L 170 178 L 179 175 L 175 145 C 183 153, 189 164, 193 178 L 211 164 C 206 149, 196 137, 183 131 C 177 141, 168 148, 159 150 L 163 160 L 150 168 L 137 160 L 141 150 C 132 148, 123 141, 117 131 Z" />
    </g>
  );
}

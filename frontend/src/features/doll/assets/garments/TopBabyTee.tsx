import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** Cropped, short-sleeved baby tee ending above the waist. */
export function TopBabyTee({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.12} strokeWidth={1.5}>
      <path d="M 118 132 C 106 137, 96 148, 91 162 L 108 174 C 111 162, 116 152, 123 144 L 123 232 C 138 236, 162 236, 177 232 L 177 144 C 184 152, 189 162, 192 174 L 209 162 C 204 148, 194 137, 182 132 C 176 141, 167 148, 158 150 L 156 140 L 144 140 L 142 150 C 133 148, 124 141, 118 132 Z" />
    </g>
  );
}

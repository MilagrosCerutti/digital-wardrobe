import type { HairProps } from '@/features/doll/assets/hair/HairLong';

/** Chin-length bob. */
export function HairShort({ color }: HairProps) {
  return (
    <g fill={color}>
      <path d="M150 28 C 122 28, 102 46, 98 74 C 96 90, 98 104, 104 116 C 106 100, 108 86, 114 76 C 118 90, 120 100, 120 112 C 124 96, 128 82, 135 72 L 150 46 L 165 72 C 172 82, 176 96, 180 112 C 180 100, 182 90, 186 76 C 192 86, 194 100, 196 116 C 202 104, 204 90, 202 74 C 198 46, 178 28, 150 28 Z" />
    </g>
  );
}

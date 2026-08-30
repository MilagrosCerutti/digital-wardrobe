import type { HairProps } from '@/features/doll/assets/hair/HairLong';

/** Hair swept back with a single gathered tail falling past the shoulder. */
export function HairPonytail({ color }: HairProps) {
  return (
    <g fill={color}>
      <path d="M150 28 C 124 28, 105 44, 100 70 C 97 85, 99 97, 104 106 C 107 92, 111 80, 118 70 C 123 84, 125 96, 124 108 C 129 92, 134 78, 142 68 L 150 46 L 158 68 C 163 76, 167 86, 170 98 C 174 88, 177 78, 182 70 C 188 80, 191 92, 190 106 C 196 96, 200 84, 199 70 C 195 44, 176 28, 150 28 Z" />
      <path d="M172 44 C 190 50, 203 66, 208 88 C 212 110, 209 134, 200 158 C 195 172, 189 184, 182 193 C 179 186, 180 174, 183 158 C 188 134, 187 108, 178 84 C 175 72, 172 58, 172 44 Z" />
    </g>
  );
}

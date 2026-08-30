import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

export function AccessorySunglasses({ color }: GarmentProps) {
  return (
    <g fill={color} opacity={0.92}>
      <ellipse cx="132" cy="76" rx="14" ry="11" />
      <ellipse cx="168" cy="76" rx="14" ry="11" />
      <path d="M146 74 Q150 71 154 74" stroke={color} strokeWidth={3} fill="none" />
      <path d="M118 74 L108 70" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M182 74 L192 70" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
}

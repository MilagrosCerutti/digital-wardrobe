import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

export function AccessoryNecklace({ color }: GarmentProps) {
  return (
    <g fill="none" stroke={color} strokeWidth={2.5}>
      <path d="M132 138 Q150 156 168 138" strokeLinecap="round" />
      <circle cx="150" cy="156" r="4" fill={color} stroke="none" />
    </g>
  );
}

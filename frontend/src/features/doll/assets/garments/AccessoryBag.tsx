import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

export function AccessoryBag({ color }: GarmentProps) {
  return (
    <g stroke={color} strokeWidth={5} fill="none">
      <path d="M132 300 C 132 285, 139 274, 150 274 C 161 274, 168 285, 168 300" />
      <path
        d="M118 330 L182 330 L190 398 C 190 407, 180 414, 150 414 C 120 414, 110 407, 110 398 Z"
        fill={color}
        fillOpacity={0.85}
        stroke="black"
        strokeOpacity={0.15}
        strokeWidth={1.5}
      />
    </g>
  );
}

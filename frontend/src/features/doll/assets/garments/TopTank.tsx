export interface GarmentProps {
  color: string;
}

/** Fitted sleeveless tank top, chest to hip. */
export function TopTank({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.12} strokeWidth={1.5}>
      <path d="M 118 132 C 108 136, 100 144, 96 156 L 110 165 C 113 155, 117 147, 122 141 L 122 292 C 138 296, 162 296, 178 292 L 178 141 C 183 147, 187 155, 190 165 L 204 156 C 200 144, 192 136, 182 132 C 176 140, 168 146, 160 148 L 158 138 L 142 138 L 140 148 C 132 146, 124 140, 118 132 Z" />
    </g>
  );
}

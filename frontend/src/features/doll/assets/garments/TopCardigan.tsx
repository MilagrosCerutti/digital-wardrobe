import type { GarmentProps } from '@/features/doll/assets/garments/TopTank';

/** Cropped open-front cardigan with long sleeves. */
export function TopCardigan({ color }: GarmentProps) {
  return (
    <g fill={color} stroke="black" strokeOpacity={0.15} strokeWidth={1.5}>
      {/* left sleeve, offset slightly outside the arm for an oversized cuff */}
      <path d="M 108 138 C 88 148, 74 166, 68 198 C 64 224, 65 250, 70 272 L 88 272 C 84 250, 83 226, 87 202 C 91 178, 100 160, 116 148 Z" />
      {/* right sleeve */}
      <path d="M 192 138 C 212 148, 226 166, 232 198 C 236 224, 235 250, 230 272 L 212 272 C 216 250, 217 226, 213 202 C 209 178, 200 160, 184 148 Z" />
      {/* left front panel */}
      <path d="M 116 148 C 122 154, 130 158, 138 160 L 141 226 L 120 226 L 113 158 C 113 154, 114 151, 116 148 Z" />
      {/* right front panel */}
      <path d="M 184 148 C 178 154, 170 158, 162 160 L 159 226 L 180 226 L 187 158 C 187 154, 186 151, 184 148 Z" />
      {/* collar */}
      <path
        d="M 141 146 C 144 152, 148 156, 150 158 C 152 156, 156 152, 159 146 L 156 138 L 144 138 Z"
        fillOpacity={0.85}
      />
    </g>
  );
}

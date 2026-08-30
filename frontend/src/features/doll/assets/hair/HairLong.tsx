export interface HairProps {
  color: string;
}

/** Long, center-parted hair framing both sides of the face, matching the landing-page character. */
export function HairLong({ color }: HairProps) {
  return (
    <g fill={color}>
      <path d="M116 55 C 108 75, 100 110, 98 160 C 96 210, 98 250, 104 280 C 106 288, 116 288, 116 278 C 112 250, 110 215, 112 175 C 114 135, 120 100, 128 75 Z" />
      <path d="M184 55 C 192 75, 200 110, 202 160 C 204 210, 202 250, 196 280 C 194 288, 184 288, 184 278 C 188 250, 190 215, 188 175 C 186 135, 180 100, 172 75 Z" />
      <path d="M150 28 C 126 28, 108 42, 101 66 C 97 80, 97 92, 100 102 C 103 90, 108 78, 116 68 C 122 58, 132 50, 141 46 L 150 46 L 159 46 C 168 50, 178 58, 184 68 C 192 78, 197 90, 200 102 C 203 92, 203 80, 199 66 C 192 42, 174 28, 150 28 Z" />
    </g>
  );
}

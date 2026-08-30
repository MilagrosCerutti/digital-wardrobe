/**
 * Shared coordinate system for the layered 2D doll.
 *
 * Every visual layer (body, hair, and every garment) is authored against this
 * exact same viewBox and the same anchor points below. Garments align with
 * the body because they are drawn to meet these coordinates directly, not
 * because they are nudged into place with per-render CSS offsets.
 *
 * Anchor reference (approximate y-coordinates down the figure):
 *   headTop=32  shoulder=132  bust=165  waist=230  hip=262  knee=400  ankle=548
 */
export const DOLL_VIEWBOX = '0 0 300 600';
export const DOLL_CENTER_X = 150;

export const DOLL_ANCHORS = {
  shoulderY: 132,
  waistY: 230,
  hipY: 262,
  hemMiniY: 380,
  hemMidiY: 460,
  ankleY: 548,
} as const;

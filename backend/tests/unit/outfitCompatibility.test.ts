import { calculateOutfitCompatibility } from '@/services/outfitCompatibility';
import { FormalityLevel } from '@/types/clothingItem.types';

function item(formalityLevel: FormalityLevel, colorIds: string[], styleIds: string[]) {
  return { formalityLevel, colorIds, styleIds };
}

describe('calculateOutfitCompatibility', () => {
  it('scores 100 when every item shares the same formality, color, and style', () => {
    const result = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('CASUAL', ['pink'], ['y2k']),
    ]);

    expect(result.score).toBe(100);
    expect(result.breakdown).toEqual({ formalityScore: 100, colorScore: 100, styleScore: 100 });
  });

  it('scores 0 when items share nothing at all across every dimension', () => {
    const result = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('VERY_FORMAL', ['black'], ['formal']),
    ]);

    expect(result.breakdown).toEqual({ formalityScore: 0, colorScore: 0, styleScore: 0 });
    expect(result.score).toBe(0);
  });

  it('penalizes formality mismatches proportionally to the spread', () => {
    const oneStepApart = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('SMART_CASUAL', ['pink'], ['y2k']),
    ]);
    const twoStepsApart = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('FORMAL', ['pink'], ['y2k']),
    ]);
    const threeStepsApart = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('VERY_FORMAL', ['pink'], ['y2k']),
    ]);

    expect(oneStepApart.breakdown.formalityScore).toBe(67);
    expect(twoStepsApart.breakdown.formalityScore).toBe(33);
    expect(threeStepsApart.breakdown.formalityScore).toBe(0);
    expect(oneStepApart.score).toBeGreaterThan(twoStepsApart.score);
    expect(twoStepsApart.score).toBeGreaterThan(threeStepsApart.score);
  });

  it('only requires sharing one color, not identical color sets', () => {
    const result = calculateOutfitCompatibility([
      item('CASUAL', ['pink', 'white'], ['y2k']),
      item('CASUAL', ['pink', 'lilac'], ['y2k']),
    ]);

    expect(result.breakdown.colorScore).toBe(100);
  });

  it('computes color score as the share of item pairs with any overlap for three or more items', () => {
    // pink+white / pink+black share pink; white/black share nothing -> 2 of 3 pairs.
    const result = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], []),
      item('CASUAL', ['pink', 'white'], []),
      item('CASUAL', ['black'], []),
    ]);

    expect(result.breakdown.colorScore).toBe(33);
  });

  it('is not affected by item order', () => {
    const a = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('FORMAL', ['black'], ['formal']),
      item('SMART_CASUAL', ['pink'], ['formal']),
    ]);
    const b = calculateOutfitCompatibility([
      item('SMART_CASUAL', ['pink'], ['formal']),
      item('CASUAL', ['pink'], ['y2k']),
      item('FORMAL', ['black'], ['formal']),
    ]);

    expect(a).toEqual(b);
  });

  it('handles an item with no styles by treating shared-style pairs as non-overlapping', () => {
    const result = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], []),
      item('CASUAL', ['pink'], ['y2k']),
    ]);

    expect(result.breakdown.styleScore).toBe(0);
    expect(result.breakdown.colorScore).toBe(100);
  });

  it('weights formality 40%, color 30%, and style 30%', () => {
    // formality=100, color=0, style=0 -> 0.4*100 = 40
    const result = calculateOutfitCompatibility([
      item('CASUAL', ['pink'], ['y2k']),
      item('CASUAL', ['black'], ['formal']),
    ]);

    expect(result.score).toBe(40);
  });
});

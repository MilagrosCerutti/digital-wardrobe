import { GeneratorItem, generateCandidates, rankCandidates } from '@/services/inspireMeGenerator';

function buildItem(overrides: Partial<GeneratorItem> = {}): GeneratorItem {
  return {
    id: 'item-1',
    categoryName: 'Tops',
    formalityLevel: 'CASUAL',
    colorIds: [],
    styleIds: [],
    isFavorite: false,
    ...overrides,
  };
}

const SHOES = buildItem({ id: 'shoes-1', categoryName: 'Shoes' });
const ACCESSORY = buildItem({ id: 'acc-1', categoryName: 'Accessories' });

describe('inspireMeGenerator.generateCandidates', () => {
  it('combines every top with every bottom, always adding Shoes and Accessories', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'top-2', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      SHOES,
      ACCESSORY,
    ];

    const candidates = generateCandidates(pool);

    const ids = candidates.map((c) => c.items.map((i) => i.id).sort().join(','));
    expect(ids).toContain('acc-1,bottom-1,shoes-1,top-1');
    expect(ids).toContain('acc-1,bottom-1,shoes-1,top-2');
  });

  it('produces no candidates for a closet with Tops/Bottoms but no Shoes', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      ACCESSORY,
    ];

    expect(generateCandidates(pool)).toEqual([]);
  });

  it('produces no candidates for a closet with Tops/Bottoms but no Accessories', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      SHOES,
    ];

    expect(generateCandidates(pool)).toEqual([]);
  });

  it('requires a lone Dress to also have Shoes and Accessories', () => {
    const withoutAccessories = [buildItem({ id: 'dress-1', categoryName: 'Dresses' }), SHOES];
    expect(generateCandidates(withoutAccessories)).toEqual([]);

    const complete = [buildItem({ id: 'dress-1', categoryName: 'Dresses' }), SHOES, ACCESSORY];
    const candidates = generateCandidates(complete);
    const ids = candidates.map((c) => c.items.map((i) => i.id).sort());
    expect(ids).toContainEqual(['acc-1', 'dress-1', 'shoes-1']);
  });

  it('treats Outerwear as the only optional slot, including a "none" option', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      buildItem({ id: 'jacket-1', categoryName: 'Outerwear' }),
      SHOES,
      ACCESSORY,
    ];

    const candidates = generateCandidates(pool);
    const itemSets = candidates.map((c) => c.items.map((i) => i.id).sort());

    expect(itemSets).toContainEqual(['acc-1', 'bottom-1', 'shoes-1', 'top-1']);
    expect(itemSets).toContainEqual(['acc-1', 'bottom-1', 'jacket-1', 'shoes-1', 'top-1']);
  });

  it('never produces a candidate with two items in the same slot', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'top-2', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      SHOES,
      ACCESSORY,
    ];

    const candidates = generateCandidates(pool);
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      const tops = candidate.items.filter((item) => item.categoryName === 'Tops');
      expect(tops.length).toBeLessThanOrEqual(1);
    }
  });

  it('ignores items whose category does not match a known outfit slot', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      buildItem({ id: 'mystery-1', categoryName: 'Unknown Category' }),
      SHOES,
      ACCESSORY,
    ];

    const candidates = generateCandidates(pool);
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(candidate.items.some((item) => item.id === 'mystery-1')).toBe(false);
    }
  });

  it('pins the required item into every candidate', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'top-2', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      SHOES,
      ACCESSORY,
    ];

    const candidates = generateCandidates(pool, { requiredItemId: 'top-2' });

    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(candidate.items.some((item) => item.id === 'top-2')).toBe(true);
      expect(candidate.items.some((item) => item.id === 'top-1')).toBe(false);
    }
  });

  it('forces a required optional-slot item into every candidate (no "none" option)', () => {
    const pool = [
      buildItem({ id: 'top-1', categoryName: 'Tops' }),
      buildItem({ id: 'bottom-1', categoryName: 'Bottoms' }),
      buildItem({ id: 'jacket-1', categoryName: 'Outerwear' }),
      SHOES,
      ACCESSORY,
    ];

    const candidates = generateCandidates(pool, { requiredItemId: 'jacket-1' });

    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(candidate.items.some((item) => item.id === 'jacket-1')).toBe(true);
    }
  });

  it('returns no candidates for an empty pool', () => {
    expect(generateCandidates([])).toEqual([]);
  });
});

describe('inspireMeGenerator.rankCandidates', () => {
  it('scores full marks when the outfit matches the target formality and shares colors/styles', () => {
    const items = [
      buildItem({ id: 'top-1', formalityLevel: 'CASUAL', colorIds: ['red'], styleIds: ['boho'] }),
      buildItem({ id: 'bottom-1', formalityLevel: 'CASUAL', colorIds: ['red'], styleIds: ['boho'] }),
    ];

    const [ranked] = rankCandidates([{ items }], { formalityTarget: 'CASUAL', useFavorites: false });

    expect(ranked!.compatibilityScore).toBe(100);
    expect(ranked!.compatibilityBreakdown).toEqual({ formalityScore: 100, colorScore: 100, styleScore: 100 });
  });

  it('scores the Formality component by alignment to the target, not by the outfit\'s own internal spread', () => {
    // Two CASUAL items are perfectly cohesive with each other (spread 0), but
    // the user asked for VERY_FORMAL -- the displayed Formality score should
    // reflect that mismatch, not the internal cohesion.
    const casualPair = [
      buildItem({ id: 'top-1', formalityLevel: 'CASUAL' }),
      buildItem({ id: 'bottom-1', formalityLevel: 'CASUAL' }),
    ];
    // One VERY_FORMAL item paired with one CASUAL item averages to FORMAL-ish,
    // which is closer to the VERY_FORMAL target than two CASUAL items are.
    const mixedWithFormalPiece = [
      buildItem({ id: 'top-2', formalityLevel: 'CASUAL' }),
      buildItem({ id: 'shoes-2', formalityLevel: 'VERY_FORMAL' }),
    ];

    const ranked = rankCandidates(
      [{ items: casualPair }, { items: mixedWithFormalPiece }],
      { formalityTarget: 'VERY_FORMAL', useFavorites: false },
    );

    const casualResult = ranked.find((c) => c.items.some((i) => i.id === 'top-1'))!;
    const mixedResult = ranked.find((c) => c.items.some((i) => i.id === 'shoes-2'))!;

    expect(mixedResult.compatibilityBreakdown.formalityScore).toBeGreaterThan(
      casualResult.compatibilityBreakdown.formalityScore,
    );
  });

  it('ranks a candidate closer to the formality target above an otherwise-identical one that is not, without excluding either', () => {
    const onTarget = {
      items: [
        buildItem({ id: 'a1', formalityLevel: 'FORMAL' }),
        buildItem({ id: 'a2', formalityLevel: 'FORMAL' }),
      ],
    };
    const offTarget = {
      items: [
        buildItem({ id: 'b1', formalityLevel: 'CASUAL' }),
        buildItem({ id: 'b2', formalityLevel: 'CASUAL' }),
      ],
    };

    const ranked = rankCandidates([offTarget, onTarget], { formalityTarget: 'FORMAL', useFavorites: false });

    expect(ranked).toHaveLength(2);
    expect(ranked[0]!.items.map((i) => i.id)).toEqual(['a1', 'a2']);
  });

  it('gives a meaningful favorites bonus without excluding non-favorite candidates', () => {
    const withFavorite = {
      items: [buildItem({ id: 'a1', isFavorite: true }), buildItem({ id: 'a2' })],
    };
    const withoutFavorite = {
      items: [buildItem({ id: 'b1' }), buildItem({ id: 'b2' })],
    };

    const ranked = rankCandidates([withoutFavorite, withFavorite], {
      formalityTarget: 'CASUAL',
      useFavorites: true,
    });

    expect(ranked).toHaveLength(2);
    expect(ranked[0]!.items.map((i) => i.id)).toEqual(['a1', 'a2']);
    expect(ranked[0]!.rankingScore).toBeGreaterThan(ranked[1]!.rankingScore);
    // Never excluded - both candidates are still present.
    expect(ranked.some((c) => c.items.map((i) => i.id).join(',') === 'b1,b2')).toBe(true);
  });

  it('applies no favorites bonus when useFavorites is false', () => {
    const withFavorite = {
      items: [buildItem({ id: 'a1', isFavorite: true }), buildItem({ id: 'a2', isFavorite: true })],
    };

    const [ranked] = rankCandidates([withFavorite], { formalityTarget: 'CASUAL', useFavorites: false });

    expect(ranked!.rankingScore).toBe(ranked!.compatibilityScore);
  });
});

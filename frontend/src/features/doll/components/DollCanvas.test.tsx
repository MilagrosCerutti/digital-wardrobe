import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DollCanvas } from './DollCanvas';
import type { Doll, DollItem } from '@/features/doll/types/doll.types';

const DOLL: Doll = {
  id: 'doll-1',
  userId: 'user-1',
  bodyType: 'AVERAGE',
  skinTone: 'MEDIUM',
  hairStyle: 'LONG',
  hairColor: 'BROWN',
  eyeColor: 'BROWN',
  createdAt: '',
  updatedAt: '',
};

function buildItem(overrides: Partial<DollItem>): DollItem {
  return {
    id: 'item-1',
    name: 'Item',
    category: 'TOP',
    layer: 20,
    assetUrl: 'top-tank',
    color: '#F2A7C3',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('DollCanvas', () => {
  it('renders as a single composed SVG with a doll accessible name', () => {
    const { getByRole } = render(<DollCanvas doll={DOLL} equippedItems={[]} />);

    expect(getByRole('img', { name: 'Your doll' })).toBeInTheDocument();
  });

  it('renders a separately equipped top and bottom together', () => {
    const top = buildItem({ id: 'top-1', category: 'TOP', assetUrl: 'top-tank' });
    const bottom = buildItem({ id: 'bottom-1', category: 'BOTTOM', assetUrl: 'bottom-jeans' });

    const { container } = render(<DollCanvas doll={DOLL} equippedItems={[top, bottom]} />);

    // Both garment layers are present in the composed SVG -- 'top-tank' has a
    // raster asset (assets/wardrobeRaster.ts) and renders as <image>,
    // 'bottom-jeans' doesn't yet and renders as a vector <g>, so this counts
    // both element kinds rather than assuming every garment is a <g>.
    const garmentLayers = container.querySelectorAll('svg > g, svg > image');
    expect(garmentLayers.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render a floating top or bottom underneath an equipped dress', () => {
    const top = buildItem({ id: 'top-1', category: 'TOP', assetUrl: 'top-tank' });
    const bottom = buildItem({ id: 'bottom-1', category: 'BOTTOM', assetUrl: 'bottom-jeans' });
    const dress = buildItem({ id: 'dress-1', category: 'DRESS', assetUrl: 'dress-slip' });

    // A stale top/bottom in equippedItems (e.g. from a not-yet-refetched cache)
    // must not be rendered once a dress is present -- the canvas is a
    // defensive last line, independent of the backend's own exclusivity rule.
    const { container: withDress } = render(
      <DollCanvas doll={DOLL} equippedItems={[top, bottom, dress]} />,
    );
    const { container: dressOnly } = render(<DollCanvas doll={DOLL} equippedItems={[dress]} />);

    expect(withDress.querySelector('svg')?.innerHTML).toBe(dressOnly.querySelector('svg')?.innerHTML);
  });
});

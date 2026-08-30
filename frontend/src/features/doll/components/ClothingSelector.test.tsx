import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClothingSelector } from './ClothingSelector';
import type { DollItem } from '@/features/doll/types/doll.types';

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

describe('ClothingSelector', () => {
  it('shows one thumbnail per garment silhouette, not one per color variant', () => {
    const items = [
      buildItem({ id: 'tank-pink', name: 'Ribbed Tank — Pink', assetUrl: 'top-tank', color: '#F2A7C3' }),
      buildItem({ id: 'tank-lilac', name: 'Ribbed Tank — Lilac', assetUrl: 'top-tank', color: '#C9B6E8' }),
      buildItem({ id: 'blouse', name: 'Blouse — Cream', assetUrl: 'top-blouse', color: '#FCEEE3' }),
    ];

    render(<ClothingSelector items={items} equippedItem={undefined} onEquip={vi.fn()} onUnequip={vi.fn()} />);

    // Only one card per silhouette (2 tank variants collapse into one).
    expect(screen.getAllByRole('button', { name: /Ribbed Tank/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Blouse/ })).toBeInTheDocument();
  });

  it('equips an unequipped garment on click', async () => {
    const user = userEvent.setup();
    const onEquip = vi.fn();
    const item = buildItem({ id: 'tank-pink' });

    render(<ClothingSelector items={[item]} equippedItem={undefined} onEquip={onEquip} onUnequip={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: item.name }));

    expect(onEquip).toHaveBeenCalledWith(item);
  });

  it('unequips an already-equipped garment on click', async () => {
    const user = userEvent.setup();
    const onUnequip = vi.fn();
    const item = buildItem({ id: 'tank-pink' });

    render(<ClothingSelector items={[item]} equippedItem={item} onEquip={vi.fn()} onUnequip={onUnequip} />);
    await user.click(screen.getByRole('button', { name: item.name }));

    expect(onUnequip).toHaveBeenCalledWith(item);
  });

  it('shows the color picker for the already-equipped garment by default', () => {
    const pink = buildItem({ id: 'tank-pink', assetUrl: 'top-tank', color: '#F2A7C3' });
    const lilac = buildItem({ id: 'tank-lilac', assetUrl: 'top-tank', color: '#C9B6E8' });

    render(
      <ClothingSelector items={[pink, lilac]} equippedItem={pink} onEquip={vi.fn()} onUnequip={vi.fn()} />,
    );

    expect(screen.getByRole('group', { name: 'Colors' }).children).toHaveLength(2);
  });

  it('does not show a color picker for a single-color garment', () => {
    const item = buildItem({ id: 'blouse', assetUrl: 'top-blouse' });

    render(<ClothingSelector items={[item]} equippedItem={item} onEquip={vi.fn()} onUnequip={vi.fn()} />);

    expect(screen.queryByRole('group', { name: 'Colors' })).not.toBeInTheDocument();
  });
});

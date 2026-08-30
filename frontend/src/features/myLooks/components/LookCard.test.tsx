import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LookCard } from './LookCard';
import type { Outfit } from '@/features/myLooks/types/myLooks.types';

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(id: string, subcategoryName = 'T-Shirt') {
  return {
    id,
    userId: 'user-1',
    imageUrl: `https://example.com/${id}.png`,
    category: buildCatalogEntry('cat-1', 'Tops'),
    subcategory: buildCatalogEntry('sub-1', subcategoryName),
    material: buildCatalogEntry('mat-1', 'Cotton'),
    pattern: buildCatalogEntry('pat-1', 'Solid'),
    colors: [],
    styles: [],
    fit: 'REGULAR' as const,
    formalityLevel: 'CASUAL' as const,
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
  };
}

function buildOutfit(overrides: Partial<Outfit> = {}): Outfit {
  return {
    id: 'outfit-1',
    userId: 'user-1',
    name: 'Weekend Look',
    source: 'MANUAL',
    compatibilityScore: 90,
    compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
    items: [buildItem('item-1'), buildItem('item-2')],
    occasion: null,
    mood: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('LookCard', () => {
  it('shows the look name, item count, and compatibility score', () => {
    render(<LookCard outfit={buildOutfit()} />);

    expect(screen.getByText('Weekend Look')).toBeInTheDocument();
    expect(screen.getByText('2 pieces')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('shows a muted "Untitled look" label when the outfit has no name', () => {
    render(<LookCard outfit={buildOutfit({ name: null })} />);

    expect(screen.getByText('Untitled look')).toBeInTheDocument();
  });

  it('shows a +N overlay when there are more than 4 items', () => {
    const items = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'].map((id) => buildItem(id));
    render(<LookCard outfit={buildOutfit({ items })} />);

    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<LookCard outfit={buildOutfit()} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows a Generated badge for a generated look', () => {
    render(<LookCard outfit={buildOutfit({ source: 'GENERATED' })} />);

    expect(screen.getByText('Generated')).toBeInTheDocument();
  });

  it('does not show a Generated badge for a manual look', () => {
    render(<LookCard outfit={buildOutfit({ source: 'MANUAL' })} />);

    expect(screen.queryByText('Generated')).not.toBeInTheDocument();
  });
});

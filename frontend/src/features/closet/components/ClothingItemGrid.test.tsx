import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClothingItemGrid } from './ClothingItemGrid';
import type { ClothingItem } from '@/features/closet/types/closet.types';

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: 'item-1',
    userId: 'user-1',
    imageUrl: 'https://example.com/image.png',
    category: buildCatalogEntry('cat-1', 'Tops'),
    subcategory: buildCatalogEntry('sub-1', 'T-Shirt'),
    material: buildCatalogEntry('mat-1', 'Cotton'),
    pattern: buildCatalogEntry('pat-1', 'Solid'),
    colors: [{ ...buildCatalogEntry('color-1', 'Pink'), hex: '#F2A7C3' }],
    styles: [],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ClothingItemGrid', () => {
  it('shows the empty-closet message when there are no items and no filters', () => {
    render(<ClothingItemGrid items={[]} hasActiveFilters={false} />);

    expect(screen.getByText('Your closet is empty')).toBeInTheDocument();
  });

  it('shows a different message when filters produced zero results', () => {
    render(<ClothingItemGrid items={[]} hasActiveFilters />);

    expect(screen.getByText('No pieces match these filters')).toBeInTheDocument();
  });

  it('renders a card for each item', () => {
    render(<ClothingItemGrid items={[buildItem(), buildItem({ id: 'item-2' })]} hasActiveFilters={false} />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('shows an Archived badge for archived items', () => {
    render(<ClothingItemGrid items={[buildItem({ isArchived: true })]} hasActiveFilters={false} />);

    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('shows a filled heart for favorited items and calls onToggleFavorite when clicked, without triggering onItemClick', async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    const onItemClick = vi.fn();
    render(
      <ClothingItemGrid
        items={[buildItem({ isFavorite: true })]}
        hasActiveFilters={false}
        onItemClick={onItemClick}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    const favoriteButton = screen.getByRole('button', { name: 'Remove from favorites' });
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(favoriteButton);

    expect(onToggleFavorite).toHaveBeenCalledWith(expect.objectContaining({ id: 'item-1' }));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('shows an empty heart for non-favorited items', () => {
    render(
      <ClothingItemGrid
        items={[buildItem({ isFavorite: false })]}
        hasActiveFilters={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Add to favorites' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

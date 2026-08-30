import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StyleItemGrid } from './StyleItemGrid';
import type { ClothingItem } from '@/features/styleIt/types/styleIt.types';

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
    colors: [],
    styles: [],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('StyleItemGrid', () => {
  it('shows an empty state when there are no items', () => {
    render(<StyleItemGrid items={[]} selectedIds={new Set()} onToggle={vi.fn()} />);

    expect(screen.getByText('No pieces match these filters')).toBeInTheDocument();
  });

  it('calls onToggle when an item is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const item = buildItem();
    render(<StyleItemGrid items={[item]} selectedIds={new Set()} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: /T-Shirt/ }));

    expect(onToggle).toHaveBeenCalledWith(item);
  });

  it('marks a selected item as pressed and shows the "On" badge', () => {
    const item = buildItem();
    render(<StyleItemGrid items={[item]} selectedIds={new Set(['item-1'])} onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: /T-Shirt/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('On')).toBeInTheDocument();
  });
});

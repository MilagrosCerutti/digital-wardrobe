import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CurrentLookPanel } from './CurrentLookPanel';
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

const BASE_PROPS = {
  onRemove: vi.fn(),
  isPreviewLoading: false,
  name: '',
  onNameChange: vi.fn(),
  onSave: vi.fn(),
  isSaving: false,
  onClear: vi.fn(),
};

describe('CurrentLookPanel', () => {
  it('shows a hint and disables save when nothing is selected', () => {
    render(<CurrentLookPanel {...BASE_PROPS} selectedItems={[]} />);

    expect(screen.getByText('Tap pieces from your closet to start building a look.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Look' })).toBeDisabled();
  });

  it('prompts for a second item when only one is selected', () => {
    render(<CurrentLookPanel {...BASE_PROPS} selectedItems={[buildItem()]} />);

    expect(
      screen.getByText('Add one more piece to see your compatibility score.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Look' })).toBeDisabled();
  });

  it('enables save and shows the compatibility score with two or more items', () => {
    render(
      <CurrentLookPanel
        {...BASE_PROPS}
        selectedItems={[buildItem({ id: 'item-1' }), buildItem({ id: 'item-2' })]}
        preview={{ score: 82, breakdown: { formalityScore: 100, colorScore: 66, styleScore: 80 } }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save Look' })).toBeEnabled();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('calls onRemove when a selected item thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<CurrentLookPanel {...BASE_PROPS} onRemove={onRemove} selectedItems={[buildItem()]} />);

    await user.click(screen.getByTitle('Remove from look'));

    expect(onRemove).toHaveBeenCalledWith('item-1');
  });

  it('calls onSave when the Save Look button is clicked with two items', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <CurrentLookPanel
        {...BASE_PROPS}
        onSave={onSave}
        selectedItems={[buildItem({ id: 'item-1' }), buildItem({ id: 'item-2' })]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save Look' }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('only shows the Clear button when something is selected', () => {
    const { rerender } = render(<CurrentLookPanel {...BASE_PROPS} selectedItems={[]} />);
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

    rerender(<CurrentLookPanel {...BASE_PROPS} selectedItems={[buildItem()]} />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});

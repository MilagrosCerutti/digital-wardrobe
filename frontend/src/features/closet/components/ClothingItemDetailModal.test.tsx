import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ClothingItemDetailModal } from './ClothingItemDetailModal';
import { ToastProvider } from '@/components/Toast';
import * as closetService from '@/features/closet/services/closetService';
import type { Catalog, ClothingItem } from '@/features/closet/types/closet.types';

vi.mock('@/features/closet/services/closetService');
const mockedClosetService = vi.mocked(closetService);

const CATALOG: Catalog = {
  categories: [{ id: 'cat-tops', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' }],
  subcategories: [
    { id: 'sub-tshirt', name: 'T-Shirt', categoryId: 'cat-tops', isActive: true, createdAt: '', updatedAt: '' },
  ],
  materials: [{ id: 'mat-cotton', name: 'Cotton', isActive: true, createdAt: '', updatedAt: '' }],
  patterns: [{ id: 'pat-solid', name: 'Solid', isActive: true, createdAt: '', updatedAt: '' }],
  colors: [{ id: 'color-pink', name: 'Pink', hex: '#F2A7C3', isActive: true, createdAt: '', updatedAt: '' }],
  styles: [{ id: 'style-casual', name: 'Casual', isActive: true, createdAt: '', updatedAt: '' }],
  occasions: [],
};

function buildItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: 'item-1',
    userId: 'user-1',
    imageUrl: 'https://example.com/image.png',
    category: CATALOG.categories[0]!,
    subcategory: CATALOG.subcategories[0]!,
    material: CATALOG.materials[0]!,
    pattern: CATALOG.patterns[0]!,
    colors: [CATALOG.colors[0]!],
    styles: [CATALOG.styles[0]!],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function renderModal(item: ClothingItem | null, onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ClothingItemDetailModal catalog={CATALOG} item={item} onClose={onClose} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return { onClose };
}

describe('ClothingItemDetailModal', () => {
  it('renders nothing when there is no selected item', () => {
    renderModal(null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the item attributes in view mode', () => {
    renderModal(buildItem());

    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Tops')).toBeInTheDocument();
    expect(screen.getByText('Pink')).toBeInTheDocument();
    // "Casual" is shown both as the formality value and the style badge.
    expect(screen.getAllByText('Casual')).toHaveLength(2);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Archived status and a Restore action for an archived item', () => {
    renderModal(buildItem({ isArchived: true }));

    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
  });

  it('switches to edit mode and back to view mode on cancel', async () => {
    const user = userEvent.setup();
    renderModal(buildItem());

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Category')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('archives an active item and closes the modal', async () => {
    const user = userEvent.setup();
    mockedClosetService.archiveClothingItem.mockResolvedValue(buildItem({ isArchived: true }));
    const { onClose } = renderModal(buildItem());

    await user.click(screen.getByRole('button', { name: 'Archive' }));

    expect(mockedClosetService.archiveClothingItem.mock.calls[0]?.[0]).toBe('item-1');
    expect(await screen.findByText('Archived')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('restores an archived item', async () => {
    const user = userEvent.setup();
    mockedClosetService.restoreClothingItem.mockResolvedValue(buildItem({ isArchived: false }));
    const { onClose } = renderModal(buildItem({ isArchived: true }));

    await user.click(screen.getByRole('button', { name: 'Restore' }));

    expect(mockedClosetService.restoreClothingItem.mock.calls[0]?.[0]).toBe('item-1');
    expect(await screen.findByText('Restored to your closet')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a confirmation prompt instead of deleting immediately', async () => {
    const user = userEvent.setup();
    renderModal(buildItem());

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText('Do you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be reversed.')).toBeInTheDocument();
    expect(mockedClosetService.deleteClothingItem).not.toHaveBeenCalled();
  });

  it('does not delete an item when the user answers No', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal(buildItem());

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(mockedClosetService.deleteClothingItem).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    // Back to the normal view, not stuck on the confirmation prompt.
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('deletes an item when the user answers Yes', async () => {
    const user = userEvent.setup();
    mockedClosetService.deleteClothingItem.mockResolvedValue(undefined);
    const { onClose } = renderModal(buildItem());

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(mockedClosetService.deleteClothingItem.mock.calls[0]?.[0]).toBe('item-1');
    expect(await screen.findByText('Item deleted')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('favorites an item without closing the modal', async () => {
    const user = userEvent.setup();
    mockedClosetService.favoriteClothingItem.mockResolvedValue(buildItem({ isFavorite: true }));
    const { onClose } = renderModal(buildItem({ isFavorite: false }));

    const favoriteButton = screen.getByRole('button', { name: 'Add to favorites' });
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(favoriteButton);

    expect(mockedClosetService.favoriteClothingItem.mock.calls[0]?.[0]).toBe('item-1');
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('unfavorites an item without closing the modal', async () => {
    const user = userEvent.setup();
    mockedClosetService.unfavoriteClothingItem.mockResolvedValue(buildItem({ isFavorite: false }));
    const { onClose } = renderModal(buildItem({ isFavorite: true }));

    await user.click(screen.getByRole('button', { name: 'Remove from favorites' }));

    expect(mockedClosetService.unfavoriteClothingItem.mock.calls[0]?.[0]).toBe('item-1');
    expect(await screen.findByRole('button', { name: 'Add to favorites' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets to view mode when switching to a different item', () => {
    const { rerender } = render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ToastProvider>
          <ClothingItemDetailModal catalog={CATALOG} item={buildItem()} onClose={vi.fn()} />
        </ToastProvider>
      </QueryClientProvider>,
    );

    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ToastProvider>
          <ClothingItemDetailModal
            catalog={CATALOG}
            item={buildItem({ id: 'item-2', subcategory: { ...CATALOG.subcategories[0]!, name: 'Jacket' } })}
            onClose={vi.fn()}
          />
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

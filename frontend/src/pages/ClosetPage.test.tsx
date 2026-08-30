import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ClosetPage } from './ClosetPage';
import { ToastProvider } from '@/components/Toast';
import * as closetService from '@/features/closet/services/closetService';
import type { Catalog, ClothingItem } from '@/features/closet/types/closet.types';

vi.mock('@/features/closet/services/closetService');
const mockedClosetService = vi.mocked(closetService);

const CATALOG: Catalog = {
  categories: [{ id: 'cat-tops', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' }],
  subcategories: [],
  materials: [],
  patterns: [],
  colors: [],
  styles: [],
  occasions: [],
};

function buildItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: 'item-1',
    userId: 'user-1',
    imageUrl: 'https://example.com/image.png',
    category: { id: 'cat-tops', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' },
    subcategory: { id: 'sub-1', name: 'T-Shirt', isActive: true, createdAt: '', updatedAt: '' },
    material: { id: 'mat-1', name: 'Cotton', isActive: true, createdAt: '', updatedAt: '' },
    pattern: { id: 'pat-1', name: 'Solid', isActive: true, createdAt: '', updatedAt: '' },
    colors: [],
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

function renderClosetPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ClosetPage />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('ClosetPage', () => {
  it('shows the empty state when the user has no clothing items', async () => {
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([]);

    renderClosetPage();

    expect(await screen.findByText('Your closet is empty')).toBeInTheDocument();
  });

  it('shows an error state with retry when the closet fails to load', async () => {
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: 'Something broke.' } },
    });

    renderClosetPage();

    expect(await screen.findByText("Couldn't load your closet")).toBeInTheDocument();
    expect(screen.getByText('Something broke.')).toBeInTheDocument();
  });

  it('renders items once loaded and refetches when a filter changes', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem()]);

    renderClosetPage();

    expect(await screen.findByRole('img')).toBeInTheDocument();
    expect(mockedClosetService.fetchClothingItems).toHaveBeenCalledWith({});

    await user.selectOptions(screen.getByLabelText('Category'), 'cat-tops');

    await waitFor(() =>
      expect(mockedClosetService.fetchClothingItems).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-tops' }),
      ),
    );
  });

  it('toggles an item favorite state from the grid and refetches', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems
      .mockResolvedValueOnce([buildItem({ isFavorite: false })])
      .mockResolvedValueOnce([buildItem({ isFavorite: true })]);
    mockedClosetService.favoriteClothingItem.mockResolvedValue(buildItem({ isFavorite: true }));

    renderClosetPage();

    const favoriteButton = await screen.findByRole('button', { name: 'Add to favorites' });
    await user.click(favoriteButton);

    expect(mockedClosetService.favoriteClothingItem.mock.calls[0]?.[0]).toBe('item-1');
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeInTheDocument();
  }, 10000);

  it('filters to favorites only via the checkbox', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem()]);

    renderClosetPage();

    await screen.findByRole('img');
    await user.click(screen.getByLabelText('Favorites only'));

    await waitFor(() =>
      expect(mockedClosetService.fetchClothingItems).toHaveBeenCalledWith(
        expect.objectContaining({ favoritesOnly: true }),
      ),
    );
  });
});

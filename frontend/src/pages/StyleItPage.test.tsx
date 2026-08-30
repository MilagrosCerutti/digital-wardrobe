import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { StyleItPage } from './StyleItPage';
import { ToastProvider } from '@/components/Toast';
import * as closetService from '@/features/closet/services/closetService';
import * as styleItService from '@/features/styleIt/services/styleItService';
import type { Catalog, ClothingItem } from '@/features/closet/types/closet.types';

vi.mock('@/features/closet/services/closetService');
vi.mock('@/features/styleIt/services/styleItService');
const mockedClosetService = vi.mocked(closetService);
const mockedStyleItService = vi.mocked(styleItService);

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
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <StyleItPage />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('StyleItPage', () => {
  it('shows an empty state when the closet has no items', async () => {
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('No pieces match these filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Look' })).toBeDisabled();
  });

  it('selects two items, fetches the live preview, and saves the look', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2', subcategory: { id: 'sub-2', name: 'Jeans', isActive: true, createdAt: '', updatedAt: '' } }),
    ]);
    mockedStyleItService.previewOutfit.mockResolvedValue({
      score: 90,
      breakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
    });
    mockedStyleItService.createOutfit.mockResolvedValue({
      id: 'outfit-1',
      userId: 'user-1',
      name: null,
      source: 'MANUAL',
      compatibilityScore: 90,
      compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
      items: [],
      occasion: null,
      mood: null,
      createdAt: '',
      updatedAt: '',
    });

    renderPage();

    await user.click(await screen.findByRole('button', { name: /T-Shirt/ }));
    await user.click(screen.getByRole('button', { name: /Jeans/ }));

    await waitFor(() =>
      expect(mockedStyleItService.previewOutfit).toHaveBeenCalledWith(['item-1', 'item-2']),
    );
    expect(await screen.findByText('90%')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: 'Save Look' });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(mockedStyleItService.createOutfit.mock.calls[0]?.[0]).toEqual({
      name: undefined,
      clothingItemIds: ['item-1', 'item-2'],
    });
    expect(await screen.findByText('Look saved')).toBeInTheDocument();
    // Selection resets after a successful save.
    expect(screen.getByText('Tap pieces from your closet to start building a look.')).toBeInTheDocument();
  });

  it('shows a toast and keeps the selection when saving fails', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2' }),
    ]);
    mockedStyleItService.previewOutfit.mockResolvedValue({
      score: 50,
      breakdown: { formalityScore: 50, colorScore: 50, styleScore: 50 },
    });
    mockedStyleItService.createOutfit.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: 'Archived items cannot be used in an outfit.' } },
    });

    renderPage();

    const buttons = await screen.findAllByRole('button', { name: /T-Shirt/ });
    await user.click(buttons[0]!);
    await user.click(screen.getByRole('button', { name: /T-Shirt/, pressed: false }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Look' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save Look' }));

    expect(await screen.findByText('Could not save this look')).toBeInTheDocument();
    expect(screen.getByText('Archived items cannot be used in an outfit.')).toBeInTheDocument();
  });
});

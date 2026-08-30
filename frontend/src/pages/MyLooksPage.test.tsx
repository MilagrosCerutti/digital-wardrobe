import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { MyLooksPage } from './MyLooksPage';
import { ToastProvider } from '@/components/Toast';
import * as myLooksService from '@/features/myLooks/services/myLooksService';
import type { Outfit } from '@/features/myLooks/types/myLooks.types';

vi.mock('@/features/myLooks/services/myLooksService');
const mockedMyLooksService = vi.mocked(myLooksService);

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(id: string) {
  return {
    id,
    userId: 'user-1',
    imageUrl: `https://example.com/${id}.png`,
    category: buildCatalogEntry('cat-1', 'Tops'),
    subcategory: buildCatalogEntry('sub-1', 'T-Shirt'),
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

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/my-looks']}>
          <Routes>
            <Route path="/my-looks" element={<MyLooksPage />} />
            <Route path="/style-it" element={<div>Style It page</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('MyLooksPage', () => {
  it('shows a spinner while loading', () => {
    mockedMyLooksService.fetchOutfits.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText('Loading your looks')).toBeInTheDocument();
  });

  it('shows an error state with a retry action when the request fails', async () => {
    mockedMyLooksService.fetchOutfits.mockRejectedValue(new Error('Network error'));
    renderPage();

    expect(await screen.findByText("Couldn't load your looks")).toBeInTheDocument();
  });

  it('shows an empty state with a link to Style It when there are no looks', async () => {
    const user = userEvent.setup();
    mockedMyLooksService.fetchOutfits.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText('No looks yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create a look' }));

    expect(await screen.findByText('Style It page')).toBeInTheDocument();
  });

  it('renders a card per saved look and opens the detail modal on click', async () => {
    const user = userEvent.setup();
    mockedMyLooksService.fetchOutfits.mockResolvedValue([
      buildOutfit({ id: 'outfit-1', name: 'Weekend Look' }),
      buildOutfit({ id: 'outfit-2', name: 'Date Night' }),
    ]);
    renderPage();

    expect(await screen.findByText('Weekend Look')).toBeInTheDocument();
    expect(screen.getByText('Date Night')).toBeInTheDocument();

    await user.click(screen.getByText('Weekend Look'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Weekend Look' })).toBeInTheDocument();
  });

  it('deletes a look from the detail modal and removes it from the grid', async () => {
    const user = userEvent.setup();
    mockedMyLooksService.fetchOutfits
      .mockResolvedValueOnce([buildOutfit({ id: 'outfit-1', name: 'Weekend Look' })])
      .mockResolvedValueOnce([]);
    mockedMyLooksService.deleteOutfit.mockResolvedValue(undefined);
    renderPage();

    await user.click(await screen.findByText('Weekend Look'));
    await user.click(screen.getByRole('button', { name: 'Delete Look' }));

    expect(await screen.findByText('No looks yet')).toBeInTheDocument();
  });
});

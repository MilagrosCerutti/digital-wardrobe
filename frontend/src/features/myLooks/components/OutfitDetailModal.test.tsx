import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { OutfitDetailModal } from './OutfitDetailModal';
import { ToastProvider } from '@/components/Toast';
import * as myLooksService from '@/features/myLooks/services/myLooksService';
import type { Outfit } from '@/features/myLooks/types/myLooks.types';

vi.mock('@/features/myLooks/services/myLooksService');
const mockedMyLooksService = vi.mocked(myLooksService);

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
    items: [buildItem('item-1'), buildItem('item-2', 'Jeans')],
    occasion: null,
    mood: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function renderModal(outfit: Outfit | null, onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <OutfitDetailModal outfit={outfit} onClose={onClose} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return { onClose };
}

describe('OutfitDetailModal', () => {
  it('renders nothing when there is no selected outfit', () => {
    renderModal(null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the outfit items, badges, and compatibility breakdown', () => {
    renderModal(buildOutfit());

    expect(screen.getByRole('heading', { name: 'Weekend Look' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('Jeans')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Formality')).toBeInTheDocument();
  });

  it('shows a Generated badge and the occasion/mood for a generated look', () => {
    renderModal(
      buildOutfit({
        source: 'GENERATED',
        occasion: { id: 'occasion-1', name: 'Work', isActive: true, createdAt: '', updatedAt: '', formalityHint: 'SMART_CASUAL' },
        mood: 'COZY',
      }),
    );

    expect(screen.getByText('Generated')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Cozy')).toBeInTheDocument();
  });

  it('does not show generation metadata for a manual look', () => {
    renderModal(buildOutfit({ source: 'MANUAL', occasion: null, mood: null }));

    expect(screen.queryByText('Generated')).not.toBeInTheDocument();
  });

  it('deletes the outfit and closes the modal on success', async () => {
    const user = userEvent.setup();
    mockedMyLooksService.deleteOutfit.mockResolvedValue(undefined);
    const { onClose } = renderModal(buildOutfit());

    await user.click(screen.getByRole('button', { name: 'Delete Look' }));

    expect(mockedMyLooksService.deleteOutfit.mock.calls[0]?.[0]).toBe('outfit-1');
    expect(await screen.findByText('Look deleted')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error toast and keeps the modal open when deletion fails', async () => {
    const user = userEvent.setup();
    mockedMyLooksService.deleteOutfit.mockRejectedValue(new Error('Network error'));
    const { onClose } = renderModal(buildOutfit());

    await user.click(screen.getByRole('button', { name: 'Delete Look' }));

    expect(await screen.findByText('Could not delete this look')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

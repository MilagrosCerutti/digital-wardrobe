import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { InspireMePage } from './InspireMePage';
import { ToastProvider } from '@/components/Toast';
import * as closetService from '@/features/closet/services/closetService';
import * as inspireMeService from '@/features/inspireMe/services/inspireMeService';
import * as styleItService from '@/features/styleIt/services/styleItService';
import type { Catalog, ClothingItem } from '@/features/closet/types/closet.types';

vi.mock('@/features/closet/services/closetService');
vi.mock('@/features/inspireMe/services/inspireMeService');
vi.mock('@/features/styleIt/services/styleItService');

const mockedClosetService = vi.mocked(closetService);
const mockedInspireMeService = vi.mocked(inspireMeService);
const mockedStyleItService = vi.mocked(styleItService);

const CATALOG: Catalog = {
  categories: [],
  subcategories: [],
  materials: [],
  patterns: [],
  colors: [],
  styles: [],
  occasions: [
    { id: 'occasion-work', name: 'Work', isActive: true, createdAt: '', updatedAt: '', formalityHint: 'SMART_CASUAL' },
    { id: 'occasion-party', name: 'Party', isActive: true, createdAt: '', updatedAt: '', formalityHint: 'FORMAL' },
  ],
};

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(id: string): ClothingItem {
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
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <InspireMePage />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('InspireMePage', () => {
  it('disables submit until Mood and Occasion are both chosen', async () => {
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByRole('button', { name: 'Get Recommendations' })).toBeDisabled();
  });

  it('generates and displays a style card and recommendations', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem('item-1'), buildItem('item-2')]);
    mockedInspireMeService.generateRecommendations.mockResolvedValue({
      styleCard: {
        vibeName: 'Cozy Work',
        description: 'A cozy take on work.',
        colorPalette: [],
        keyPieces: [],
        characteristics: [],
        outfitCount: 1,
      },
      recommendations: [
        {
          items: [buildItem('item-1'), buildItem('item-2')],
          compatibilityScore: 90,
          compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
          explanation: ['You asked for a Cozy mood for Work.'],
        },
      ],
    });

    renderPage();

    await user.selectOptions(await screen.findByLabelText('Mood'), 'COZY');
    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-work');
    await user.click(screen.getByRole('button', { name: 'Get Recommendations' }));

    expect(mockedInspireMeService.generateRecommendations.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ mood: 'COZY', occasionId: 'occasion-work' }),
    );
    expect(await screen.findByText('Cozy Work')).toBeInTheDocument();
    expect(screen.getByText('You asked for a Cozy mood for Work.')).toBeInTheDocument();
  });

  it('shows an empty state when no valid outfit can be generated', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem('item-1')]);
    mockedInspireMeService.generateRecommendations.mockResolvedValue({
      styleCard: null,
      recommendations: [],
      emptyReason: 'NOT_ENOUGH_PIECES',
    });

    renderPage();

    await user.selectOptions(await screen.findByLabelText('Mood'), 'COZY');
    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-work');
    await user.click(screen.getByRole('button', { name: 'Get Recommendations' }));

    expect(await screen.findByText('No looks yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add a few more pieces to your closet so we can build a complete outfit.'),
    ).toBeInTheDocument();
  });

  it('shows a compatibility-specific empty state when candidates exist but none meet the score floor', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem('item-1')]);
    mockedInspireMeService.generateRecommendations.mockResolvedValue({
      styleCard: null,
      recommendations: [],
      emptyReason: 'BELOW_COMPATIBILITY_FLOOR',
    });

    renderPage();

    await user.selectOptions(await screen.findByLabelText('Mood'), 'COZY');
    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-work');
    await user.click(screen.getByRole('button', { name: 'Get Recommendations' }));

    expect(await screen.findByText('No looks yet')).toBeInTheDocument();
    expect(screen.getByText(/none of them matched well enough together/)).toBeInTheDocument();
  });

  it('saves a recommendation and marks it as saved', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem('item-1'), buildItem('item-2')]);
    mockedInspireMeService.generateRecommendations.mockResolvedValue({
      styleCard: {
        vibeName: 'Cozy Work',
        description: 'A cozy take on work.',
        colorPalette: [],
        keyPieces: [],
        characteristics: [],
        outfitCount: 1,
      },
      recommendations: [
        {
          items: [buildItem('item-1'), buildItem('item-2')],
          compatibilityScore: 90,
          compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
          explanation: ['You asked for a Cozy mood for Work.'],
        },
      ],
    });
    mockedStyleItService.createOutfit.mockResolvedValue({
      id: 'outfit-1',
      userId: 'user-1',
      name: null,
      source: 'GENERATED',
      compatibilityScore: 90,
      compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
      items: [],
      occasion: null,
      mood: 'COZY',
      createdAt: '',
      updatedAt: '',
    });

    renderPage();

    await user.selectOptions(await screen.findByLabelText('Mood'), 'COZY');
    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-work');
    await user.click(screen.getByRole('button', { name: 'Get Recommendations' }));

    await user.click(await screen.findByRole('button', { name: 'Save to My Looks' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled());
    expect(mockedStyleItService.createOutfit.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        clothingItemIds: ['item-1', 'item-2'],
        source: 'GENERATED',
        occasionId: 'occasion-work',
        mood: 'COZY',
      }),
    );
    expect(await screen.findByText('Look saved')).toBeInTheDocument();
  });

  it('saves with the mood/occasion actually used to generate, not a later unsubmitted form edit', async () => {
    const user = userEvent.setup();
    mockedClosetService.fetchCatalog.mockResolvedValue(CATALOG);
    mockedClosetService.fetchClothingItems.mockResolvedValue([buildItem('item-1'), buildItem('item-2')]);
    mockedInspireMeService.generateRecommendations.mockResolvedValue({
      styleCard: {
        vibeName: 'Cozy Work',
        description: 'A cozy take on work.',
        colorPalette: [],
        keyPieces: [],
        characteristics: [],
        outfitCount: 1,
      },
      recommendations: [
        {
          items: [buildItem('item-1'), buildItem('item-2')],
          compatibilityScore: 90,
          compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
          explanation: ['You asked for a Cozy mood for Work.'],
        },
      ],
    });
    mockedStyleItService.createOutfit.mockResolvedValue({
      id: 'outfit-1',
      userId: 'user-1',
      name: null,
      source: 'GENERATED',
      compatibilityScore: 90,
      compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
      items: [],
      occasion: null,
      mood: 'COZY',
      createdAt: '',
      updatedAt: '',
    });

    renderPage();

    await user.selectOptions(await screen.findByLabelText('Mood'), 'COZY');
    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-work');
    await user.click(screen.getByRole('button', { name: 'Get Recommendations' }));
    await screen.findByText('Cozy Work');

    // Edit the form after generating, without resubmitting.
    await user.selectOptions(screen.getByLabelText('Mood'), 'BOLD');
    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-party');

    await user.click(screen.getByRole('button', { name: 'Save to My Looks' }));

    expect(mockedStyleItService.createOutfit.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ occasionId: 'occasion-work', mood: 'COZY' }),
    );
  });
});

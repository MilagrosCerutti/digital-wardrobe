import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { AddClothingItemModal } from './AddClothingItemModal';
import { ToastProvider } from '@/components/Toast';
import * as closetService from '@/features/closet/services/closetService';
import type { Catalog } from '@/features/closet/types/closet.types';

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

function renderModal(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AddClothingItemModal catalog={CATALOG} isOpen onClose={onClose} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return { onClose };
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Category'), 'cat-tops');
  await user.selectOptions(screen.getByLabelText('Subcategory'), 'sub-tshirt');
  await user.selectOptions(screen.getByLabelText('Material'), 'mat-cotton');
  await user.selectOptions(screen.getByLabelText('Pattern'), 'pat-solid');
  await user.click(screen.getByRole('button', { name: 'Select colors' }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Pink' }));
  await user.click(screen.getByRole('button', { name: 'Select styles' }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Casual' }));
  await user.selectOptions(screen.getByLabelText('Fit'), 'REGULAR');
  await user.selectOptions(screen.getByLabelText('Formality'), 'CASUAL');
  const file = new File(['fake'], 'shirt.png', { type: 'image/png' });
  await user.upload(screen.getByLabelText('Photo'), file);
  await user.click(screen.getByRole('button', { name: 'Add Item' }));
}

describe('AddClothingItemModal', () => {
  it('uploads the image, creates the item, and closes on success', async () => {
    const user = userEvent.setup();
    mockedClosetService.uploadClothingItemImage.mockResolvedValue('https://example.com/uploaded.png');
    mockedClosetService.createClothingItem.mockResolvedValue({
      id: 'item-1',
      userId: 'user-1',
      imageUrl: 'https://example.com/uploaded.png',
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
    });
    const { onClose } = renderModal();

    await fillAndSubmit(user);

    expect(mockedClosetService.uploadClothingItemImage).toHaveBeenCalledTimes(1);
    expect(mockedClosetService.createClothingItem.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ imageUrl: 'https://example.com/uploaded.png', categoryId: 'cat-tops' }),
    );
    expect(await screen.findByText('Added to your closet')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a toast and does not close when creation fails', async () => {
    const user = userEvent.setup();
    mockedClosetService.uploadClothingItemImage.mockResolvedValue('https://example.com/uploaded.png');
    mockedClosetService.createClothingItem.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: 'Select a valid category.' } },
    });
    const { onClose } = renderModal();

    await fillAndSubmit(user);

    expect(await screen.findByText('Could not add this item')).toBeInTheDocument();
    expect(screen.getByText('Select a valid category.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

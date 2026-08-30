import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClothingItemForm } from './ClothingItemForm';
import type { Catalog } from '@/features/closet/types/closet.types';

const CATALOG: Catalog = {
  categories: [
    { id: 'cat-tops', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'cat-bottoms', name: 'Bottoms', isActive: true, createdAt: '', updatedAt: '' },
  ],
  subcategories: [
    { id: 'sub-tshirt', name: 'T-Shirt', categoryId: 'cat-tops', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'sub-jeans', name: 'Jeans', categoryId: 'cat-bottoms', isActive: true, createdAt: '', updatedAt: '' },
  ],
  materials: [{ id: 'mat-cotton', name: 'Cotton', isActive: true, createdAt: '', updatedAt: '' }],
  patterns: [{ id: 'pat-solid', name: 'Solid', isActive: true, createdAt: '', updatedAt: '' }],
  colors: [{ id: 'color-pink', name: 'Pink', hex: '#F2A7C3', isActive: true, createdAt: '', updatedAt: '' }],
  styles: [{ id: 'style-casual', name: 'Casual', isActive: true, createdAt: '', updatedAt: '' }],
  occasions: [],
};

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
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
}

describe('ClothingItemForm', () => {
  it('requires an image when requireImage is true and no existing image is set', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ClothingItemForm catalog={CATALOG} submitLabel="Add Item" onSubmit={onSubmit} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(await screen.findByText('An image is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not require an image when editing an item that already has one', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ClothingItemForm
        catalog={CATALOG}
        submitLabel="Save Changes"
        existingImageUrl="https://example.com/existing.png"
        requireImage={false}
        onSubmit={onSubmit}
      />,
    );

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('resets the subcategory when the category changes', async () => {
    const user = userEvent.setup();
    render(
      <ClothingItemForm
        catalog={CATALOG}
        submitLabel="Add Item"
        existingImageUrl="https://example.com/existing.png"
        requireImage={false}
        onSubmit={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Category'), 'cat-tops');
    await user.selectOptions(screen.getByLabelText('Subcategory'), 'sub-tshirt');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat-bottoms');

    expect((screen.getByLabelText('Subcategory') as HTMLSelectElement).value).toBe('');
  });

  it('submits the collected values and the selected file', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ClothingItemForm
        catalog={CATALOG}
        submitLabel="Add Item"
        existingImageUrl="https://example.com/existing.png"
        requireImage={false}
        onSubmit={onSubmit}
      />,
    );

    await fillRequiredFields(user);
    const file = new File(['fake'], 'shirt.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Photo'), file);
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'cat-tops',
        subcategoryId: 'sub-tshirt',
        materialId: 'mat-cotton',
        patternId: 'pat-solid',
        colorIds: ['color-pink'],
        styleIds: ['style-casual'],
        fit: 'REGULAR',
        formalityLevel: 'CASUAL',
      }),
      file,
    );
  });

  it('submits successfully without a fit selected (e.g. accessories)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ClothingItemForm
        catalog={CATALOG}
        submitLabel="Add Item"
        existingImageUrl="https://example.com/existing.png"
        requireImage={false}
        onSubmit={onSubmit}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Category'), 'cat-tops');
    await user.selectOptions(screen.getByLabelText('Subcategory'), 'sub-tshirt');
    await user.selectOptions(screen.getByLabelText('Material'), 'mat-cotton');
    await user.selectOptions(screen.getByLabelText('Pattern'), 'pat-solid');
    await user.click(screen.getByRole('button', { name: 'Select colors' }));
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Pink' }));
    await user.click(screen.getByRole('button', { name: 'Select styles' }));
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Casual' }));
    await user.selectOptions(screen.getByLabelText('Formality'), 'CASUAL');
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fit: undefined }),
      null,
    );
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ClothingItemForm catalog={CATALOG} submitLabel="Add Item" onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

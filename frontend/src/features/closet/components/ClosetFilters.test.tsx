import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClosetFilters } from './ClosetFilters';
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

describe('ClosetFilters', () => {
  it('calls onChange with the selected category', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ClosetFilters catalog={CATALOG} filters={{}} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText('Category'), 'cat-tops');

    expect(onChange).toHaveBeenCalledWith({ categoryId: 'cat-tops', subcategoryId: undefined });
  });

  it('only shows subcategories belonging to the selected category', () => {
    render(
      <ClosetFilters catalog={CATALOG} filters={{ categoryId: 'cat-tops' }} onChange={vi.fn()} />,
    );

    const subcategorySelect = screen.getByLabelText('Subcategory') as HTMLSelectElement;
    const optionLabels = Array.from(subcategorySelect.options).map((option) => option.text);

    expect(optionLabels).toContain('T-Shirt');
    expect(optionLabels).not.toContain('Jeans');
  });

  it('shows all subcategories when no category is selected', () => {
    render(<ClosetFilters catalog={CATALOG} filters={{}} onChange={vi.fn()} />);

    const subcategorySelect = screen.getByLabelText('Subcategory') as HTMLSelectElement;
    const optionLabels = Array.from(subcategorySelect.options).map((option) => option.text);

    expect(optionLabels).toContain('T-Shirt');
    expect(optionLabels).toContain('Jeans');
  });

  it('shows a clear filters button only when a filter is active', () => {
    const { rerender } = render(<ClosetFilters catalog={CATALOG} filters={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();

    rerender(
      <ClosetFilters catalog={CATALOG} filters={{ categoryId: 'cat-tops' }} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('clears filters while preserving includeArchived', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ClosetFilters
        catalog={CATALOG}
        filters={{ categoryId: 'cat-tops', includeArchived: true }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onChange).toHaveBeenCalledWith({ includeArchived: true });
  });

  it('toggles includeArchived via the checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ClosetFilters catalog={CATALOG} filters={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Show archived items'));

    expect(onChange).toHaveBeenCalledWith({ includeArchived: true });
  });

  it('toggles favoritesOnly via the checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ClosetFilters catalog={CATALOG} filters={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Favorites only'));

    expect(onChange).toHaveBeenCalledWith({ favoritesOnly: true });
  });

  it('treats favoritesOnly as an active filter', () => {
    render(
      <ClosetFilters catalog={CATALOG} filters={{ favoritesOnly: true }} onChange={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});

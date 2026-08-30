import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InspireMeForm } from './InspireMeForm';
import type { InspireMeFormValues } from './InspireMeForm';
import type { Catalog, ClothingItem } from '@/features/closet/types/closet.types';

const CATALOG: Catalog = {
  categories: [
    { id: 'cat-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'cat-2', name: 'Bottoms', isActive: true, createdAt: '', updatedAt: '' },
  ],
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

function buildItem(
  id: string,
  subcategoryName: string,
  category: { id: string; name: string } = { id: 'cat-1', name: 'Tops' },
): ClothingItem {
  return {
    id,
    userId: 'user-1',
    imageUrl: `https://example.com/${id}.png`,
    category: buildCatalogEntry(category.id, category.name),
    subcategory: buildCatalogEntry('sub-1', subcategoryName),
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

const CLOSET_ITEMS = [
  buildItem('item-1', 'T-Shirt', { id: 'cat-1', name: 'Tops' }),
  buildItem('item-2', 'Jeans', { id: 'cat-2', name: 'Bottoms' }),
];

const EMPTY_VALUES: InspireMeFormValues = {
  mood: '',
  occasionId: '',
  formalityLevel: '',
  requiredItemId: '',
  excludedItemIds: [],
  useFavorites: false,
};

function ControlledForm({ mode = 'advanced' as const }: { mode?: 'quick' | 'advanced' }) {
  const [values, setValues] = useState<InspireMeFormValues>(EMPTY_VALUES);
  return (
    <InspireMeForm
      mode={mode}
      catalog={CATALOG}
      closetItems={CLOSET_ITEMS}
      values={values}
      onChange={setValues}
      onSubmit={vi.fn()}
      isSubmitting={false}
    />
  );
}

describe('InspireMeForm', () => {
  it('only shows Mood and Occasion in Quick Mode', () => {
    render(
      <InspireMeForm
        mode="quick"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={EMPTY_VALUES}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText('Mood')).toBeInTheDocument();
    expect(screen.getByLabelText('Occasion')).toBeInTheDocument();
    expect(screen.queryByLabelText('Formality preference')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Required item')).not.toBeInTheDocument();
    expect(screen.queryByText('Prioritize my favorite pieces')).not.toBeInTheDocument();
  });

  it('shows the extra Advanced Mode controls', () => {
    render(
      <InspireMeForm
        mode="advanced"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={EMPTY_VALUES}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText('Formality preference')).toBeInTheDocument();
    expect(screen.getByText('Required item')).toBeInTheDocument();
    expect(screen.getByText('Items to avoid')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Category')).toHaveLength(2);
    expect(screen.getByText('Prioritize my favorite pieces')).toBeInTheDocument();
  });

  it('scopes the Required item picker to the chosen category, and resets the selection when the category changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InspireMeForm
        mode="advanced"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={EMPTY_VALUES}
        onChange={onChange}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    const [requiredCategorySelect] = screen.getAllByLabelText('Category');
    expect(screen.getByLabelText('Item')).toBeInTheDocument();
    expect((screen.getByLabelText('Item') as HTMLSelectElement).options).toHaveLength(1); // placeholder only

    await user.selectOptions(requiredCategorySelect, 'cat-1');

    const itemSelect = screen.getByLabelText('Item') as HTMLSelectElement;
    const optionLabels = Array.from(itemSelect.options).map((option) => option.text);
    expect(optionLabels).toContain('T-Shirt');
    expect(optionLabels).not.toContain('Jeans');
  });

  it('keeps previously-avoided items visible as badges even after switching the avoid-category filter', async () => {
    const user = userEvent.setup();
    render(
      <InspireMeForm
        mode="advanced"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={{ ...EMPTY_VALUES, excludedItemIds: ['item-1'] }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText('T-Shirt')).toBeInTheDocument();

    const [, avoidCategorySelect] = screen.getAllByLabelText('Category');
    await user.selectOptions(avoidCategorySelect, 'cat-2');

    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
  });

  it('disables submit until both Mood and Occasion are chosen', () => {
    render(
      <InspireMeForm
        mode="quick"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={EMPTY_VALUES}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Get Recommendations' })).toBeDisabled();
  });

  it('calls onSubmit when both fields are set and the form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <InspireMeForm
        mode="quick"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={{ ...EMPTY_VALUES, mood: 'COZY', occasionId: 'occasion-work' }}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Get Recommendations' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('updates values when a field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InspireMeForm
        mode="quick"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={EMPTY_VALUES}
        onChange={onChange}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Occasion'), 'occasion-work');

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_VALUES, occasionId: 'occasion-work' });
  });

  it('does not show a Clear all button when nothing has been set', () => {
    render(
      <InspireMeForm
        mode="advanced"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={EMPTY_VALUES}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  });

  it('shows a Clear all button once a field is set, and resets values on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InspireMeForm
        mode="advanced"
        catalog={CATALOG}
        closetItems={CLOSET_ITEMS}
        values={{ ...EMPTY_VALUES, mood: 'COZY' }}
        onChange={onChange}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(onChange).toHaveBeenCalledWith(EMPTY_VALUES);
  });

  it('resets both form values and the local category filters when Clear all is clicked', async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);

    await user.selectOptions(screen.getByLabelText('Mood'), 'COZY');
    const [requiredCategorySelect] = screen.getAllByLabelText('Category');
    await user.selectOptions(requiredCategorySelect, 'cat-1');

    expect((requiredCategorySelect as HTMLSelectElement).value).toBe('cat-1');

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect((screen.getByLabelText('Mood') as HTMLSelectElement).value).toBe('');
    expect((screen.getAllByLabelText('Category')[0] as HTMLSelectElement).value).toBe('');
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  });
});

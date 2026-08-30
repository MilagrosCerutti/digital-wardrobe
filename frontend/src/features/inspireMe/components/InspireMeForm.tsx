import { useState } from 'react';
import type { FormEvent } from 'react';
import { Select } from '@/components/Select';
import { MultiSelect } from '@/components/MultiSelect';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { FORMALITY_OPTIONS } from '@/features/closet/constants';
import type { Catalog, ClothingItem, FormalityLevel } from '@/features/closet/types/closet.types';
import { MOOD_OPTIONS } from '@/features/inspireMe/constants';
import type { Mood } from '@/features/inspireMe/types/inspireMe.types';

export interface InspireMeFormValues {
  mood: Mood | '';
  occasionId: string;
  formalityLevel: FormalityLevel | '';
  requiredItemId: string;
  excludedItemIds: string[];
  useFavorites: boolean;
}

const EMPTY_INSPIRE_ME_FORM_VALUES: InspireMeFormValues = {
  mood: '',
  occasionId: '',
  formalityLevel: '',
  requiredItemId: '',
  excludedItemIds: [],
  useFavorites: false,
};

export interface InspireMeFormProps {
  mode: 'quick' | 'advanced';
  catalog: Catalog;
  closetItems: ClothingItem[];
  values: InspireMeFormValues;
  onChange: (values: InspireMeFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function InspireMeForm({
  mode,
  catalog,
  closetItems,
  values,
  onChange,
  onSubmit,
  isSubmitting,
}: InspireMeFormProps) {
  const [requiredCategoryId, setRequiredCategoryId] = useState('');
  const [avoidCategoryId, setAvoidCategoryId] = useState('');

  function update(patch: Partial<InspireMeFormValues>) {
    onChange({ ...values, ...patch });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  }

  function handleClear() {
    setRequiredCategoryId('');
    setAvoidCategoryId('');
    onChange(EMPTY_INSPIRE_ME_FORM_VALUES);
  }

  function itemLabel(item: ClothingItem) {
    const colorNames = item.colors.map((color) => color.name).join('/');
    return colorNames ? `${item.subcategory.name} — ${colorNames}` : item.subcategory.name;
  }

  function itemOptionsForCategory(categoryId: string) {
    return closetItems
      .filter((item) => item.category.id === categoryId)
      .map((item) => ({ value: item.id, label: itemLabel(item) }));
  }

  // Only offer categories the closet actually has pieces in -- picking one
  // with nothing in it would be a dead end.
  const categoryOptions = catalog.categories
    .filter((category) => closetItems.some((item) => item.category.id === category.id))
    .map((category) => ({ value: category.id, label: category.name }));

  const requiredItemOptions = requiredCategoryId ? itemOptionsForCategory(requiredCategoryId) : [];
  const avoidItemOptions = avoidCategoryId ? itemOptionsForCategory(avoidCategoryId) : [];
  const allItemOptions = closetItems.map((item) => ({ value: item.id, label: itemLabel(item) }));

  const canSubmit = values.mood !== '' && values.occasionId !== '';
  const hasActiveValues =
    values.mood !== '' ||
    values.occasionId !== '' ||
    values.formalityLevel !== '' ||
    values.requiredItemId !== '' ||
    values.excludedItemIds.length > 0 ||
    values.useFavorites ||
    requiredCategoryId !== '' ||
    avoidCategoryId !== '';

  return (
    <form onSubmit={handleSubmit} className="dw-panel flex flex-col gap-4 bg-paper p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Mood"
          placeholder="Choose a mood"
          value={values.mood}
          onChange={(e) => update({ mood: e.target.value as Mood })}
          options={MOOD_OPTIONS}
        />
        <Select
          label="Occasion"
          placeholder="Choose an occasion"
          value={values.occasionId}
          onChange={(e) => update({ occasionId: e.target.value })}
          options={catalog.occasions.map((occasion) => ({ value: occasion.id, label: occasion.name }))}
        />
      </div>

      {mode === 'advanced' && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <Select
            label="Formality preference"
            placeholder="No preference"
            value={values.formalityLevel}
            onChange={(e) => update({ formalityLevel: e.target.value as FormalityLevel })}
            options={FORMALITY_OPTIONS}
          />
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-foreground">Required item</span>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                placeholder="Choose a category"
                value={requiredCategoryId}
                onChange={(e) => {
                  setRequiredCategoryId(e.target.value);
                  update({ requiredItemId: '' });
                }}
                options={categoryOptions}
              />
              <Select
                label="Item"
                placeholder={requiredCategoryId ? 'No required item' : 'Choose a category first'}
                value={values.requiredItemId}
                onChange={(e) => update({ requiredItemId: e.target.value })}
                options={requiredItemOptions}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-foreground">Items to avoid</span>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                placeholder="Choose a category"
                value={avoidCategoryId}
                onChange={(e) => setAvoidCategoryId(e.target.value)}
                options={categoryOptions}
              />
              <MultiSelect
                label="Items"
                options={avoidItemOptions}
                allOptions={allItemOptions}
                values={values.excludedItemIds}
                onChange={(excludedItemIds) => update({ excludedItemIds })}
                placeholder={avoidCategoryId ? 'None in this category' : 'Choose a category first'}
              />
            </div>
          </div>
          <Checkbox
            label="Prioritize my favorite pieces"
            checked={values.useFavorites}
            onChange={(e) => update({ useFavorites: e.target.checked })}
          />
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Styling your look…' : 'Get Recommendations'}
        </Button>
        {hasActiveValues && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={isSubmitting}>
            Clear all
          </Button>
        )}
      </div>
    </form>
  );
}

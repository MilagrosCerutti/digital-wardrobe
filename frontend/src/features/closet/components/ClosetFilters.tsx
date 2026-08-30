import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { FIT_OPTIONS, FORMALITY_OPTIONS } from '@/features/closet/constants';
import type { Catalog, ClosetFilters as ClosetFiltersValue } from '@/features/closet/types/closet.types';

export interface ClosetFiltersProps {
  catalog: Catalog;
  filters: ClosetFiltersValue;
  onChange: (filters: ClosetFiltersValue) => void;
}

function toOptions(entries: { id: string; name: string }[]) {
  return entries.map((entry) => ({ value: entry.id, label: entry.name }));
}

export function ClosetFilters({ catalog, filters, onChange }: ClosetFiltersProps) {
  const subcategoryOptions = filters.categoryId
    ? catalog.subcategories.filter((subcategory) => subcategory.categoryId === filters.categoryId)
    : catalog.subcategories;

  function update(patch: Partial<ClosetFiltersValue>) {
    onChange({ ...filters, ...patch });
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'includeArchived' && Boolean(value),
  );

  return (
    <div className="dw-panel flex flex-col gap-4 bg-paper p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Category"
          placeholder="All categories"
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            update({ categoryId: e.target.value || undefined, subcategoryId: undefined })
          }
          options={toOptions(catalog.categories)}
        />
        <Select
          label="Subcategory"
          placeholder="All subcategories"
          value={filters.subcategoryId ?? ''}
          onChange={(e) => update({ subcategoryId: e.target.value || undefined })}
          options={toOptions(subcategoryOptions)}
        />
        <Select
          label="Material"
          placeholder="All materials"
          value={filters.materialId ?? ''}
          onChange={(e) => update({ materialId: e.target.value || undefined })}
          options={toOptions(catalog.materials)}
        />
        <Select
          label="Pattern"
          placeholder="All patterns"
          value={filters.patternId ?? ''}
          onChange={(e) => update({ patternId: e.target.value || undefined })}
          options={toOptions(catalog.patterns)}
        />
        <Select
          label="Color"
          placeholder="All colors"
          value={filters.colorId ?? ''}
          onChange={(e) => update({ colorId: e.target.value || undefined })}
          options={toOptions(catalog.colors)}
        />
        <Select
          label="Style"
          placeholder="All styles"
          value={filters.styleId ?? ''}
          onChange={(e) => update({ styleId: e.target.value || undefined })}
          options={toOptions(catalog.styles)}
        />
        <Select
          label="Fit"
          placeholder="Any fit"
          value={filters.fit ?? ''}
          onChange={(e) => update({ fit: (e.target.value || undefined) as ClosetFiltersValue['fit'] })}
          options={FIT_OPTIONS}
        />
        <Select
          label="Formality"
          placeholder="Any formality"
          value={filters.formalityLevel ?? ''}
          onChange={(e) =>
            update({
              formalityLevel: (e.target.value || undefined) as ClosetFiltersValue['formalityLevel'],
            })
          }
          options={FORMALITY_OPTIONS}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox
            label="Show archived items"
            checked={filters.includeArchived ?? false}
            onChange={(e) => update({ includeArchived: e.target.checked })}
          />
          <Checkbox
            label="Favorites only"
            checked={filters.favoritesOnly ?? false}
            onChange={(e) => update({ favoritesOnly: e.target.checked })}
          />
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ includeArchived: filters.includeArchived })}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

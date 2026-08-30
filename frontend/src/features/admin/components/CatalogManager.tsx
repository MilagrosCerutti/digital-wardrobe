import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/components/Toast';
import { FORMALITY_OPTIONS } from '@/features/closet/constants';
import { CATALOG_TYPE_OPTIONS } from '@/features/admin/constants';
import {
  useAdminCatalogQuery,
  useCreateCatalogEntryMutation,
  useSetCatalogEntryActiveMutation,
} from '@/features/admin/hooks/useAdmin';
import type {
  CatalogEntry,
  CatalogType,
  Color,
  FormalityLevel,
  Occasion,
  Subcategory,
} from '@/features/admin/types/admin.types';
import { getApiErrorMessage } from '@/utils/apiError';

type CatalogRow = CatalogEntry | Subcategory | Color | Occasion;

export function CatalogManager() {
  const [selectedType, setSelectedType] = useState<CatalogType>('categories');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [hex, setHex] = useState('#');
  const [formalityHint, setFormalityHint] = useState<FormalityLevel | ''>('');

  const catalogQuery = useAdminCatalogQuery();
  const createEntry = useCreateCatalogEntryMutation();
  const setActive = useSetCatalogEntryActiveMutation();
  const { toast } = useToast();

  function resetForm() {
    setName('');
    setCategoryId('');
    setHex('#');
    setFormalityHint('');
  }

  function handleTypeChange(type: CatalogType) {
    setSelectedType(type);
    resetForm();
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (selectedType === 'subcategories') {
        if (!categoryId) return;
        await createEntry.mutateAsync({ type: 'subcategories', name, categoryId });
      } else if (selectedType === 'colors') {
        await createEntry.mutateAsync({ type: 'colors', name, hex });
      } else if (selectedType === 'occasions') {
        if (!formalityHint) return;
        await createEntry.mutateAsync({ type: 'occasions', name, formalityHint });
      } else {
        await createEntry.mutateAsync({ type: selectedType, name });
      }
      toast({ title: 'Entry created', variant: 'success' });
      resetForm();
    } catch (error) {
      toast({ title: 'Could not create this entry', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    try {
      await setActive.mutateAsync({ type: selectedType, id, isActive: !isActive });
      toast({ title: isActive ? 'Entry deactivated' : 'Entry activated', variant: 'success' });
    } catch (error) {
      toast({ title: 'Could not update this entry', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  if (catalogQuery.isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner label="Loading catalog" />
      </div>
    );
  }

  if (catalogQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load the catalog"
        description={getApiErrorMessage(catalogQuery.error)}
        onRetry={() => catalogQuery.refetch()}
      />
    );
  }

  const catalog = catalogQuery.data;
  if (!catalog) return null;

  const entries: CatalogRow[] = catalog[selectedType];
  const categoryNameById = new Map(catalog.categories.map((category) => [category.id, category.name]));
  const canSubmit =
    name.trim().length > 0 &&
    (selectedType !== 'subcategories' || categoryId !== '') &&
    (selectedType !== 'occasions' || formalityHint !== '');

  return (
    <div className="flex flex-col gap-6">
      <Select
        label="Catalog type"
        value={selectedType}
        onChange={(e) => handleTypeChange(e.target.value as CatalogType)}
        options={CATALOG_TYPE_OPTIONS}
      />

      <form onSubmit={handleCreate} className="dw-panel flex flex-wrap items-end gap-3 bg-paper p-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        {selectedType === 'subcategories' && (
          <Select
            label="Parent category"
            placeholder="Choose a category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={catalog.categories.map((category) => ({ value: category.id, label: category.name }))}
          />
        )}
        {selectedType === 'colors' && (
          <Input label="Hex" placeholder="#RRGGBB" value={hex} onChange={(e) => setHex(e.target.value)} />
        )}
        {selectedType === 'occasions' && (
          <Select
            label="Formality hint"
            placeholder="Choose formality"
            value={formalityHint}
            onChange={(e) => setFormalityHint(e.target.value as FormalityLevel)}
            options={FORMALITY_OPTIONS}
          />
        )}
        <Button type="submit" disabled={!canSubmit || createEntry.isPending}>
          {createEntry.isPending ? 'Adding…' : 'Add Entry'}
        </Button>
      </form>

      <div className="dw-panel overflow-x-auto bg-paper">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 font-medium text-muted-foreground">Name</th>
              {selectedType === 'subcategories' && (
                <th className="p-3 font-medium text-muted-foreground">Category</th>
              )}
              {selectedType === 'colors' && <th className="p-3 font-medium text-muted-foreground">Color</th>}
              {selectedType === 'occasions' && (
                <th className="p-3 font-medium text-muted-foreground">Formality hint</th>
              )}
              <th className="p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3 font-medium text-muted-foreground" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground">{entry.name}</td>
                {selectedType === 'subcategories' && 'categoryId' in entry && (
                  <td className="p-3 text-muted-foreground">
                    {categoryNameById.get(entry.categoryId) ?? '—'}
                  </td>
                )}
                {selectedType === 'colors' && 'hex' in entry && (
                  <td className="p-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 rounded-full border border-border" style={{ backgroundColor: entry.hex }} />
                      {entry.hex}
                    </span>
                  </td>
                )}
                {selectedType === 'occasions' && 'formalityHint' in entry && (
                  <td className="p-3 text-muted-foreground">{entry.formalityHint}</td>
                )}
                <td className="p-3">
                  <Badge variant={entry.isActive ? 'accent' : 'outline'}>
                    {entry.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant={entry.isActive ? 'destructive' : 'outline'}
                    disabled={setActive.isPending}
                    onClick={() => handleToggle(entry.id, entry.isActive)}
                  >
                    {entry.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={4}>
                  No entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

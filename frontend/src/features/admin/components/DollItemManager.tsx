import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { DOLL_ITEM_ASSET_KEY_OPTIONS, DOLL_ITEM_CATEGORY_OPTIONS, DOLL_ITEM_COLOR_OPTIONS } from '@/features/admin/constants';
import {
  useAdminDollItemsQuery,
  useCreateDollItemMutation,
  useSetDollItemActiveMutation,
  useUpdateDollItemMutation,
} from '@/features/admin/hooks/useAdmin';
import type { DollItem, DollItemCategory } from '@/features/admin/types/admin.types';
import { getApiErrorMessage } from '@/utils/apiError';

interface DollItemFormValues {
  name: string;
  category: DollItemCategory | '';
  layer: string;
  assetUrl: string;
  color: string;
}

const EMPTY_FORM: DollItemFormValues = { name: '', category: '', layer: '0', assetUrl: '', color: '' };

export function DollItemManager() {
  const [form, setForm] = useState<DollItemFormValues>(EMPTY_FORM);
  const [editingItem, setEditingItem] = useState<DollItem | null>(null);

  const dollItemsQuery = useAdminDollItemsQuery();
  const createDollItem = useCreateDollItemMutation();
  const updateDollItem = useUpdateDollItemMutation();
  const setActive = useSetDollItemActiveMutation();
  const { toast } = useToast();

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.category) return;

    try {
      await createDollItem.mutateAsync({
        name: form.name,
        category: form.category,
        layer: Number(form.layer),
        assetUrl: form.assetUrl,
        color: form.color,
      });
      toast({ title: 'Doll item created', variant: 'success' });
      setForm(EMPTY_FORM);
    } catch (error) {
      toast({ title: 'Could not create this doll item', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  async function handleToggle(item: DollItem) {
    try {
      await setActive.mutateAsync({ id: item.id, isActive: !item.isActive });
      toast({ title: item.isActive ? 'Doll item deactivated' : 'Doll item activated', variant: 'success' });
    } catch (error) {
      toast({ title: 'Could not update this doll item', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  async function handleSaveEdit(values: DollItemFormValues) {
    if (!editingItem || !values.category) return;
    try {
      await updateDollItem.mutateAsync({
        id: editingItem.id,
        payload: {
          name: values.name,
          category: values.category,
          layer: Number(values.layer),
          assetUrl: values.assetUrl,
          color: values.color,
        },
      });
      toast({ title: 'Doll item updated', variant: 'success' });
      setEditingItem(null);
    } catch (error) {
      toast({ title: 'Could not update this doll item', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  if (dollItemsQuery.isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner label="Loading doll items" />
      </div>
    );
  }

  if (dollItemsQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load doll items"
        description={getApiErrorMessage(dollItemsQuery.error)}
        onRetry={() => dollItemsQuery.refetch()}
      />
    );
  }

  const canSubmit =
    form.name.trim().length > 0 && form.category !== '' && form.assetUrl !== '' && form.color !== '';
  const assetKeyOptionsForCategory = form.category
    ? DOLL_ITEM_ASSET_KEY_OPTIONS.filter((option) => option.category === form.category)
    : DOLL_ITEM_ASSET_KEY_OPTIONS;

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="dw-panel flex flex-wrap items-end gap-3 bg-paper p-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select
          label="Category"
          placeholder="Choose a category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as DollItemCategory })}
          options={DOLL_ITEM_CATEGORY_OPTIONS}
        />
        <Input
          label="Layer"
          type="number"
          min={0}
          value={form.layer}
          onChange={(e) => setForm({ ...form, layer: e.target.value })}
        />
        <Select
          label="Garment"
          placeholder="Choose an illustrated garment"
          value={form.assetUrl}
          onChange={(e) => setForm({ ...form, assetUrl: e.target.value })}
          options={assetKeyOptionsForCategory}
        />
        <Select
          label="Color"
          placeholder="Choose a color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          options={DOLL_ITEM_COLOR_OPTIONS}
        />
        <Button type="submit" disabled={!canSubmit || createDollItem.isPending}>
          {createDollItem.isPending ? 'Adding…' : 'Add Doll Item'}
        </Button>
      </form>

      <div className="dw-panel overflow-x-auto bg-paper">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 font-medium text-muted-foreground">Name</th>
              <th className="p-3 font-medium text-muted-foreground">Category</th>
              <th className="p-3 font-medium text-muted-foreground">Layer</th>
              <th className="p-3 font-medium text-muted-foreground">Color</th>
              <th className="p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3 font-medium text-muted-foreground" />
            </tr>
          </thead>
          <tbody>
            {dollItemsQuery.data?.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground">{item.name}</td>
                <td className="p-3 text-muted-foreground">{item.category}</td>
                <td className="p-3 text-muted-foreground">{item.layer}</td>
                <td className="p-3">
                  <span
                    className="inline-block size-4 rounded-full border border-border align-middle"
                    style={{ backgroundColor: item.color }}
                    aria-label={item.color}
                  />
                </td>
                <td className="p-3">
                  <Badge variant={item.isActive ? 'accent' : 'outline'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={item.isActive ? 'destructive' : 'outline'}
                      disabled={setActive.isPending}
                      onClick={() => handleToggle(item)}
                    >
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {dollItemsQuery.data?.length === 0 && (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={6}>
                  No doll items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditDollItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />
    </div>
  );
}

interface EditDollItemModalProps {
  item: DollItem | null;
  onClose: () => void;
  onSave: (values: DollItemFormValues) => void | Promise<void>;
}

function EditDollItemModal({ item, onClose, onSave }: EditDollItemModalProps) {
  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={item ? `Edit ${item.name}` : ''}>
      {item && <EditDollItemForm key={item.id} item={item} onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

function EditDollItemForm({
  item,
  onClose,
  onSave,
}: {
  item: DollItem;
  onClose: () => void;
  onSave: (values: DollItemFormValues) => void | Promise<void>;
}) {
  const [values, setValues] = useState<DollItemFormValues>({
    name: item.name,
    category: item.category,
    layer: String(item.layer),
    assetUrl: item.assetUrl,
    color: item.color,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(values);
  }

  const assetKeyOptionsForCategory = values.category
    ? DOLL_ITEM_ASSET_KEY_OPTIONS.filter((option) => option.category === values.category)
    : DOLL_ITEM_ASSET_KEY_OPTIONS;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
      <Select
        label="Category"
        value={values.category}
        onChange={(e) => setValues({ ...values, category: e.target.value as DollItemCategory })}
        options={DOLL_ITEM_CATEGORY_OPTIONS}
      />
      <Input
        label="Layer"
        type="number"
        min={0}
        value={values.layer}
        onChange={(e) => setValues({ ...values, layer: e.target.value })}
      />
      <Select
        label="Garment"
        value={values.assetUrl}
        onChange={(e) => setValues({ ...values, assetUrl: e.target.value })}
        options={assetKeyOptionsForCategory}
      />
      <Select
        label="Color"
        value={values.color}
        onChange={(e) => setValues({ ...values, color: e.target.value })}
        options={DOLL_ITEM_COLOR_OPTIONS}
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}

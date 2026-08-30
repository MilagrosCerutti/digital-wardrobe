import { useState } from 'react';
import type { FormEvent } from 'react';
import { Select } from '@/components/Select';
import { MultiSelect } from '@/components/MultiSelect';
import { Button } from '@/components/Button';
import { FIT_OPTIONS, FORMALITY_OPTIONS } from '@/features/closet/constants';
import type {
  Catalog,
  CreateClothingItemPayload,
  Fit,
  FormalityLevel,
} from '@/features/closet/types/closet.types';

export interface ClothingItemFormValues {
  categoryId: string;
  subcategoryId: string;
  materialId: string;
  patternId: string;
  colorIds: string[];
  styleIds: string[];
  fit: Fit | '';
  formalityLevel: FormalityLevel | '';
}

const EMPTY_VALUES: ClothingItemFormValues = {
  categoryId: '',
  subcategoryId: '',
  materialId: '',
  patternId: '',
  colorIds: [],
  styleIds: [],
  fit: '',
  formalityLevel: '',
};

export interface ClothingItemFormProps {
  catalog: Catalog;
  initialValues?: Partial<ClothingItemFormValues>;
  existingImageUrl?: string;
  requireImage?: boolean;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: CreateClothingItemPayload, imageFile: File | null) => void;
  onCancel?: () => void;
}

function toOptions(entries: { id: string; name: string }[]) {
  return entries.map((entry) => ({ value: entry.id, label: entry.name }));
}

export function ClothingItemForm({
  catalog,
  initialValues,
  existingImageUrl,
  requireImage = true,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: ClothingItemFormProps) {
  const [values, setValues] = useState<ClothingItemFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingImageUrl);
  const [error, setError] = useState<string | null>(null);

  const subcategoryOptions = values.categoryId
    ? catalog.subcategories.filter((subcategory) => subcategory.categoryId === values.categoryId)
    : catalog.subcategories;

  function update(patch: Partial<ClothingItemFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function handleFileChange(file: File | null) {
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : existingImageUrl);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (requireImage && !imageFile && !existingImageUrl) {
      setError('An image is required.');
      return;
    }
    if (
      !values.categoryId ||
      !values.subcategoryId ||
      !values.materialId ||
      !values.patternId ||
      !values.formalityLevel
    ) {
      setError('Please complete every field.');
      return;
    }
    if (values.colorIds.length === 0) {
      setError('Select at least one color.');
      return;
    }
    if (values.styleIds.length === 0) {
      setError('Select at least one style.');
      return;
    }

    onSubmit(
      {
        imageUrl: existingImageUrl ?? '',
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        materialId: values.materialId,
        patternId: values.patternId,
        colorIds: values.colorIds,
        styleIds: values.styleIds,
        fit: values.fit || undefined,
        formalityLevel: values.formalityLevel,
      },
      imageFile,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="clothing-image" className="text-sm font-medium text-foreground">
          Photo
        </label>
        {previewUrl && (
          <div className="dw-panel size-32 overflow-hidden bg-cream">
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <input
          id="clothing-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-[var(--radius)] file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-foreground"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          placeholder="Select a category"
          value={values.categoryId}
          onChange={(e) => update({ categoryId: e.target.value, subcategoryId: '' })}
          options={toOptions(catalog.categories)}
        />
        <Select
          label="Subcategory"
          placeholder="Select a subcategory"
          value={values.subcategoryId}
          onChange={(e) => update({ subcategoryId: e.target.value })}
          options={toOptions(subcategoryOptions)}
        />
        <Select
          label="Material"
          placeholder="Select a material"
          value={values.materialId}
          onChange={(e) => update({ materialId: e.target.value })}
          options={toOptions(catalog.materials)}
        />
        <Select
          label="Pattern"
          placeholder="Select a pattern"
          value={values.patternId}
          onChange={(e) => update({ patternId: e.target.value })}
          options={toOptions(catalog.patterns)}
        />
      </div>

      <MultiSelect
        label="Colors"
        placeholder="Select colors"
        values={values.colorIds}
        onChange={(colorIds) => update({ colorIds })}
        options={toOptions(catalog.colors)}
      />
      <MultiSelect
        label="Styles"
        placeholder="Select styles"
        values={values.styleIds}
        onChange={(styleIds) => update({ styleIds })}
        options={toOptions(catalog.styles)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Fit"
          placeholder="Select a fit (optional)"
          value={values.fit}
          onChange={(e) => update({ fit: e.target.value as Fit })}
          options={FIT_OPTIONS}
        />
        <Select
          label="Formality"
          placeholder="Select formality"
          value={values.formalityLevel}
          onChange={(e) => update({ formalityLevel: e.target.value as FormalityLevel })}
          options={FORMALITY_OPTIONS}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

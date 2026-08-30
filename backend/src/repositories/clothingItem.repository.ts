import { supabase } from '@/config/supabase';
import { CatalogEntry, Color } from '@/types/catalog.types';
import {
  ClosetFilters,
  ClothingItem,
  CreateClothingItemInput,
  UpdateClothingItemInput,
} from '@/types/clothingItem.types';

const SELECT_WITH_RELATIONS = `
  id, user_id, image_url, fit, formality_level, is_archived, is_favorite, created_at, updated_at,
  category:categories(id, name, is_active, created_at, updated_at),
  subcategory:subcategories(id, name, is_active, created_at, updated_at),
  material:materials(id, name, is_active, created_at, updated_at),
  pattern:patterns(id, name, is_active, created_at, updated_at),
  clothing_item_colors(color:colors(id, name, hex, is_active, created_at, updated_at)),
  clothing_item_styles(style:styles(id, name, is_active, created_at, updated_at))
`;

interface CatalogRefRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ColorRefRow extends CatalogRefRow {
  hex: string;
}

interface ClothingItemRow {
  id: string;
  user_id: string;
  image_url: string;
  fit: ClothingItem['fit'];
  formality_level: ClothingItem['formalityLevel'];
  is_archived: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  category: CatalogRefRow;
  subcategory: CatalogRefRow;
  material: CatalogRefRow;
  pattern: CatalogRefRow;
  clothing_item_colors: { color: ColorRefRow }[];
  clothing_item_styles: { style: CatalogRefRow }[];
}

function toCatalogEntry(row: CatalogRefRow): CatalogEntry {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toColor(row: ColorRefRow): Color {
  return { ...toCatalogEntry(row), hex: row.hex };
}

function toDomain(row: ClothingItemRow): ClothingItem {
  return {
    id: row.id,
    userId: row.user_id,
    imageUrl: row.image_url,
    category: toCatalogEntry(row.category),
    subcategory: toCatalogEntry(row.subcategory),
    material: toCatalogEntry(row.material),
    pattern: toCatalogEntry(row.pattern),
    colors: row.clothing_item_colors.map((entry) => toColor(entry.color)),
    styles: row.clothing_item_styles.map((entry) => toCatalogEntry(entry.style)),
    fit: row.fit,
    formalityLevel: row.formality_level,
    isArchived: row.is_archived,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findClothingItemsByIdsForUser(
  userId: string,
  ids: string[],
): Promise<ClothingItem[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('clothing_items')
    .select(SELECT_WITH_RELATIONS)
    .eq('user_id', userId)
    .in('id', ids);

  if (error) throw error;
  return (data as unknown as ClothingItemRow[]).map(toDomain);
}

export async function findClothingItemsForUser(
  userId: string,
  filters: ClosetFilters,
): Promise<ClothingItem[]> {
  let query = supabase.from('clothing_items').select(SELECT_WITH_RELATIONS).eq('user_id', userId);

  // A binary view, not additive: checking "show archived items" switches to
  // archived-only rather than merging archived into the active list -- the
  // user is asking to see the archive, not everything at once.
  query = query.eq('is_archived', Boolean(filters.includeArchived));
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.subcategoryId) {
    query = query.eq('subcategory_id', filters.subcategoryId);
  }
  if (filters.materialId) {
    query = query.eq('material_id', filters.materialId);
  }
  if (filters.patternId) {
    query = query.eq('pattern_id', filters.patternId);
  }
  if (filters.fit) {
    query = query.eq('fit', filters.fit);
  }
  if (filters.formalityLevel) {
    query = query.eq('formality_level', filters.formalityLevel);
  }
  if (filters.favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  let items = (data as unknown as ClothingItemRow[]).map(toDomain);

  if (filters.colorId) {
    items = items.filter((item) => item.colors.some((color) => color.id === filters.colorId));
  }
  if (filters.styleId) {
    items = items.filter((item) => item.styles.some((style) => style.id === filters.styleId));
  }

  return items;
}

export async function findClothingItemById(id: string): Promise<ClothingItem | null> {
  const { data, error } = await supabase
    .from('clothing_items')
    .select(SELECT_WITH_RELATIONS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toDomain(data as unknown as ClothingItemRow) : null;
}

export async function createClothingItem(
  userId: string,
  input: CreateClothingItemInput,
): Promise<ClothingItem> {
  const { data, error } = await supabase
    .from('clothing_items')
    .insert({
      user_id: userId,
      image_url: input.imageUrl,
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId,
      material_id: input.materialId,
      pattern_id: input.patternId,
      fit: input.fit ?? null,
      formality_level: input.formalityLevel,
    })
    .select('id')
    .single();
  if (error) throw error;

  await replaceColors(data.id, input.colorIds);
  await replaceStyles(data.id, input.styleIds);

  const created = await findClothingItemById(data.id);
  if (!created) throw new Error('Failed to load the clothing item that was just created.');
  return created;
}

export async function updateClothingItem(
  id: string,
  patch: UpdateClothingItemInput,
): Promise<ClothingItem> {
  const columnPatch: Record<string, string> = {};
  if (patch.imageUrl) columnPatch.image_url = patch.imageUrl;
  if (patch.categoryId) columnPatch.category_id = patch.categoryId;
  if (patch.subcategoryId) columnPatch.subcategory_id = patch.subcategoryId;
  if (patch.materialId) columnPatch.material_id = patch.materialId;
  if (patch.patternId) columnPatch.pattern_id = patch.patternId;
  if (patch.fit) columnPatch.fit = patch.fit;
  if (patch.formalityLevel) columnPatch.formality_level = patch.formalityLevel;

  if (Object.keys(columnPatch).length > 0) {
    const { error } = await supabase.from('clothing_items').update(columnPatch).eq('id', id);
    if (error) throw error;
  }

  if (patch.colorIds) {
    await replaceColors(id, patch.colorIds);
  }
  if (patch.styleIds) {
    await replaceStyles(id, patch.styleIds);
  }

  const updated = await findClothingItemById(id);
  if (!updated) throw new Error('Failed to load the clothing item that was just updated.');
  return updated;
}

export async function deleteClothingItem(id: string): Promise<void> {
  const { error } = await supabase.from('clothing_items').delete().eq('id', id);
  if (error) throw error;
}

export async function setArchived(id: string, isArchived: boolean): Promise<ClothingItem> {
  const { error } = await supabase.from('clothing_items').update({ is_archived: isArchived }).eq('id', id);
  if (error) throw error;

  const updated = await findClothingItemById(id);
  if (!updated) throw new Error('Failed to load the clothing item after updating its archive state.');
  return updated;
}

export async function setFavorite(id: string, isFavorite: boolean): Promise<ClothingItem> {
  const { error } = await supabase.from('clothing_items').update({ is_favorite: isFavorite }).eq('id', id);
  if (error) throw error;

  const updated = await findClothingItemById(id);
  if (!updated) throw new Error('Failed to load the clothing item after updating its favorite state.');
  return updated;
}

async function replaceColors(clothingItemId: string, colorIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('clothing_item_colors')
    .delete()
    .eq('clothing_item_id', clothingItemId);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase
    .from('clothing_item_colors')
    .insert(colorIds.map((colorId) => ({ clothing_item_id: clothingItemId, color_id: colorId })));
  if (insertError) throw insertError;
}

async function replaceStyles(clothingItemId: string, styleIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('clothing_item_styles')
    .delete()
    .eq('clothing_item_id', clothingItemId);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase
    .from('clothing_item_styles')
    .insert(styleIds.map((styleId) => ({ clothing_item_id: clothingItemId, style_id: styleId })));
  if (insertError) throw insertError;
}

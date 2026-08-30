import { supabase } from '@/config/supabase';
import { Catalog, CatalogEntry, Color, Occasion, Subcategory } from '@/types/catalog.types';
import { FormalityLevel } from '@/types/clothingItem.types';

interface CatalogEntryRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubcategoryRow extends CatalogEntryRow {
  category_id: string;
}

interface ColorRow extends CatalogEntryRow {
  hex: string;
}

interface OccasionRow extends CatalogEntryRow {
  formality_hint: FormalityLevel;
}

function toCatalogEntry(row: CatalogEntryRow): CatalogEntry {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSubcategory(row: SubcategoryRow): Subcategory {
  return { ...toCatalogEntry(row), categoryId: row.category_id };
}

function toColor(row: ColorRow): Color {
  return { ...toCatalogEntry(row), hex: row.hex };
}

function toOccasion(row: OccasionRow): Occasion {
  return { ...toCatalogEntry(row), formalityHint: row.formality_hint };
}

async function findActiveEntries(table: string): Promise<CatalogEntry[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as CatalogEntryRow[]).map(toCatalogEntry);
}

export async function findActiveCategories(): Promise<CatalogEntry[]> {
  return findActiveEntries('categories');
}

export async function findActiveSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as SubcategoryRow[]).map(toSubcategory);
}

export async function findActiveMaterials(): Promise<CatalogEntry[]> {
  return findActiveEntries('materials');
}

export async function findActivePatterns(): Promise<CatalogEntry[]> {
  return findActiveEntries('patterns');
}

export async function findActiveColors(): Promise<Color[]> {
  const { data, error } = await supabase
    .from('colors')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as ColorRow[]).map(toColor);
}

export async function findActiveStyles(): Promise<CatalogEntry[]> {
  return findActiveEntries('styles');
}

export async function findActiveOccasions(): Promise<Occasion[]> {
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as OccasionRow[]).map(toOccasion);
}

export async function findOccasionById(id: string): Promise<Occasion | null> {
  const { data, error } = await supabase.from('occasions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toOccasion(data as OccasionRow) : null;
}

export async function findOccasionsByIds(ids: string[]): Promise<Occasion[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('occasions').select('*').in('id', ids);
  if (error) throw error;
  return (data as OccasionRow[]).map(toOccasion);
}

// --- Admin: full listings (active + inactive), duplicate checks, creation, activation ---

export type SimpleCatalogTable = 'categories' | 'materials' | 'patterns' | 'styles';

async function findAllEntries(table: string): Promise<CatalogEntry[]> {
  const { data, error } = await supabase.from(table).select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as CatalogEntryRow[]).map(toCatalogEntry);
}

async function findEntryByName(table: string, name: string): Promise<CatalogEntry | null> {
  const { data, error } = await supabase.from(table).select('*').eq('name', name).maybeSingle();
  if (error) throw error;
  return data ? toCatalogEntry(data as CatalogEntryRow) : null;
}

async function createEntry(table: string, name: string): Promise<CatalogEntry> {
  const { data, error } = await supabase.from(table).insert({ name }).select('*').single();
  if (error) throw error;
  return toCatalogEntry(data as CatalogEntryRow);
}

export async function findAllSimpleEntries(table: SimpleCatalogTable): Promise<CatalogEntry[]> {
  return findAllEntries(table);
}

export async function findSimpleEntryByName(
  table: SimpleCatalogTable,
  name: string,
): Promise<CatalogEntry | null> {
  return findEntryByName(table, name);
}

export async function createSimpleEntry(table: SimpleCatalogTable, name: string): Promise<CatalogEntry> {
  return createEntry(table, name);
}

export async function findAllSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase.from('subcategories').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as SubcategoryRow[]).map(toSubcategory);
}

export async function findSubcategoryByCategoryAndName(
  categoryId: string,
  name: string,
): Promise<Subcategory | null> {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .eq('name', name)
    .maybeSingle();
  if (error) throw error;
  return data ? toSubcategory(data as SubcategoryRow) : null;
}

export async function createSubcategory(input: { name: string; categoryId: string }): Promise<Subcategory> {
  const { data, error } = await supabase
    .from('subcategories')
    .insert({ name: input.name, category_id: input.categoryId })
    .select('*')
    .single();
  if (error) throw error;
  return toSubcategory(data as SubcategoryRow);
}

export async function findAllColors(): Promise<Color[]> {
  const { data, error } = await supabase.from('colors').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as ColorRow[]).map(toColor);
}

export async function findColorByName(name: string): Promise<Color | null> {
  const { data, error } = await supabase.from('colors').select('*').eq('name', name).maybeSingle();
  if (error) throw error;
  return data ? toColor(data as ColorRow) : null;
}

export async function createColor(input: { name: string; hex: string }): Promise<Color> {
  const { data, error } = await supabase
    .from('colors')
    .insert({ name: input.name, hex: input.hex })
    .select('*')
    .single();
  if (error) throw error;
  return toColor(data as ColorRow);
}

export async function findAllOccasions(): Promise<Occasion[]> {
  const { data, error } = await supabase.from('occasions').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as OccasionRow[]).map(toOccasion);
}

export async function findOccasionByName(name: string): Promise<Occasion | null> {
  const { data, error } = await supabase.from('occasions').select('*').eq('name', name).maybeSingle();
  if (error) throw error;
  return data ? toOccasion(data as OccasionRow) : null;
}

export async function createOccasion(input: { name: string; formalityHint: FormalityLevel }): Promise<Occasion> {
  const { data, error } = await supabase
    .from('occasions')
    .insert({ name: input.name, formality_hint: input.formalityHint })
    .select('*')
    .single();
  if (error) throw error;
  return toOccasion(data as OccasionRow);
}

export type CatalogTableName = SimpleCatalogTable | 'subcategories' | 'colors' | 'occasions';

export async function setCatalogEntryActive(
  table: CatalogTableName,
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase.from(table).update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function findFullCatalog(): Promise<Catalog> {
  const [categories, subcategories, materials, patterns, colors, styles, occasions] = await Promise.all([
    findActiveCategories(),
    findActiveSubcategories(),
    findActiveMaterials(),
    findActivePatterns(),
    findActiveColors(),
    findActiveStyles(),
    findActiveOccasions(),
  ]);

  return { categories, subcategories, materials, patterns, colors, styles, occasions };
}

import { supabase } from '@/config/supabase';
import { DollItem } from '@/types/doll.types';

const DOLL_ITEMS_TABLE = 'doll_items';

interface DollItemRow {
  id: string;
  name: string;
  category: DollItem['category'];
  layer: number;
  asset_url: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function toDomain(row: DollItemRow): DollItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    layer: row.layer,
    assetUrl: row.asset_url,
    color: row.color,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findActiveDollItems(): Promise<DollItem[]> {
  const { data, error } = await supabase
    .from(DOLL_ITEMS_TABLE)
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as DollItemRow[]).map(toDomain);
}

export async function findDollItemById(id: string): Promise<DollItem | null> {
  const { data, error } = await supabase
    .from(DOLL_ITEMS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toDomain(data as DollItemRow) : null;
}

export async function findDollItemsByIds(ids: string[]): Promise<DollItem[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from(DOLL_ITEMS_TABLE).select('*').in('id', ids);

  if (error) throw error;
  return (data as DollItemRow[]).map(toDomain);
}

// --- Admin: full listing (active + inactive), creation, edit, activation ---

export async function findAllDollItems(): Promise<DollItem[]> {
  const { data, error } = await supabase
    .from(DOLL_ITEMS_TABLE)
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as DollItemRow[]).map(toDomain);
}

export interface CreateDollItemInput {
  name: string;
  category: DollItem['category'];
  layer: number;
  assetUrl: string;
  color: string;
}

export async function createDollItem(input: CreateDollItemInput): Promise<DollItem> {
  const { data, error } = await supabase
    .from(DOLL_ITEMS_TABLE)
    .insert({
      name: input.name,
      category: input.category,
      layer: input.layer,
      asset_url: input.assetUrl,
      color: input.color,
    })
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as DollItemRow);
}

export interface UpdateDollItemInput {
  name?: string | undefined;
  category?: DollItem['category'] | undefined;
  layer?: number | undefined;
  assetUrl?: string | undefined;
  color?: string | undefined;
}

export async function updateDollItem(id: string, patch: UpdateDollItemInput): Promise<DollItem> {
  const columnPatch: Record<string, string | number> = {};
  if (patch.name) columnPatch.name = patch.name;
  if (patch.category) columnPatch.category = patch.category;
  if (patch.layer !== undefined) columnPatch.layer = patch.layer;
  if (patch.assetUrl) columnPatch.asset_url = patch.assetUrl;
  if (patch.color) columnPatch.color = patch.color;

  const { data, error } = await supabase
    .from(DOLL_ITEMS_TABLE)
    .update(columnPatch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as DollItemRow);
}

export async function setDollItemActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from(DOLL_ITEMS_TABLE).update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

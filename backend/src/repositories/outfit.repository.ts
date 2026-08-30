import { supabase } from '@/config/supabase';
import { Mood, OutfitSource } from '@/types/outfit.types';

export interface OutfitRow {
  id: string;
  userId: string;
  name: string | null;
  source: OutfitSource;
  compatibilityScore: number;
  occasionId: string | null;
  mood: Mood | null;
  createdAt: string;
  updatedAt: string;
}

interface RawOutfitRow {
  id: string;
  user_id: string;
  name: string | null;
  source: OutfitSource;
  compatibility_score: number;
  occasion_id: string | null;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
}

function toDomain(row: RawOutfitRow): OutfitRow {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    source: row.source,
    compatibilityScore: row.compatibility_score,
    occasionId: row.occasion_id,
    mood: row.mood,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findOutfitRowsForUser(userId: string): Promise<OutfitRow[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RawOutfitRow[]).map(toDomain);
}

export async function findOutfitRowById(id: string): Promise<OutfitRow | null> {
  const { data, error } = await supabase.from('outfits').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toDomain(data as RawOutfitRow) : null;
}

export async function findClothingItemIdsByOutfitIds(
  outfitIds: string[],
): Promise<Record<string, string[]>> {
  if (outfitIds.length === 0) return {};

  const { data, error } = await supabase
    .from('outfit_items')
    .select('outfit_id, clothing_item_id')
    .in('outfit_id', outfitIds);
  if (error) throw error;

  const byOutfitId: Record<string, string[]> = {};
  for (const row of data as { outfit_id: string; clothing_item_id: string }[]) {
    (byOutfitId[row.outfit_id] ??= []).push(row.clothing_item_id);
  }
  return byOutfitId;
}

export async function isClothingItemUsedInAnyOutfit(clothingItemId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('outfit_items')
    .select('outfit_id')
    .eq('clothing_item_id', clothingItemId)
    .limit(1);
  if (error) throw error;
  return (data as { outfit_id: string }[]).length > 0;
}

export async function deleteOutfit(id: string): Promise<void> {
  const { error } = await supabase.from('outfits').delete().eq('id', id);
  if (error) throw error;
}

export async function createOutfit(
  userId: string,
  input: {
    name: string | null;
    source: OutfitSource;
    compatibilityScore: number;
    clothingItemIds: string[];
    occasionId: string | null;
    mood: Mood | null;
  },
): Promise<OutfitRow> {
  const { data, error } = await supabase
    .from('outfits')
    .insert({
      user_id: userId,
      name: input.name,
      source: input.source,
      compatibility_score: input.compatibilityScore,
      occasion_id: input.occasionId,
      mood: input.mood,
    })
    .select('*')
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase
    .from('outfit_items')
    .insert(input.clothingItemIds.map((clothingItemId) => ({ outfit_id: data.id, clothing_item_id: clothingItemId })));
  if (itemsError) throw itemsError;

  return toDomain(data as RawOutfitRow);
}

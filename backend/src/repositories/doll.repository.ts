import { supabase } from '@/config/supabase';
import { Doll, UpdateDollAppearanceInput } from '@/types/doll.types';

const DOLLS_TABLE = 'dolls';

interface DollRow {
  id: string;
  user_id: string;
  body_type: Doll['bodyType'];
  skin_tone: Doll['skinTone'];
  hair_style: Doll['hairStyle'];
  hair_color: Doll['hairColor'];
  eye_color: Doll['eyeColor'];
  created_at: string;
  updated_at: string;
}

function toDomain(row: DollRow): Doll {
  return {
    id: row.id,
    userId: row.user_id,
    bodyType: row.body_type,
    skinTone: row.skin_tone,
    hairStyle: row.hair_style,
    hairColor: row.hair_color,
    eyeColor: row.eye_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findDollByUserId(userId: string): Promise<Doll | null> {
  const { data, error } = await supabase
    .from(DOLLS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? toDomain(data as DollRow) : null;
}

export async function createDollForUser(userId: string): Promise<Doll> {
  const { data, error } = await supabase
    .from(DOLLS_TABLE)
    .insert({ user_id: userId })
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as DollRow);
}

export async function updateDollAppearance(
  dollId: string,
  input: UpdateDollAppearanceInput,
): Promise<Doll> {
  const patch: Record<string, string> = {};
  if (input.bodyType) patch.body_type = input.bodyType;
  if (input.skinTone) patch.skin_tone = input.skinTone;
  if (input.hairStyle) patch.hair_style = input.hairStyle;
  if (input.hairColor) patch.hair_color = input.hairColor;
  if (input.eyeColor) patch.eye_color = input.eyeColor;

  const { data, error } = await supabase
    .from(DOLLS_TABLE)
    .update(patch)
    .eq('id', dollId)
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as DollRow);
}

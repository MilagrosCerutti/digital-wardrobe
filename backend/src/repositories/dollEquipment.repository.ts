import { supabase } from '@/config/supabase';

const DOLL_EQUIPMENT_TABLE = 'doll_equipment';

export async function findEquippedItemIds(dollId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from(DOLL_EQUIPMENT_TABLE)
    .select('doll_item_id')
    .eq('doll_id', dollId);

  if (error) throw error;
  return (data as { doll_item_id: string }[]).map((row) => row.doll_item_id);
}

export async function insertEquipment(dollId: string, dollItemId: string): Promise<void> {
  const { error } = await supabase
    .from(DOLL_EQUIPMENT_TABLE)
    .insert({ doll_id: dollId, doll_item_id: dollItemId });

  if (error) throw error;
}

export async function deleteEquipmentByItemIds(dollId: string, dollItemIds: string[]): Promise<void> {
  if (dollItemIds.length === 0) return;

  const { error } = await supabase
    .from(DOLL_EQUIPMENT_TABLE)
    .delete()
    .eq('doll_id', dollId)
    .in('doll_item_id', dollItemIds);

  if (error) throw error;
}

export async function deleteEquipment(dollId: string, dollItemId: string): Promise<void> {
  const { error } = await supabase
    .from(DOLL_EQUIPMENT_TABLE)
    .delete()
    .eq('doll_id', dollId)
    .eq('doll_item_id', dollItemId);

  if (error) throw error;
}

import { randomUUID } from 'node:crypto';
import { supabase } from '@/config/supabase';
import { EXTENSION_BY_MIME_TYPE } from '@/utils/imageMimeTypes';

const BUCKET_ID = 'clothing-images';

export async function uploadClothingImage(
  userId: string,
  file: { buffer: Buffer; mimetype: string },
): Promise<string> {
  const extension = EXTENSION_BY_MIME_TYPE[file.mimetype] ?? 'jpg';
  const path = `${userId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .upload(path, file.buffer, { contentType: file.mimetype });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_ID).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteClothingImage(imageUrl: string): Promise<void> {
  const marker = `/${BUCKET_ID}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const path = imageUrl.slice(index + marker.length);

  const { error } = await supabase.storage.from(BUCKET_ID).remove([path]);
  if (error) {
    // Best-effort cleanup: a stray file in storage is not worth failing the request over.
    console.error('Failed to delete clothing image from storage:', error);
  }
}

/**
 * One-time (idempotent) Supabase Storage setup for clothing item images.
 * Run with: npm run setup:storage
 */
import { supabase } from '@/config/supabase';

const BUCKET_ID = 'clothing-images';

async function main() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets.some((bucket) => bucket.id === BUCKET_ID)) {
    console.log(`Bucket "${BUCKET_ID}" already exists.`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET_ID, {
    public: true,
    fileSizeLimit: '5MB',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });
  if (createError) throw createError;

  console.log(`Created bucket "${BUCKET_ID}".`);
}

main();

import { supabase } from './supabase';

// Everything lives in the existing private pet-photos bucket. The storage
// policies gate on the first path segment, so the household id has to lead the
// key. See supabase/migrations/0006_photo_storage.sql.
const BUCKET = 'pet-photos';

/**
 * Upload under {household_id}/{folder}/, returning the object key to store.
 * Throws with the storage message so callers can surface it verbatim.
 */
export async function uploadHouseholdPhoto(
  file: File,
  householdId: string,
  folder: 'pets' | 'avatars',
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${householdId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw new Error(error.message);

  return path;
}

/** The bucket is private, so every image needs its own signed URL. */
export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return {};

  const signed: Record<string, string> = {};
  await Promise.all(
    unique.map(async (path) => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (data?.signedUrl) signed[path] = data.signedUrl;
    }),
  );

  return signed;
}

/** Replacing a picture should not leave the old object behind. */
export async function removePhoto(path: string | null): Promise<void> {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

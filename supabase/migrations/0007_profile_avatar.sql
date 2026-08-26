-- Client account pictures, requested by the practice alongside pet photos.
--
-- No new bucket and no new policy: objects live in the existing private
-- pet-photos bucket under {household_id}/avatars/, which the storage policies
-- already gate on the first path segment. Writes are covered by
-- profiles_update_self (clients, which pins role = 'client') and
-- profiles_staff_write (staff), so a client can set their own picture and
-- still cannot promote themselves.

alter table profiles add column avatar_path text;

comment on column profiles.avatar_path is
  'Object key in the private pet-photos bucket, {household_id}/avatars/{uuid}. Read through a signed URL; the bucket is never public.';

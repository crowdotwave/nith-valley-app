-- Storage for client-submitted social media photos.
--
-- Objects are keyed by household: pet-photos/{household_id}/{filename}. The
-- policies read that first path segment, so a client cannot write into or read
-- another household's folder even by guessing a path.
--
-- The bucket is private. Staff fetch images through signed URLs rather than
-- making the bucket public, so a photo a client later regrets is not left
-- sitting on a permanent public URL.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos',
  'pet-photos',
  false,
  10485760,  -- 10 MB; phone camera originals routinely exceed the 5 MB default
  array['image/jpeg', 'image/png', 'image/heic', 'image/webp']
);

create policy "pet_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = app.household_id()::text
  );

create policy "pet_photos_read_own_or_staff"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'pet-photos'
    and (
      (storage.foldername(name))[1] = app.household_id()::text
      or app.is_staff()
    )
  );

-- Clients may withdraw a photo they submitted; staff may remove any.
create policy "pet_photos_delete_own_or_staff"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'pet-photos'
    and (
      (storage.foldername(name))[1] = app.household_id()::text
      or app.is_staff()
    )
  );

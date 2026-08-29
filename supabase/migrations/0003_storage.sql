-- Migration 0003: Storage bucket + per-user isolation policies (FR-004, R2).
-- Identity: Clerk JWT sub (research R7b) — folder prefixes are the raw id string.
-- Ported from specs/001-document-archive/contracts/storage-policies.sql (2026-08-29).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false,
  52428800, -- 50 MB hard cap at storage layer
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg', 'image/png',
    'video/mp4'
  ]
)
on conflict (id) do update
set file_size_limit   = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types,
    public            = false;

-- Platform folder: readable by every authenticated user; NO write policies
-- exist for this prefix, so writes are default-deny → service-role key only
-- (operator maintenance script publishes fiches there).
drop policy if exists "documents_select_platform_folder" on storage.objects;
create policy "documents_select_platform_folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'platform'
  );

-- Every operation inside a teacher's own first-level folder is allowed only
-- to that same Clerk identity: {clerk_user_id}/...
drop policy if exists "documents_select_own_folder" on storage.objects;
create policy "documents_select_own_folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
  );

drop policy if exists "documents_insert_own_folder" on storage.objects;
create policy "documents_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
  );

drop policy if exists "documents_update_own_folder" on storage.objects;
create policy "documents_update_own_folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
  );

drop policy if exists "documents_delete_own_folder" on storage.objects;
create policy "documents_delete_own_folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
  );

-- =========================================================================

-- MIHAFAZATI DATABASE COMPLETE SCHEMA (Migrations 0001 to 0004)

-- =========================================================================


-- >>> 1. INITIAL CORE SCHEMA & RLS

-- Migration 0001: core schema + RLS for 001-document-archive
-- Target: Supabase Postgres 15, third-party auth via Clerk JWTs (research R1b/R7b).
-- Identity: auth.jwt()->>'sub' = Clerk user id (text). Idempotent per project.
-- Ported from specs/001-document-archive/contracts/db-schema.sql (2026-08-29).

create extension if not exists pg_trgm;

-- Identity helper: the Clerk user id for the current request.
create or replace function public.requesting_user_id() returns text
language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

-- ============ profiles ============
create table if not exists public.profiles (
  id                    text primary key,           -- Clerk user id ('sub' claim)
  full_name             text not null check (char_length(full_name) between 2 and 120),
  cycle                 text not null,
  subject               text not null default 'الفلسفة',
  agreement_accepted_at timestamptz not null default now(),
  notify_enabled        boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============ subscription_codes ============
create table if not exists public.subscription_codes (
  code       text primary key,
  max_uses   int  not null check (max_uses > 0),
  used_count int  not null default 0,
  expires_at timestamptz,
  note       text,
  created_at timestamptz not null default now(),
  check (used_count <= max_uses)
);

-- ============ taxonomy_nodes ============
create table if not exists public.taxonomy_nodes (
  id         text primary key,
  parent_id  text references public.taxonomy_nodes (id) on delete cascade,
  kind       text not null check (kind in ('section','axis','element')),
  label_ar   text not null,
  levels     text[] not null default '{}'
);
create index if not exists taxonomy_nodes_parent_idx on public.taxonomy_nodes (parent_id);

-- ============ documents ============
-- scope='platform'  : operator-published reference fiches, owner NULL, immutable to clients
-- scope='personal'  : teacher uploads, max 10 per owner (trigger-enforced)
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  owner_id      text references public.profiles (id) on delete cascade,
  scope         text not null default 'personal' check (scope in ('platform','personal')),
  element_id    text not null references public.taxonomy_nodes (id),
  storage_path  text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 255),
  format        text not null check (format in ('pdf','doc','xls','ppt','img','video','other')),
  mime_type     text not null,
  size_bytes    bigint not null check (size_bytes between 1 and 52428800),
  title         text,
  notes         text check (char_length(notes) <= 2000),
  tags          text[] not null default '{}',
  tags_text     text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (
    (scope = 'personal' and owner_id is not null)
    or (scope = 'platform' and owner_id is null)
  )
);
create index if not exists documents_owner_element_idx
  on public.documents (owner_id, element_id, created_at desc);
create index if not exists documents_trgm_idx
  on public.documents using gin ((title) gin_trgm_ops, (original_name) gin_trgm_ops, (tags_text) gin_trgm_ops);

-- ============ activity_events ============
create table if not exists public.activity_events (
  id          bigint generated always as identity primary key,
  owner_id    text not null references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('upload','delete','update','signup')),
  document_id uuid references public.documents (id) on delete set null,
  meta        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists activity_owner_recent_idx
  on public.activity_events (owner_id, created_at desc);

-- ============ updated_at & tags_text triggers ============
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.sync_document_tags_text() returns trigger
language plpgsql as $$
begin
  new.tags_text = array_to_string(new.tags, ' ');
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists documents_touch on public.documents;
create trigger documents_touch before insert or update on public.documents
  for each row execute function public.sync_document_tags_text();

-- ============ personal 10-file cap (FR-006 backstop) ============
create or replace function public.enforce_personal_cap() returns trigger
language plpgsql as $$
begin
  if new.scope = 'personal' then
    if (select count(*) from public.documents
        where owner_id = new.owner_id and scope = 'personal') >= 10 then
      raise exception 'PERSONAL_LIMIT_REACHED' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists documents_personal_cap on public.documents;
create trigger documents_personal_cap before insert on public.documents
  for each row execute function public.enforce_personal_cap();

-- ============ activity logging triggers ============
create or replace function public.log_document_event() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_owner text := coalesce(new.owner_id, old.owner_id);
begin
  if tg_op = 'INSERT' and new.scope = 'platform' then
    -- platform publications have no owner; activity_events requires one
    return new;
  end if;
  insert into public.activity_events (owner_id, kind, document_id, meta)
  values (
    v_owner,
    case tg_op when 'INSERT' then 'upload' when 'DELETE' then 'delete' else 'update' end,
    coalesce(new.id, old.id),
    jsonb_build_object('name', coalesce(new.original_name, old.original_name))
  );
  return coalesce(new, old);
end $$;

drop trigger if exists documents_log_insert on public.documents;
create trigger documents_log_insert after insert on public.documents
  for each row execute function public.log_document_event();
drop trigger if exists documents_log_delete on public.documents;
create trigger documents_log_delete after delete on public.documents
  for each row execute function public.log_document_event();
drop trigger if exists documents_log_update on public.documents;
create trigger documents_log_update after update on public.documents
  for each row when (old.* is distinct from new.*)
  execute function public.log_document_event();

-- ============ Row Level Security ============
-- Identity: public.requesting_user_id() = auth.jwt()->>'sub' (Clerk user id).
alter table public.profiles           enable row level security;
alter table public.subscription_codes enable row level security;
alter table public.taxonomy_nodes     enable row level security;
alter table public.documents          enable row level security;
alter table public.activity_events    enable row level security;

-- profiles: own row only
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = public.requesting_user_id());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = public.requesting_user_id())
  with check (id = public.requesting_user_id());

-- taxonomy: read-only for any authenticated user
drop policy if exists taxonomy_read_all on public.taxonomy_nodes;
create policy taxonomy_read_all on public.taxonomy_nodes
  for select using (public.requesting_user_id() is not null);

-- documents: platform rows readable by all; personal rows strictly owned.
drop policy if exists documents_select_own_or_platform on public.documents;
create policy documents_select_own_or_platform on public.documents
  for select using (
    owner_id = public.requesting_user_id()
    or scope = 'platform'
  );
drop policy if exists documents_insert_own_personal on public.documents;
create policy documents_insert_own_personal on public.documents
  for insert with check (
    owner_id = public.requesting_user_id()
    and scope = 'personal'
    and storage_path like public.requesting_user_id() || '/%'
  );
drop policy if exists documents_update_own on public.documents;
create policy documents_update_own on public.documents
  for update using (owner_id = public.requesting_user_id())
  with check (
    owner_id = public.requesting_user_id()
    and storage_path like owner_id || '/%'
  );
drop policy if exists documents_delete_own on public.documents;
create policy documents_delete_own on public.documents
  for delete using (owner_id = public.requesting_user_id());

-- activity: read own; inserts happen via security definer triggers only
drop policy if exists activity_select_own on public.activity_events;
create policy activity_select_own on public.activity_events
  for select using (owner_id = public.requesting_user_id());

-- ============ RPCs ============

-- Pre-check a subscription code before Clerk sign-up (UX only; consumption is
-- authoritative in consume_signup_code). Anon-callable for the signup form.
create or replace function public.check_code(p_code text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscription_codes c
    where c.code = upper(regexp_replace(p_code, '\s', '', 'g'))
      and c.used_count < c.max_uses
      and (c.expires_at is null or c.expires_at > now())
  );
$$;

-- Authoritative activation: validates + consumes code, creates profile keyed on
-- the Clerk JWT sub. Called once right after Clerk sign-up (research R1).
create or replace function public.consume_signup_code(
  p_code text, p_full_name text, p_cycle text
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(regexp_replace(p_code, '\s', '', 'g'));
  v_uid  text := public.requesting_user_id();
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'ALREADY_ACTIVATED' using errcode = '23505';
  end if;
  -- atomic claim: only succeeds while quota remains
  update public.subscription_codes
     set used_count = used_count + 1
   where code = v_code
     and used_count < max_uses
     and (expires_at is null or expires_at > now());
  if not found then
    raise exception 'CODE_INVALID' using errcode = 'P0002';
  end if;
  insert into public.profiles (id, full_name, cycle, agreement_accepted_at)
  values (v_uid, p_full_name, p_cycle, now());
  insert into public.activity_events (owner_id, kind, meta)
  values (v_uid, 'signup', jsonb_build_object('code', v_code));
end $$;

-- Whole-archive metadata search (R3). Personal + platform rows, ranked,
-- with element path. Platform rows are flagged so the UI can badge them.
create or replace function public.search_documents(q text)
returns table (
  id uuid, scope text, title text, original_name text, format text, size_bytes bigint,
  element_id text, element_label text, axis_label text, section_label text,
  created_at timestamptz
)
language sql stable security invoker as $$
  select d.id, d.scope, d.title, d.original_name, d.format, d.size_bytes,
         e.id, e.label_ar, a.label_ar, s.label_ar, d.created_at
  from public.documents d
  join public.taxonomy_nodes e on e.id = d.element_id
  join public.taxonomy_nodes a on a.id = e.parent_id
  join public.taxonomy_nodes s on s.id = a.parent_id
  where (d.owner_id = public.requesting_user_id() or d.scope = 'platform')
    and (
      d.title ilike '%' || q || '%'
      or d.original_name ilike '%' || q || '%'
      or d.tags_text ilike '%' || q || '%'
      or similarity(d.title, q) > 0.3
    )
  order by greatest(similarity(d.title, q), similarity(d.original_name, q)) desc nulls last,
           d.created_at desc
  limit 100;
$$;

-- Per-node document counts for completeness ledger + sidebar numerals (FR-011).
-- Personal documents only — platform fiches never affect completeness (FR-019).
create or replace function public.taxonomy_counts()
returns table (node_id text, doc_count bigint)
language sql stable security invoker as $$
  select e.id, count(d.id)
  from public.taxonomy_nodes e
  left join public.documents d
    on d.element_id = e.id and d.owner_id = public.requesting_user_id()
  where e.kind = 'element'
  group by e.id;
$$;

-- Storage usage in bytes for settings screen (FR-014).
create or replace function public.storage_usage()
returns bigint
language sql stable security invoker as $$
  select coalesce(sum(size_bytes), 0)::bigint
  from public.documents
  where owner_id = public.requesting_user_id();
$$;



-- >>> 2. OFFICIAL 3-SECTION TAXONOMY SEED

-- Migration 0002: official ministry taxonomy seed (FR-005, Constitution IV).
-- Source of truth: comprehensive 3-section ministerial hierarchy matching C:\Users\Pc\Downloads\الملف التراكمي.
-- Idempotent: upsert by stable slug ids. Depth invariant section→axis→element.

insert into public.taxonomy_nodes (id, parent_id, kind, label_ar, levels) values
-- ===== القسم التربوي الإداري =====
('tarbawi',                    null,              'section', 'القسم التربوي الإداري',                         '{}'),
('tarbawi.tashrii',            'tarbawi',         'axis',    'التشريع المدرسي',                               '{}'),
('tarbawi.tashrii.maraseem',   'tarbawi.tashrii', 'element', 'المراسيم والقوانين التنظيمية',                  '{}'),
('tarbawi.tashrii.mudhakkirat','tarbawi.tashrii', 'element', 'المذكرات والقرارات الوزارية',                  '{}'),
('tarbawi.tashrii.akhlaqiyat', 'tarbawi.tashrii', 'element', 'ميثاق وأخلاقيات المهنة',                      '{}'),

('tarbawi.masar',              'tarbawi',         'axis',    'المسار المهني',                                 '{}'),
('tarbawi.masar.indimaj',      'tarbawi.masar',   'element', 'الاندماج المهني (التوظيف، التعيين، الترسيم)',  '{}'),
('tarbawi.masar.istiqrar',     'tarbawi.masar',   'element', 'الاستقرار المهني (الترقية، الحركة، الرخص)',    '{}'),
('tarbawi.masar.tatawwur',     'tarbawi.masar',   'element', 'التطور المهني (تغيير الإطار والتقاعد)',        '{}'),

('tarbawi.daftar',             'tarbawi',         'axis',    'دفتر النصوص',                                   '{}'),
('tarbawi.daftar.mutayat',     'tarbawi.daftar',  'element', 'المعطيات التربوية والمقرر الوزاري',             '{}'),
('tarbawi.daftar.injez',       'tarbawi.daftar',  'element', 'تتبع إنجاز الدروس والمستويات',                 '{جذع مشترك,أولى باك,ثانية باك}'),
('tarbawi.daftar.amal',        'tarbawi.daftar',  'element', 'تتبع عمل التلميذ(ة)',                           '{جذع مشترك,أولى باك,ثانية باك}'),

-- ===== القسم الديداكتيكي =====
('didaktiki',                  null,              'section', 'القسم الديداكتيكي',                             '{}'),
('didaktiki.takhtit',          'didaktiki',       'axis',    'تخطيط التعلمات',                                '{}'),
('didaktiki.takhtit.wathaiq',  'didaktiki.takhtit','element','الوثائق التربوية ودلائل المنهاج',             '{}'),
('didaktiki.takhtit.bitaqat',  'didaktiki.takhtit','element','البطاقات التقنية والتوزيع الدوري',             '{جذع مشترك,أولى باك,ثانية باك}'),
('didaktiki.takhtit.barnamaj', 'didaktiki.takhtit','element','البرنامج الدراسي والمصوغات والمجزوءات',       '{جذع مشترك,أولى باك,ثانية باك}'),

('didaktiki.tadbir',           'didaktiki',       'axis',    'تدبير التعلمات',                                '{}'),
('didaktiki.tadbir.wathaiq',   'didaktiki.tadbir','element', 'الوثائق التربوية وميثاق القسم والتنشيط',        '{}'),
('didaktiki.tadbir.bitaqat',   'didaktiki.tadbir','element', 'البطاقات التقنية والطرائق البيداغوجية',        '{}'),
('didaktiki.tadbir.abead',     'didaktiki.tadbir','element', 'أبعاد الممارسة الصفية والتفاعلات',             '{}'),

('didaktiki.taqwim',           'didaktiki',       'axis',    'تقويم التعلمات',                                '{}'),
('didaktiki.taqwim.wathaiq',   'didaktiki.taqwim','element', 'الوثائق التربوية والأطر المرجعية والمذكرات',   '{}'),
('didaktiki.taqwim.bitaqat',   'didaktiki.taqwim','element', 'البطاقات التقنية والاستعدادات والتقييمات',     '{}'),
('didaktiki.taqwim.asalib',    'didaktiki.taqwim','element', 'الأساليب التقويمية والوضعيات الاختبارية والدعم','{جذع مشترك,أولى باك,ثانية باك}'),

-- ===== القسم التكويني المهني =====
('takwini',                    null,              'section', 'القسم التكويني المهني',                         '{}'),
('takwini.mumarsa',            'takwini',         'axis',    'الممارسة المهنية',                              '{}'),
('takwini.mumarsa.tawsif',     'takwini.mumarsa', 'element', 'التوصيف المعتمد والأسس التحليلية',             '{}'),
('takwini.mumarsa.shabakat',   'takwini.mumarsa', 'element', 'الشبكات التبصرية وتقييم الأداء التواصلي',       '{}'),

('takwini.takwin',             'takwini',         'axis',    'التكوين المستمر ومحاور التكوين',                '{}'),
('takwini.takwin.tawsif',      'takwini.takwin',  'element', 'توصيف التخصص (الفلسفة وعلوم التربية)',          '{}'),
('takwini.takwin.shabakat',    'takwini.takwin',  'element', 'الشبكات التقويمية للمعارف التخصصية',           '{}'),

('takwini.sihha',              'takwini',         'axis',    'الصحة المهنية',                                 '{}'),
('takwini.sihha.shabakat',     'takwini.sihha',   'element', 'الشبكات التشخيصية والإجهاد السيكو-فيزيولوجي',   '{}')

on conflict (id) do update
set parent_id = excluded.parent_id,
    kind      = excluded.kind,
    label_ar  = excluded.label_ar,
    levels    = excluded.levels;



-- >>> 3. STORAGE BUCKET & ACCESS POLICIES

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



-- >>> 4. PENDING SLOTS QUEUE

-- Migration 0004: empty-slot queue for the operator dashboard.
--
-- A "pending_slot" is a taxonomy element that has no platform fiche yet. It is
-- a shared, operator-managed checklist: every teacher sees the same queue, and
-- only the service-role key can write to it (RLS below = SELECT-only for
-- authenticated users, default-deny for INSERT/UPDATE/DELETE).
--
-- Why a separate table instead of a view over documents:
--   - Reason metadata (`no_platform` / `no_personal` / `no_either`) is per-slot
--     and doesn't fit naturally into the documents table.
--   - Status (`pending` / `in_progress` / `done` / `skipped`) is operator-side
--     state, decoupled from the personal-cap or completeness logic.
--   - Teachers can mark slots as in_progress in their own UI without touching
--     the documents table; the queue is read-only to them.
--
-- Populated by scripts/seed-queue.mjs (service-role). Re-runnable; idempotent
-- on (element_id) via the UNIQUE constraint.

create table if not exists public.pending_slots (
  id         uuid primary key default gen_random_uuid(),
  element_id text not null unique references public.taxonomy_nodes (id) on delete cascade,
  reason     text not null check (reason in ('no_platform','no_personal','no_either')),
  status     text not null default 'pending'
             check (status in ('pending','in_progress','done','skipped')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists pending_slots_touch on public.pending_slots;
create trigger pending_slots_touch before update on public.pending_slots
  for each row execute function public.touch_updated_at();

create index if not exists pending_slots_status_idx
  on public.pending_slots (status, updated_at desc);

-- ============ Row Level Security ============
-- Read-only for all authenticated users; no write policies for the `authenticated`
-- role means default-deny on INSERT/UPDATE/DELETE → only the service-role key
-- (operator maintenance scripts) can mutate the queue.
alter table public.pending_slots enable row level security;

drop policy if exists pending_slots_select_authenticated on public.pending_slots;
create policy pending_slots_select_authenticated on public.pending_slots
  for select to authenticated
  using (public.requesting_user_id() is not null);

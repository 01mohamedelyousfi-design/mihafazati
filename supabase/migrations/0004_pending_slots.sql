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

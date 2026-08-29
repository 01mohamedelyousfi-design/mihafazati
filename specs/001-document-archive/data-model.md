# Phase 1 Data Model: 001-document-archive

PostgreSQL (Supabase). Identity comes from **Clerk**: every request carries a
Clerk JWT whose `sub` claim (Clerk user id, text like `user_2abc...`) is the
authorization key. Every user-owned table has Row Level Security comparing
`public.requesting_user_id()` (= `auth.jwt()->>'sub'`) — see research R7b.

## Entity: profiles

One row per authenticated teacher; keyed by the Clerk user id.

| Column | Type | Rules |
|---|---|---|
| id | text PK | `= Clerk user id` (`sub` claim), inserted only by `consume_signup_code` |
| full_name | text | NOT NULL, 2..120 chars |
| cycle | text | NOT NULL, CHECK in (`ثانوي تأهيلي`, `ثانوي إعدادي`, `ابتدائي`) |
| subject | text | NOT NULL, default `الفلسفة` |
| agreement_accepted_at | timestamptz | NOT NULL — signup blocks without it (FR-003) |
| notify_enabled | boolean | default true (US5) |
| created_at / updated_at | timestamptz | defaults, trigger-maintained |

No FK to a Supabase auth schema table — Clerk is the source of truth for
account existence; deleting a Clerk user leaves profile cleanup to an operator
job (documented in assumptions).

## Entity: subscription_codes

Operator-issued access codes (FR-002).

| Column | Type | Rules |
|---|---|---|
| code | text PK | stored normalized (uppercase, no spaces) |
| max_uses | int | > 0 |
| used_count | int | default 0, ≤ max_uses enforced in Edge Function transaction |
| expires_at | timestamptz | NULL = never expires |
| note | text | operator memo |
| created_at | timestamptz | default now() |

No client access except through the `check_code` / `consume_signup_code` RPCs.

## Entity: taxonomy_nodes

Adjacency list for the fixed ministry hierarchy (FR-005, Constitution IV).
Read-only to all authenticated users; written only by migration/seed.

| Column | Type | Rules |
|---|---|---|
| id | text PK | stable slug e.g. `tarbawi.tashrii` |
| parent_id | text FK → taxonomy_nodes.id | NULL only for the 3 sections |
| kind | text | CHECK in (`section`,`axis`,`element`) |
| label_ar | text | NOT NULL official Arabic label |
| levels | text[] | applicable school years (`جذع مشترك`,`أولى باك`,`ثانية باك`); empty = N/A |

Depth invariant: section(0) → axis(1) → element(2), checked by seed script.
~3 sections + ~9 axes + ~27+ elements seeded from prototype `js/data.js`.

## Entity: documents

The archive itself; every row files exactly one file under one element (FR-007,
Constitution IV).

| Column | Type | Rules |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| owner_id | text FK → profiles.id | NULL for platform scope; NOT NULL for personal; cascade delete |
| scope | text | CHECK in (`platform`,`personal`), default `personal`; consistency CHECK below |
| element_id | text FK → taxonomy_nodes.id | NOT NULL — no free-floating docs (applies to both scopes) |
| storage_path | text | NOT NULL unique, `{owner_id}/{uuid}-{sanitized_name}` |
| original_name | text | NOT NULL, 1..255 chars |
| format | text | CHECK in (`pdf`,`doc`,`xls`,`ppt`,`img`,`video`,`other`) derived from mime |
| mime_type | text | NOT NULL, allow-list validated pre-upload |
| size_bytes | bigint | 1 .. 52_428_800 (50 MB) |
| title | text | optional display title, indexed via trigram |
| notes | text | ≤ 2000 chars |
| tags | text[] | default `{}`, trigram-covered via generated `tags_text` |
| created_at / updated_at | timestamptz | defaults, trigger-maintained |

Indexes: `(owner_id, element_id, created_at DESC)`; GIN trigram on
`(title, original_name, tags_text)`.
**Consistency CHECK**:
`(scope = 'personal' AND owner_id IS NOT NULL) OR (scope = 'platform' AND owner_id IS NULL)`.
**Personal cap (10 files total)**: BEFORE INSERT trigger raises
`PERSONAL_LIMIT_REACHED` when `scope='personal'` and the owner already has 10
rows — backstop to the UI check; cannot be bypassed via crafted requests.
**Duplicate rule**: warn when same `owner_id + element_id + original_name +
size_bytes` exists (spec edge case).

## Entity: activity_events

Dashboard feed (FR-012); append-only, pruned to last 100/user by nightly job.

| Column | Type | Rules |
|---|---|---|
| id | bigint identity PK | |
| owner_id | text FK → profiles.id | NOT NULL |
| kind | text | CHECK in (`upload`,`delete`,`update`,`signup`) |
| document_id | uuid FK → documents.id | NULLable (signup events), ON DELETE SET NULL |
| meta | jsonb | free payload (name snapshot etc.) |
| created_at | timestamptz | default now(), indexed DESC per owner |

## Derived State (not stored)

- **Completeness per node** (FR-011, FR-019): computed by RPC
  `taxonomy_counts()` returning per-axis/element document counts —
  **personal documents only** (`owner_id = requesting_user_id()`); platform
  fiches are excluded from completeness. UI maps count→state:
  `0 = missing (warning)`, `1+ = filled (success)`;
  "partial" reserved for future minimum-threshold config.
- **Storage usage** (FR-014): `sum(size_bytes)` over the teacher's personal
  rows; quota is naturally bounded by the 10-file × 50 MB cap.

## State Transitions

```
Personal Document: (upload started) --storage PUT ok--> row INSERTED --> [update title/tags/move element]* --> DELETE (confirm dialog) --> storage removed + row gone + event logged
                   (11th insert attempt) --> trigger raises PERSONAL_LIMIT_REACHED
Platform Document: operator maintenance script (service role) --> row + file published; immutable to all clients thereafter
Session:   SIGNED_OUT --> SIGNED_IN(signup|login) --> TOKEN_REFRESHED* --> SIGNED_OUT
Code:      issued(active) --> used_count++ per signup --> exhausted/expired (rejected at validation)
```

## RLS Matrix (SC-004)

Identity helper everywhere: `requesting_user_id() = auth.jwt()->>'sub'`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | own | own via `consume_signup_code` only | own | own |
| subscription_codes | none | none | none | none |
| taxonomy_nodes | all authenticated | none | none | none |
| documents | own OR any platform | personal only (+path prefix, ≤10 cap) | own only | own only |
| activity_events | own | own (trigger-assisted) | none | none |

Storage bucket `documents` layout and rules:

```text
documents (private)
├── platform/{element_id}/...        ← readable by authenticated; NO write policy = service-role-only writes
└── {clerk_user_id}/...              ← full CRUD for the owner inside their prefix only
```

Client policies: `(storage.foldername(name))[1] = auth.jwt()->>'sub'` for the
own prefix; a separate SELECT-only policy exposes `platform/*`. Absence of
INSERT/UPDATE/DELETE policies on the platform folder means default-deny —
only the service-role key can publish there.

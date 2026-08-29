# Phase 0 Research: 001-document-archive

All NEEDS CLARIFICATION items from Technical Context resolved. Each entry:
Decision / Rationale / Alternatives considered.

## R1: Signup gated by subscription code with Clerk auth

**Decision**: Authentication runs on **Clerk** (clerk-js CDN script,
email/password). The subscription-code gate works in two steps:
1. **Pre-check (UX)**: anon-callable Postgres RPC `check_code(p_code)` returns
   validity so the form shows Arabic errors before account creation.
2. **Consume (truth)**: after Clerk sign-up succeeds, the client calls RPC
   `consume_signup_code(p_code, p_full_name, p_cycle, p_subject)` — authenticated
   by the fresh Clerk JWT. It validates the code atomically
   (`used_count < max_uses AND not expired`), inserts `profiles` keyed on the
   JWT `sub`, increments usage, and records agreement acceptance — all in one
   transaction. Failure ⇒ the profile never exists, so RLS shows the user an
   empty, unusable app until activation completes.

**Rationale**: Clerk owns credentials/sessions/MFA-grade security; Supabase
third-party auth makes its JWTs the authorization currency for RLS. Moving code
validation into a DB function removes the former Edge Function entirely (fewer
moving parts, Constitution VI) while keeping consumption atomic and
server-authoritative.

**Alternatives considered**:
- *Client-side validation only*: trivially bypassed; rejected.
- *Edge Function calling Clerk Backend API*: viable but adds Deno surface for
  what one SQL transaction does better; rejected.
- *DB trigger rejecting bad profiles after signup*: leaves orphaned Clerk users;
  rejected.

## R1b: Wiring Clerk JWTs into supabase-js

**Decision**: Load clerk-js from CDN in `index.html`; in `js/supabase.js`:

```js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  accessToken: async () => await window.Clerk.session?.getToken({ template: 'supabase' }) ?? null,
});
```

The `accessToken` hook (supabase-js v2) is consulted per request, eliminating
stale-token classes of bugs; no `onAuthStateChange` bridging needed. A Clerk
JWT template named `supabase` must exist in the Clerk dashboard (includes `sub`
claim; 60s lifetime default is fine since tokens are fetched per call).

**Rationale**: Official pattern for Clerk+Supabase third-party auth; keeps
`api/*` layer ignorant of auth entirely.

**Alternatives considered**: manual token refresh + header injection — more
code, stale-token bugs; rejected.

## R2: Upload mechanics with real progress

**Decision**: Browser `XMLHttpRequest` PUT directly to
`{SUPABASE_URL}/storage/v1/object/documents/{user_id}/{uuid}-{safeName}` with
`apikey` + `Authorization: Bearer <access_token>` headers. XHR provides native
`progress` events (FR-006) and abort/retry control. The DB `documents` row is
inserted only after the storage PUT returns 200, so no orphaned rows on failure
(US2 scenario 3). Small files (<8 MB) may use `supabase.storage.from().upload()`
for simplicity via one helper.

**Rationale**: `supabase-js` `upload()` wraps fetch which exposes no upload
progress; teachers filing 30 MB videos need visible feedback. Direct XHR keeps
vanilla stack (VI), zero new dependencies.

**Alternatives considered**:
- *tus resumable uploads*: better for flaky networks but adds a dependency and
  server-side cleanup concerns; deferred until a ratified amendment demands it.
- *Base64 through Postgres*: absurd for 50 MB files; rejected.

## R3: Arabic metadata search

**Decision**: PostgreSQL `pg_trgm` GIN index over `documents.title`,
`original_name`, and a `tags_text` generated column; query via
`ILIKE '%term%' OR similarity(term, title) > 0.3` through `.textSearch`-free
custom select (RPC function `search_documents(q text)` returning ranked rows +
element path). Trigram works acceptably for Arabic script substrings and needs
no dictionary.

**Rationale**: Meets SC-003 (<2s @ 1000+ docs) with one extension enabled by
default on Supabase; Arabic-language FTS configs (`arabic` Snowball) stem
poorly for Moroccan administrative vocabulary and mis-handle mixed
French/Latin fragments common in filenames.

**Alternatives considered**:
- *tsvector with 'arabic' config*: weak stemming coverage, worse recall on
  real teacher filenames; rejected after review of corpus style.
- *Client-side filtering of all rows*: dies at FR-009 scale; rejected.

## R4: Rendering large lists without a framework

**Decision**: Windowed rendering written once in `ui/documentList.js`: fixed-
height rows, absolute-positioned spacer, render only visible ±5 rows on scroll
(plain math, ~80 lines). Sidebar counts and completeness use SQL aggregate RPCs
(`taxonomy_counts(owner)`), never client-side counting.

**Rationale**: Satisfies FR-009 (1000+ docs/element, no freeze) with zero
dependencies (VI).

**Alternatives considered**: *Pagination-only UI*: acceptable fallback shipped
behind the same component flag, but inspection flow favors continuous scroll.

## R5: Session handling & route guarding

**Decision**: Hash routing (`#/login`, `#/dashboard`, `#/library/:nodeId`,
`#/settings`) so static hosting needs zero rewrite rules. `main.js` loads
Clerk (`window.Clerk.load()` with publishable key), then subscribes to
`Clerk.addListener(({ session }) => ...)`: a live session renders the protected
view; `null` session unconditionally redirects to `#/login` preserving
in-progress upload state in memory. Token freshness is delegated to the
`accessToken` hook (R1b) — no manual refresh logic anywhere.

**Rationale**: Covers spec edge cases (reload persistence, expiry mid-upload)
with the smallest possible router (~40 lines); Clerk handles silent token
renewal itself.

**Alternatives considered**: *Path routing + Netlify `_redirects`*: also fine
but couples hosting choice (III/VI favor portability).

## R6: Testing strategy runnable by test-guard

**Decision**:
1. Unit: Node ≥ 20 built-in runner (`node --test tests/unit/`) with `happy-dom`
   for DOM-touching pure modules (`js/domain/*`). No transpilation — source ES
   modules run natively under Node.
2. RLS matrix: `tests/e2e/rls.spec.mjs` runs `psql`-executed policy tests via
   two test accounts proving cross-user denial (SC-004) — executed against
   staging project with `SUPABASE_DB_URL`.
3. Smoke E2E: Playwright driving local static server + staging Supabase:
   signup→file→find→completeness→delete happy path.

**Rationale**: Gives Constitution II's test-guard concrete, fast commands;
keeps CI-free local verification viable on Windows PowerShell.

**Alternatives considered**: *Jest/Vitest*: unnecessary dependency weight for
this surface (VI).

## R7: Configuration & secrets

**Decision**: `js/config.js` commits ONLY publishable values —
`CLERK_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Optional
`js/config.local.js` (gitignored) overrides per environment. Service-role key
exists solely in the operator's local env for `scripts/seed-platform.mjs`.
`.env`-style files are forbidden in the repo root.

**Rationale**: Matches Constitution III secret rules; prevents accidental
service-key leakage flagged in agent-folder security notice.

## R7b: Identity type — Clerk ids are text, not uuid

**Decision**: Clerk user ids look like `user_2abc...` (not UUIDs). Therefore
`profiles.id`, `documents.owner_id`, and `activity_events.owner_id` are **text**
columns keyed on the JWT `sub` claim. RLS compares via a stable helper:

```sql
create function public.requesting_user_id() returns text
language sql stable as $$ select nullif(auth.jwt()->>'sub','') $$;
```

Storage prefixes use the same string: `{clerk_user_id}/file.pdf`.

**Rationale**: Fighting Clerk's id format with uuid casting would invent a
mapping table for zero benefit; text keys keep policies one-liners and the
storage layout human-auditable.

## R8: Taxonomy seed source of truth

**Decision**: Existing `js/data.js` prototype taxonomy is extracted into
`supabase/migrations/0002_seed_taxonomy.sql` (idempotent upsert). After
migration, `js/data.js` becomes deprecated and the client reads the tree from
Postgres (cached in-memory per session, invalidated on version bump).

**Rationale**: Constitution IV demands ONE spine; keeping two copies would
drift. Spec FR-005 says identical-for-all-users → belongs in DB.

## R9: Hosting configuration

**Decision**: Netlify free tier. Ship `_headers` (long-cache `/css /js`
immutable fingerprints optional v1; deny directory listing) and register the
production domain in the Clerk application (allowed origins). Vercel remains
drop-in equivalent.

**Rationale**: User-selected; zero-config static + HTTPS required by FR-001
OAuth-less email flows.

## R10: Platform fiches vs personal uploads (two scopes, 10-file cap)

**Decision**: ONE `documents` table with a `scope` column (`platform` /
`personal`). Platform fiches are published by the operator through a local
maintenance script holding the service-role key; they live under
`platform/{element_id}/...` in the same bucket and carry `owner_id = NULL`.
Teachers hold at most **10 personal documents total** (user-confirmed), enforced
twice: UI gate before file selection + BEFORE INSERT trigger
(`PERSONAL_LIMIT_REACHED`). Completeness counts personal rows only (FR-019);
platform rows appear mixed in the tree with a 'منصة' badge.

**Rationale**: A single table keeps tree lists, search, and signed URLs as one
query path (`scope='platform' OR owner_id=requesting_user_id()`); two tables
would duplicate every view. The trigger makes the 10-file limit un-bypassable even
by crafted API calls, matching the RLS defense-in-depth stance. Default-deny
(no write policies) on the `platform/` storage folder means only the service
role can publish there.

**Alternatives considered**:
- *Separate `platform_documents` table*: cleaner-looking RLS but duplicates
  search/list/count logic everywhere; rejected.
- *Client-side-only 10-file check*: trivially bypassed; rejected — DB trigger
  is mandatory.
- *Public bucket for platform files*: leaks content to non-subscribers,
  breaking the subscription-gate model; rejected.

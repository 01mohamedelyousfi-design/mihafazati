---
description: "Task list for 001-document-archive implementation"
---

# Tasks: Mihafazati — Personal Portfolio Archive

**Input**: Design documents from `/specs/001-document-archive/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: INCLUDED — mandated by Constitution II (test-guard). Every story ships
with unit tests (`node --test tests/unit/`) and/or E2E smoke (Playwright) per
`quickstart.md` §8.

**⚠️ Per-task completion gate (Constitution I & II)**: a task is DONE only when
(1) `test-guard` passes on touched scope and (2) `clean-code-guard` has reviewed
the produced code. Both skills MUST be loaded by the implementing agent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Single project at repo root (per plan.md): `js/`, `css/`, `supabase/`,
`scripts/`, `tests/` — no build step, no bundler.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Skeleton + tooling so every later task has a home

- [ ] T001 Create directory skeleton per plan.md Project Structure:
      `js/{api,domain,ui,features}`, `supabase/migrations`,
      `tests/{unit,e2e}`, `scripts/`
- [ ] T002 [P] Create `js/config.example.js` exporting `CLERK_PUBLISHABLE_KEY`,
      `SUPABASE_URL`, `SUPABASE_ANON_KEY` placeholders; add `.gitignore`
      entries for `js/config.js`, `.env*`, agent credential folders
- [ ] T003 [P] Add `package.json` (type: module, private) with scripts:
      `test` → `node --test tests/unit/`, `e2e` → `playwright test tests/e2e/`,
      `serve` → `npx serve .`; install dev-only `happy-dom`
- [ ] T004 [P] Playwright config `playwright.config.mjs`: baseURL localhost,
      webServer static serve, chromium project; add `.gitignore`d test-results

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, auth wiring, client bootstrap, and platform-fiche
pipeline that EVERY story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Port `contracts/db-schema.sql` → `supabase/migrations/0001_init.sql`
      (tables, triggers incl. `enforce_personal_cap`, RLS keyed on Clerk JWT
      `sub`, RPCs `check_code` / `consume_signup_code` / `search_documents` /
      `taxonomy_counts` / `storage_usage`) and apply to the staging project;
      record applied version
- [ ] T006 [P] Port `contracts/seed-taxonomy.sql` →
      `supabase/migrations/0002_seed_taxonomy.sql`; cross-check ids/labels
      against prototype `js/data.js` (all 3 sections, axes, elements present)
- [ ] T007 [P] Port `contracts/storage-policies.sql` →
      `supabase/migrations/0003_storage.sql` (documents bucket, own-prefix +
      platform read-only policies)
- [ ] T008 Implement `js/supabase.js`: single `createClient(SUPABASE_URL,
      SUPABASE_ANON_KEY, { accessToken: () => auth.getToken('supabase') })` —
      per-request Clerk JWTs (research R1b); depends on T010
- [ ] T009 Implement `js/main.js` boot shell: load clerk-js from `index.html`
      script tag, hash router stubs (`#/login #/dashboard #/library/:nodeId
      #/settings`), `Clerk.addListener` session gate redirecting to `#/login`
      when signed out (research R5)
- [ ] T010 [P] Implement `js/auth.js`: the ONLY Clerk-aware module —
      `loadClerk()`, `onSession()`, `getToken()`, `userId()`, `signUp/signIn/
      signOut`, `openResetPassword()` per contracts/client-api.md; verify Clerk
      dashboard app + `supabase` JWT template + Supabase third-party auth JWKS
      registration are done (quickstart §4)
- [ ] T011 [P] Implement operator script `scripts/seed-platform.mjs`: walks an
      input folder, uploads each file to `platform/<element_id>/...` via
      service-role key, inserts `documents` rows with `scope='platform'`,
      idempotent on storage_path; SERVICE_ROLE_KEY read from env only
- [ ] T012 Refactor existing `css/styles.css` design tokens into CSS custom
      properties exactly matching DESIGN.md palette/typography/radii tables;
      RTL base (`dir="rtl"`, IBM Plex Sans Arabic import), focus-visible ring,
      reduced-motion media query — foundation for all components

**Checkpoint**: Migrations applied, Clerk session guard boots the app to login,
platform publishing pipeline works end-to-end against staging.

---

## Phase 3: User Story 1 — Secure Signup & First Entry (Priority: P1) 🎯 MVP

**Goal**: A teacher registers through Clerk + subscription-code activation and
reaches her empty dashboard; sessions persist; logout locks everything.

**Independent Test**: Register with valid code (checkCode → Clerk signUp →
activate) → reload keeps session → logout → direct URL access redirects to
`#/login`.

### Tests for User Story 1 ⚠️ (write FIRST, watch them FAIL)

- [ ] T013 [P] [US1] Unit tests `tests/unit/validation.test.js`: signup form
      rules (email format, password ≥8, required cycle/subject/code/agreement),
      code normalization (uppercase, strip spaces) over `js/domain/validation.js`
- [ ] T014 [P] [US1] E2E `tests/e2e/auth.spec.mjs`: invalid code rejected with
      Arabic error before account use; valid code activates and lands on
      dashboard; reload keeps Clerk session; logout redirects; direct `#/library`
      while logged out redirects

### Implementation for User Story 1

- [ ] T015 [US1] Implement `js/domain/validation.js` pure functions:
      `validateSignup(form)`, `normalizeCode(code)` (depends on T013 failing)
- [ ] T016 [P] [US1] Implement `js/api/auth.js`: `activate()` via RPC
      `consume_signup_code`, `checkCode()` via RPC `check_code`,
      `isActivated()`, getProfile/updateProfile per contracts/client-api.md;
      normalize failures to `{ code, messageAr }`
- [ ] T017 [US1] Build auth page controller `js/features/authPage.js` + markup
      in `index.html`: Clerk email/password fields, login/signup tabs,
      subscription-code + cycle + agreement step with inline Arabic errors and
      `checkCode` pre-check, loading states per DESIGN.md button specs
      (uses T015/T016)
- [ ] T018 [US1] Wire activation routing in `js/main.js`: signed-in-but-not-
      activated users land on the activation screen (RLS shows them nothing
      else); dashboard renders after profile exists; store accepted agreement
      timestamp via `consume_signup_code` (FR-003)

**Checkpoint**: US1 independently functional — signup/login/logout/reload all
pass E2E; test-guard green.

---

## Phase 4: User Story 2 — File Any Document Under a Minute (Priority: P1)

**Goal**: Upload PDF/DOC/XLS/PPT/IMG/MP4 ≤50 MB from any context with auto-
resolved destination, progress, retry, duplicates warning, 10-file cap,
platform rows badged and immutable.

**Independent Test**: From inside an element, upload a file → row appears with
badge+size+date; 11th upload refused; platform fiche shows منصة badge without
edit/delete controls.

### Tests for User Story 2 ⚠️

- [ ] T019 [P] [US2] Unit tests `tests/unit/format.test.js`: badgeFor mime/name
      mapping, sanitizeFileName (keeps Arabic, strips hostile chars), extToFormat
      over `js/domain/format.js`
- [ ] T020 [P] [US2] Unit tests `tests/unit/validation.quota.test.js`:
      `validateFile` allow-list + 50 MB rule; `validateUploadQuota(count)` at 9,
      10, 11 boundaries returning Arabic limit message (FR-006)
- [ ] T021 [P] [US2] E2E `tests/e2e/upload.spec.mjs`: happy upload with progress;
      duplicate warning path; quota exhaustion message at 10 files; DB-level
      bypass attempt via RPC/console insert fails with PERSONAL_LIMIT_REACHED

### Implementation for User Story 2

- [ ] T022 [US2] Implement `js/domain/format.js` pure functions per
      contracts/client-api.md (T019 red first)
- [ ] T023 [US2] Extend `js/domain/validation.js`: `validateFile(file)` type/
      size allow-list, `validateUploadQuota(personalCount)`, 
      `isDuplicateCandidate(a,b)` (T020 red first)
- [ ] T024 [P] [US2] Implement `js/api/taxonomy.js`: cached `getTree()` from
      Postgres (post-migration source of truth, research R8), `getNode(id)`,
      `getCounts()` 60s cache + invalidation hook
- [ ] T025 [US2] Implement `js/api/documents.js`: listByElement (range query),
      personalCount, upload via XHR PUT with progress/abort/retry then row insert
      (research R2), remove (storage+row), update, findDuplicate, createSignedUrl,
      getUsageBytes per contracts/client-api.md
- [ ] T026 [US2] Build uploader UI `js/ui/upload.js`: dropzone, destination
      pre-fill from context + inline element switcher without losing picked file
      (FR-008), progress bar, error/retry, duplicate confirm dialog, quota-blocked
      state with remaining count
- [ ] T027 [US2] Build list renderer `js/ui/documentList.js`: windowed rendering
      (±5 rows, research R4), format badges, منصة badge on scope='platform' rows
      with edit/delete controls withheld (FR-017/018), sort/filter hooks for US3
- [ ] T028 [US2] Library controller `js/features/library.js`: route
      `#/library/:nodeId` → tree context + document list + upload entry points

**Checkpoint**: US1 + US2 both pass their suites independently.

---

## Phase 5: User Story 3 — Find Any Document in Seconds (Priority: P2)

**Goal**: Always-visible taxonomy tree navigation + filters + whole-archive
metadata search <2s including platform fiches.

**Independent Test**: Seed corpus → search "امتحان" returns matches with
taxonomy location <2s; XLS filter under a محور shows only spreadsheets.

### Tests for User Story 3 ⚠️

- [ ] T029 [P] [US3] E2E `tests/e2e/search.spec.mjs`: seeded archive search by
      title/tag, result shows element path + منصة badge where applicable; filter
      by format within axis; empty-state instruction rendered for empty element

### Implementation for User Story 3

- [ ] T030 [US3] Build sidebar tree `js/ui/tree.js`: indented RTL tree of
      sections→axes→elements from `api/taxonomy.getTree()`, expand/collapse with
      max-height clamp animation (DESIGN.md motion), active accent-tint pill,
      counts numerals from `getCounts()`, keyboard navigable (FR-015)
- [ ] T031 [P] [US3] Implement `search(q)` consumption in
      `js/api/documents.js` (RPC `search_documents`) if not already exposed by
      T025 — verify contract shape incl. scope flag
- [ ] T032 [US3] Global search box in top bar (`index.html` +
      `js/features/library.js` handler): debounced input → results dropdown/page
      with element location links; Latin fragments render LTR inline (FR-015)
- [ ] T033 [US3] Format/date filter chips wired into documentList toolbar using
      `format.js` mappings; counts consistency between chips and sidebar

**Checkpoint**: US3 passes; tree + search usable during simulated inspection.

---

## Phase 6: User Story 4 — Inspection-Ready Completeness Ledger (Priority: P2)

**Goal**: Live missing/filled states per axis/element; dashboard = ledger +
recent activity.

**Independent Test**: File/delete documents → ledger and sidebar counts update
everywhere consistently, counting personal docs only (FR-019).

### Tests for User Story 4 ⚠️

- [ ] T034 [P] [US4] Unit tests `tests/unit/completeness.test.js`:
      `stateForCount` boundaries (0→missing, ≥1→filled), `ledger(tree,counts)`
      rollup correctness, exclusion of platform rows
- [ ] T035 [P] [US4] E2E `tests/e2e/completeness.spec.mjs`: upload→success color
      appears; delete→warning returns; dashboard ledger numbers match sidebar

### Implementation for User Story 4

- [ ] T036 [US4] Implement `js/domain/completeness.js` pure functions (T034 red)
- [ ] T037 [US4] Dashboard controller `js/features/dashboard.js` +
      `index.html` section: asymmetric two-column layout per DESIGN.md —
      completeness ledger (from T036 + taxonomy_counts RPC) + recent activity
      feed from activity_events (limit 10)
- [ ] T038 [US4] Mutation hook: after every upload/delete/move invalidate
      `getCounts()` cache and re-render ledger + tree numerals (single event bus
      in `js/main.js` or tiny pub/sub in api layer)

**Checkpoint**: Stories 1–4 all green independently and together.

---

## Phase 7: User Story 5 — Account & Data Settings (Priority: P3)

**Goal**: Notifications toggle, privacy/agreement review, usage display,
document/account deletion paths.

**Independent Test**: Toggle persists across reloads; usage bytes match stored
sum; delete flows confirm before acting.

### Tests for User Story 5 ⚠️

- [ ] T039 [P] [US5] Unit tests `tests/unit/settings.test.js`: settings state
      reducer/persistence mapping over `js/features/settings.js` pure parts
- [ ] T040 [P] [US5] E2E `tests/e2e/settings.spec.mjs`: toggle persists; usage
      shown; document delete requires confirm dialog; account deletion removes
      profile+docs (staging only)

### Implementation for User Story 5

- [ ] T041 [US5] Settings controller `js/features/settings.js` + markup:
      notify toggle (profiles.notify_enabled), privacy section re-displaying
      agreement text + acceptance date (FR-003 traceability), usage meter from
      getUsageBytes() with 10×50MB ceiling framing (FR-014), per-document delete
      list (personal only), account deletion request flow
- [ ] T042 [US5] Wire password reset entry point to Clerk's reset flow
      (`auth.openResetPassword`, FR-001); verify staging domain allow-list

**Checkpoint**: All five stories independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security proof, accessibility proof, performance proof, release prep

- [ ] T043 Implement RLS matrix script `tests/e2e/rls.mjs` per quickstart §8:
      two teacher accounts assert cross-user SELECT/INSERT/UPDATE/DELETE denial,
      platform-row mutation denial, PERSONAL_LIMIT_REACHED bypass attempt,
      storage cross-prefix denial (SC-004, FR-004, FR-018)
- [ ] T044 [P] Accessibility sweep: Lighthouse ≥95 on login/dashboard/library/
      settings (SC-006), contrast audit vs DESIGN.md tokens, full keyboard walk,
      touch targets ≥44px, reduced-motion fallback verification; fix findings
- [ ] T045 [P] Performance pass: verify FCP <2s throttled, search <2s @1000+
      rows (SC-003), windowed list smoothness; add `_headers` for Netlify
      (research R9) + Supabase production redirect URLs
- [ ] T046 Publish initial platform fiche set via `scripts/seed-platform.mjs`;
      verify badges/read-only behavior as teacher (FR-017)
- [ ] T047 Run full quickstart.md validation end-to-end on staging; fix drift
      between docs and reality
- [ ] T048 Final clean-code-guard review across all new modules (layering rule
      features→ui/domain→api→supabase.js respected), then final test-guard run
      of the complete suite

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T004)**: none → start immediately
- **Foundational (T005–T012)**: needs Setup; BLOCKS all stories.
  Within phase: migrations T005–T007 parallel; runtime T008–T012 after config
  exists (T002); seed-platform script T011 independent
- **US1 (T013–T018)**: after Foundational; MVP gate
- **US2 (T019–T028)**: needs US1 session context (upload requires auth);
  T024–T025 API layer before UI T026–T028
- **US3 (T029–T033)**: needs US2's list/taxonomy APIs (T024/T025)
- **US4 (T034–T038)**: needs US2 mutations to observe counts changing
- **US5 (T039–T042)**: after US1; otherwise independent
- **Polish (T043–T048)**: last; T046 any time after Foundational

### Parallel Opportunities

- [P]-marked unit/E2E tests within a phase can be written together (before
  their implementation tasks, per test-first)
- T005/T006/T007 migrations parallel; T011 operator script parallel
- After Foundational: US1 may proceed while T011/T046 platform publishing is
  prepared by a second agent

---

## Implementation Strategy

### MVP First

1. Phases 1–2 → checkpoint validated
2. Phase 3 (US1) → STOP, run test-guard, demo signup-to-dashboard
3. Phase 4 (US2) → core value shipped: filing works
4. Then US3 → US4 → US5, each validated at its checkpoint

### Per-task discipline (NON-NEGOTIABLE)

Every task above ends with: `node --test tests/unit/` (+ relevant e2e subset)
via **test-guard**, then **clean-code-guard** review — per Constitution I & II
and AGENTS.md. Commit after each task or logical group.

## Notes

- Paths are repo-root relative; single static project, no build step
- Platform fiches NEVER uploaded from browser code; service-role key stays in
  local env for scripts/Edge Function secrets only (research R7/R10)
- Verify tests FAIL before implementing each story (red-green discipline)

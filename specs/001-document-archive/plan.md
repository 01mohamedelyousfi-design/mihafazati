# Implementation Plan: Mihafazati — Personal Portfolio Archive

**Branch**: `001-document-archive` | **Date**: 2026-08-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-document-archive/spec.md`

## Summary

Login-gated Arabic-first RTL archive where Moroccan philosophy teachers file
large volumes of documents (PDF, DOCX, XLSX, PPTX, images, MP4) into the
ministry's fixed three-section taxonomy. Vanilla HTML/CSS/ES-module frontend
(evolved from the existing prototype) uses **Clerk** (clerk-js CDN) for
email/password auth gated by subscription codes and a data-responsibility
agreement; Clerk JWTs authorize **Supabase** Postgres (RLS on the `sub` claim)
and Storage. Files live under per-user prefixes; platform fiches are published
read-only by the operator via service-role script. Completeness ledgers,
metadata search (pg_trgm), and an inspection-ready dashboard sit on top.

## Technical Context

**Language/Version**: JavaScript ES2022 (browser ES modules); SQL (PostgreSQL 15, Supabase)

**Primary Dependencies**: `@clerk/clerk-js` + `@supabase/supabase-js` v2 (CDN — the ONLY runtime dependencies per Constitution VI); IBM Plex Sans Arabic via Google Fonts CDN; dev-only: Node ≥ 20 (test runner + static server), Playwright (E2E smoke)

**Storage**: Supabase Postgres (all relational data, RLS keyed on `auth.jwt()->>'sub'`) + Supabase Storage bucket `documents` (files under `{clerk_user_id}/...` prefixes; platform corpus under `platform/`)

**Testing**: Node built-in test runner (`node:test`) with happy-dom for unit tests of pure logic modules; Playwright smoke E2E against local server + staging Supabase project; automated RLS policy tests (two-user isolation matrix) — this is what `test-guard` executes

**Target Platform**: Static hosting on Netlify/Vercel (HTTPS mandatory); evergreen Chrome/Edge/Firefox/Safari desktop + Android/iOS mobile at ≥ 360px

**Project Type**: Single-page static web app + hosted backend-as-a-service

**Performance Goals**: First contentful paint < 2s on mid-range phone over 3G; search results < 2s at 1000+ documents (SC-003); filing flow < 60s end-to-end (SC-002); tree navigation interactions < 100ms perceived (optimistic UI)

**Constraints**: No build step, no framework, no state library (Constitution VI); publishable keys only in browser (Clerk pk + Supabase anon); every table RLS-on; 50 MB/file upload cap; **max 10 personal files per teacher** (UI gate + DB trigger); platform fiches published only via service-role script (research R10); WCAG 2.1 AA (Constitution V); Arabic RTL throughout (Constitution V)

**Scale/Scope**: Per-teacher: exactly ≤10 personal documents + the platform fiche corpus (operator-managed, hundreds of reference papers across ~27+ elements — windowed rendering stays justified by this corpus). Total users sized by subscription codes issued (hundreds in year one)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|---|---|---|
| I | Clean-code-guard skill mandatory | ✅ PASS | Plan mandates the skill in Definition of Done for every implementation task (see Workflow in Development Workflow & Quality Gates); agents cannot present code without it |
| II | Test-guard on completion | ✅ PASS | Testing stack above gives test-guard concrete runnable checks (`node:test`, RLS matrix, Playwright smoke); completion requires passing run |
| III | Clerk auth, Supabase data/files | ✅ PASS | Auth = Clerk (clerk-js CDN); Supabase consumes Clerk JWTs for RLS/Storage (third-party auth); no second backend; publishable keys only in browser |
| IV | Taxonomy-first data model | ✅ PASS | `documents.element_id NOT NULL REFERENCES taxonomy_nodes`; seed migration loads official hierarchy from `js/data.js`; all views derive from it |
| V | Arabic-first RTL & accessibility | ✅ PASS | Spec FR-015 + SC-006; DESIGN.md tokens carried into CSS custom properties; Lighthouse ≥ 95 gate |
| VI | Vanilla simplicity | ✅ PASS | Zero new runtime dependencies; no build step; text-extraction explicitly out of scope |

No violations — Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-document-archive/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    ├── db-schema.sql    # Tables, RLS policies (migration 0001)
    ├── seed-taxonomy.sql# Official taxonomy seed (migration 0002)
    ├── storage-policies.sql # Bucket + storage RLS (migration 0003)
    └── client-api.md    # JS module signatures (the app's internal API surface)
```

### Source Code (repository root)

```text
/
├── index.html                  # App shell: clerk-js <script> + login gate → dashboard/library/settings
├── css/
│   └── styles.css              # Design tokens from DESIGN.md as custom properties + components
├── js/
│   ├── main.js                 # Entry: Clerk load, session guard, router, boot
│   ├── config.js               # CLERK_PUBLISHABLE_KEY + SUPABASE_URL + anon key ONLY (gitignored override config.local.js)
│   ├── data.js                 # Existing prototype taxonomy seed → source for migration 0002
│   ├── auth.js                 # Clerk wrapper: loadClerk(), token getters, session events (only file importing Clerk)
│   ├── supabase.js             # Single createClient() with accessToken hook pulling Clerk JWTs
│   ├── api/                    # Data-access layer (only layer importing supabase.js)
│   │   ├── auth.js             # signUp flow (code consume RPC), profile read/update
│   │   ├── documents.js        # list/search/upload/delete/presign/quota operations
│   │   └── taxonomy.js         # cached read of taxonomy tree + counts
│   ├── domain/                 # Pure logic (unit-test targets)
│   │   ├── completeness.js     # missing/partial/filled computation (personal docs only)
│   │   ├── format.js           # mime→badge mapping, size/date formatting (Arabic numerals)
│   │   └── validation.js       # signup form, file type/size rules, duplicates, 10-file quota gate
│   ├── ui/                     # DOM renderers (pure functions → nodes/events)
│   │   ├── tree.js             # sidebar taxonomy tree (signature component)
│   │   ├── documentList.js     # virtualized list/grid + filters + منصة badges
│   │   ├── upload.js           # dropzone, progress, retry, limit-reached state
│   │   └── toast.js            # toasts, empty states, dialogs
│   └── features/               # Page controllers wiring api+domain+ui
│       ├── authPage.js
│       ├── dashboard.js
│       ├── library.js
│       └── settings.js
├── scripts/
│   └── seed-platform.mjs       # Operator-only: publish platform fiches via SERVICE_ROLE_KEY env (never committed)
├── supabase/
│   └── migrations/             # 0001_init.sql, 0002_seed_taxonomy.sql, 0003_storage.sql
├── tests/
│   ├── unit/                   # node:test + happy-dom over js/domain/*
│   └── e2e/                    # Playwright smoke: signup→file→find→completeness; RLS matrix incl. platform immutability + 11th-file rejection
└── specs/                      # (this feature's artifacts)
```

**Structure Decision**: Extend the existing root-level prototype in place —
no monorepo, no `src/` relocation — because Constitution VI forbids build-step
complexity and the prototype already matches the final hosting shape. The
layering rule is strict: `features → ui/domain → api → supabase.js/auth.js`;
only `api/*` may import the Supabase client and only `main.js`/`auth.js` touch
Clerk, which keeps test-guard's unit scope (`js/domain`) free of network mocks
and makes clean-code-guard reviews focus on one dependency direction.

## Complexity Tracking

> No constitution violations — section intentionally empty.

<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0 (MAJOR)
Modified principles:
  - III. Supabase-Only Backend → III. Managed Backend Split: Clerk Auth + Supabase Data/Files
    (Rationale: redefinition of the authentication mandate from Supabase Auth to
    Clerk; MAJOR bump per Governance versioning rules)
Added sections: none
Removed sections: none
Templates requiring updates:
  - .specify/templates/*.md ✅ compatible (gates read from this file)
  - AGENTS.md ✅ updated (stack summary line)
  - specs/001-document-archive/* ✅ updated in same amendment (plan, spec, research,
    data-model, contracts, quickstart, tasks)
Follow-up TODOs: none

PREVIOUS REPORT (v1.0.0 initial ratification)
Version change: (none) → 1.0.0
Added: Core Principles I–VI, Technology Constraints, Development Workflow,
Governance.
-->

# Mihafazati (محفظتي) Constitution

## Core Principles

### I. Clean Code Discipline — clean-code-guard Skill Mandatory (NON-NEGOTIABLE)

Every agent working on this project MUST load and apply the `clean-code-guard`
skill to all production code it writes, edits, refactors, or fixes BEFORE the
work is presented, committed, or merged. This applies to every task regardless
of size — no "trivial change" exemption. Review findings MUST be resolved or
explicitly justified in writing before handoff.

**Rationale**: A document-archive app holding teachers' official portfolios
demands maintainable, predictable code; unreviewed agent output is the primary
source of regressions in this codebase.

### II. Test Guard on Completion (NON-NEGOTIABLE)

Every agent MUST finish every coding task by running the `test-guard` skill to
verify its work. A task is not "done" until test-guard validation passes:
existing behavior verified, new behavior covered, no silent failures. Agents
MUST report the test-guard result as part of task completion. Work that cannot
pass test-guard MUST be flagged as blocked, never marked complete.

**Rationale**: Verification is part of the definition of done, not an optional
extra step agents skip under time pressure.

### III. Clerk for Auth, Supabase for Data & Files

Authentication MUST use **Clerk** (email/password; signup gated by
subscription code, cycle, and subject; password reset via Clerk). Supabase is
configured as a **third-party auth consumer**: Clerk-issued JWTs authorize
every Postgres query (RLS via the `sub` claim) and every Storage operation.
All persistent data lives in Supabase Postgres protected by Row Level Security;
all files (PDF, DOCX, XLSX, PPT, images, video) live in Supabase Storage
buckets scoped per-user by policy. No custom auth server; no second database;
only publishable keys (Clerk publishable key + Supabase anon key) ship to the
browser — service keys stay server-side (operator scripts / secrets).

**Rationale**: Clerk owns the auth lifecycle with production-grade sessions and
UX; Supabase remains the single auditable data/file boundary through its
supported third-party JWT integration — one managed backend per concern, zero
custom crypto.

### IV. Taxonomy-First Data Model

The ministry three-section tree (القسم التربوي الإداري / الديداكتيكي /
التكويني المهني → محاور → عناصر → مستندات) is the primary data spine. Every
document row MUST reference exactly one taxonomy element. Navigation, upload
destinations, completeness ledgers, and search filters derive from this single
hierarchy — no parallel folder system, no free-floating documents.

**Rationale**: Filing speed and inspection readiness are the product's core
promises; they collapse if documents can live outside the taxonomy.

### V. Arabic-First RTL & Accessibility

All UI is `lang="ar"` / `dir="rtl"` by default with IBM Plex Sans Arabic.
WCAG 2.1 AA is mandatory: contrast ≥ 4.5:1 body text, full keyboard navigation,
visible focus, `prefers-reduced-motion` support, touch targets ≥ 44px. Latin
fragments (file names, email addresses) must render correctly inline.

**Rationale**: The users are Moroccan philosophy teachers on phones and laptops
between classes; exclusionary UI makes the archive unusable at inspection time.

### VI. Vanilla Simplicity (YAGNI)

Plain HTML/CSS/ES-module JavaScript served statically; no framework, no build
step, no state library. Dependencies require written justification against the
"Do It Yourself" threshold. Documents are stored and organized (metadata
search); text extraction/OCR is out of scope until a ratified amendment says
otherwise.

**Rationale**: The prototype already runs dependency-free; frameworks would add
complexity without serving the filing-speed mission.

## Technology Constraints

| Concern | Choice |
|---|---|
| Frontend | Static HTML/CSS/JS (ES modules), existing prototype (`index.html`, `css/`, `js/`) |
| Auth | **Clerk** (email/password via clerk-js CDN), signup gated by cycle + subject + subscription code; Clerk JWTs drive Supabase RLS |
| Database | Supabase Postgres + RLS keyed on `auth.jwt()->>'sub'` (Clerk user id) |
| Files | Supabase Storage, per-user prefix policies, 50 MB/file default cap, ≤10 personal files/user |
| SDKs | `@clerk/clerk-js` + `@supabase/supabase-js` v2 via CDN ESM/script — the ONLY runtime dependencies |
| Hosting | Netlify or Vercel static (HTTPS required) |
| Secrets | Publishable keys only in client (Clerk pk + Supabase anon); service key never ships to browser |

## Development Workflow & Quality Gates

1. Spec-driven flow: `speckit.specify` → `speckit.clarify` (if needed) →
   `speckit.plan` → `speckit.tasks` → `speckit.implement`.
2. Per-task loop for every agent: understand spec → implement → **test-guard**
   → **clean-code-guard** → report. Both skills are gates, not suggestions.
3. Database changes ship as versioned SQL migrations with RLS policies
   reviewed alongside schema.
4. No direct commits of unreviewed generated code; commits stay small and
   described in the repo's language convention.

## Governance

- This constitution supersedes any conflicting practice, instruction, or
  convenience argument in day-to-day work.
- Amendments: propose in writing, update this file, bump the semantic version
  (MAJOR = principle removal/redefinition, MINOR = new principle/material
  expansion, PATCH = wording), update the Sync Impact Report, propagate to
  `.specify/templates/*` if gates change.
- Compliance review: any agent observing a violation MUST stop and surface it
  rather than proceed.

**Version**: 2.0.0 | **Ratified**: 2026-08-25 | **Last Amended**: 2026-08-25

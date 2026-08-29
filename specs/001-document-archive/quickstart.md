# Quickstart: 001-document-archive

Get the archive running locally against a staging Supabase project.

## Prerequisites

- Node ≥ 20 (`node --version`)
- A Supabase project (free tier is fine) with SQL editor access
- A Clerk account with an application created (email/password enabled)
- Playwright browsers once: `npx playwright install chromium`

## 1. Database

In Supabase SQL editor, run in order (files in
`specs/001-document-archive/contracts/`):

1. `db-schema.sql` — tables, triggers incl. 10-file cap, RLS keyed on Clerk JWT
   `sub`, RPCs (`check_code`, `consume_signup_code`, search/counts/usage)
2. `seed-taxonomy.sql` — official ministry taxonomy
3. `storage-policies.sql` — `documents` bucket + isolation policies

## 2. Issuing a subscription code

```sql
insert into public.subscription_codes (code, max_uses, expires_at, note)
values ('TEST-CODE-2026', 5, now() + interval '90 days', 'staging');
```

## 3. Publishing platform fiches (operator only)

Platform papers are uploaded by YOU via the maintenance script — never through
the browser:

```powershell
$env:SUPABASE_URL='https://<project>.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='<service key>'   # local env only, never committed
node scripts/seed-platform.mjs ./platform-papers --element didaktiki.takhtit.judhur
```

The script uploads each file to `platform/<element_id>/...` and inserts a
`documents` row with `scope='platform'`. Teachers then see them badged 'منصة',
read-only. Verify: attempt an UPDATE as a teacher account → must be denied.

## 4. Clerk setup

1. In Clerk dashboard create an application with **Email + password** enabled.
2. Copy the **Publishable key** (pk_test_… / pk_live_…).
3. Create a **JWT Template** named exactly `supabase` (Claims: default —
   includes `sub`). Note the **JWKS URL** it shows.
4. In Supabase Dashboard → Authentication → **Third-Party Auth**: add Clerk and
   paste the JWKS URL. Supabase now trusts Clerk JWTs; RLS reads their `sub`.

No Edge Function deployment is needed — activation runs as Postgres RPCs.

## 5. Client config

Create `js/config.js` from `js/config.example.js`:

```js
export const CLERK_PUBLISHABLE_KEY = 'pk_test_...';
export const SUPABASE_URL = 'https://<project>.supabase.co';
export const SUPABASE_ANON_KEY = '<anon key>';   // publishable only!
```

Never place a service-role key here (Constitution III / research R7).

## 6. Run locally

```powershell
npx serve .            # or any static server on this folder
```

Open `http://localhost:3000`, sign up through Clerk, consume the test code,
file a PDF under القسم الديداكتيكي → تخطيط التعلمات, verify it appears in tree
counts, and that platform fiches show the 'منصة' badge with no edit/delete
controls. Upload 10 files and confirm the 11th is refused (FR-006).

## 7. Tests — what test-guard runs

```powershell
node --test "tests/unit/**/*.test.js"   # domain logic (fast, no network)
npx playwright test tests/e2e/          # smoke: signup→activate→file→find→completeness
$env:SUPABASE_DB_URL='...'; node tests/e2e/rls.mjs   # cross-user denial matrix + platform immutability + personal-cap bypass attempts (SC-004)
```

All three green = task complete (Constitution II). Then run clean-code-guard
review before presenting (Constitution I).

## 8. Deploy

Netlify drag-and-drop or Git integration; add `_headers` per research R9 and
register the production domain in the Clerk app (allowed origins). No build
command, publish directory = repo root.

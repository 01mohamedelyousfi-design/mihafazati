# scripts/ — Operator maintenance

Two Node 20+ scripts that publish platform content into Supabase using the
**service-role key** (never committed, never reaching the browser). Both
scripts are idempotent and safe to re-run.

## Prerequisites

1. A Supabase project with the schema applied. Run the migrations in order
   via the Supabase SQL editor (or `supabase db push`):

   ```text
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_seed_taxonomy.sql
   supabase/migrations/0003_storage.sql
   supabase/migrations/0004_pending_slots.sql
   ```

2. The **service-role key** from the Supabase project (Dashboard → Settings →
   API → `service_role`/`secret`). Treat it like a database password.

3. Node ≥ 20 (the scripts use built-in `fetch`, no extra deps).

## Configure env

Copy `scripts/.env.example` to `scripts/.env.local` and fill in real values.
**Never** commit `scripts/.env.local`. Or just `export` the vars in your shell:

```powershell
$env:SUPABASE_URL='https://<project>.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='<service_role key from Supabase dashboard>'
```

## seed-platform.mjs — upload the 8 platform fiches

Reads `scripts/manifests/platform-fiches.json` (the inventory of the 8 actual
files in the standalone tarbawi folder), uploads each file to
`platform/<element_id>/<sanitized-name>` in the `documents` bucket, and
inserts a `documents` row with `scope='platform'`, `owner_id=NULL`.

```powershell
# manifest mode (default)
node scripts/seed-platform.mjs

# manifest mode (custom path)
node scripts/seed-platform.mjs --manifest ./other-manifest.json

# CLI mode: one folder, one element
node scripts/seed-platform.mjs ./platform-papers --element didaktiki.takhtit.judhur
```

Output: one line per fiche plus a final summary.

- `uploaded` = new file + row
- `skipped`  = `documents` row already exists for that `storage_path` (idempotent)
- `error`    = file missing, mime unknown, element_id not seeded, etc. (see line)

## seed-queue.mjs — populate the empty-slot queue

Reads the taxonomy, the published platform corpus, and (optionally) one
teacher's personal documents; inserts a row in `pending_slots` for every
taxonomy element that has no platform fiche (and, when a teacher is given,
also flags elements with no personal doc). The dashboard reads this table
to show "what still needs to be filled".

```powershell
# all empty platform slots
node scripts/seed-queue.mjs

# also flag slots where a specific teacher has no personal doc
node scripts/seed-queue.mjs --teacher-id user_2abc...
```

## Iteration loop

After every change to either:

1. Edit the manifest under `scripts/manifests/` or the seed in `0002_seed_taxonomy.sql`.
2. Re-run the relevant migration in Supabase SQL editor.
3. Re-run `node scripts/seed-platform.mjs` to upload the changed files.
4. Re-run `node scripts/seed-queue.mjs` to refresh the queue.

## What the manifest encodes

Each entry in `scripts/manifests/platform-fiches.json` has:

- `file`: relative path under `source_root` (Windows paths use `\` separators;
  Node's `path.join` handles them on Windows).
- `element_id`: the production taxonomy slug from `0002_seed_taxonomy.sql`
  (e.g. `tarbawi.tashrii.lawa`).
- `title`: the display title teachers will see.
- `tags`: searchable Arabic tags.

There is a known spec drift: `js/data.js` (prototype) has **3 elements** under
`tarbawi.tashrii` (المراسيم / المذكرات / الأخلاقيات) while `0002_seed_taxonomy.sql`
(production) has **2** (lawا + mudhakkirat). The الأخلاقيات PDFs are mapped to
`mudhakkirat` as the closest available slot. If you want true 3-element
fidelity, ship a `0005_taxonomy_refine.sql` migration that splits
`tarbawi.tashrii.mudhakkirat` into `mudhakkirat` + `akhlaqiyat` and update
the manifest.

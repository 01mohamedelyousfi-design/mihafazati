#!/usr/bin/env node
// scripts/seed-queue.mjs
//
// Operator maintenance script: populate the pending_slots table with every
// taxonomy element that has no platform fiche yet. Idempotent on
// (element_id) via the UNIQUE constraint; re-running just refreshes
// the reason + updated_at columns.
//
// Usage:
//   node scripts/seed-queue.mjs                          # default: all empty slots
//   node scripts/seed-queue.mjs --teacher-id <clerk_id>  # also mark slots where teacher has no personal doc
//
// Required env:
//   SUPABASE_URL                  https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     <service key> (do NOT commit, do NOT log)

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { existsSync, readFileSync } from "node:fs";

const PROJECT_ROOT = resolve(__dirname, "..");
function loadLocalEnv() {
  const envPaths = [resolve(PROJECT_ROOT, "scripts", ".env.local"), resolve(PROJECT_ROOT, ".env.local")];
  for (const p of envPaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (!process.env[k]) process.env[k] = v;
        }
      });
    }
  }
}
loadLocalEnv();

// ============ env ============
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required env: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(2);
}
if (SUPABASE_SERVICE_ROLE_KEY.length < 20) {
  console.error("SUPABASE_SERVICE_ROLE_KEY looks too short; refusing to proceed.");
  process.exit(2);
}

// ============ argv parsing ============
function parseArgs(argv) {
  const args = { teacherId: null, help: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--teacher-id") { args.teacherId = argv[++i]; }
    else { console.error(`Unknown arg: ${a}`); process.exit(2); }
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/seed-queue.mjs                          # all empty platform slots
  node scripts/seed-queue.mjs --teacher-id <clerk_id>  # also mark slots where teacher has no personal doc
`);
}

// ============ Supabase REST helpers ============
const REST_BASE = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`;
const HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function listAllElements() {
  const res = await fetch(`${REST_BASE}/taxonomy_nodes?kind=eq.element&select=id,label_ar,parent_id&limit=200`, { headers: HEADERS });
  if (!res.ok) throw new Error(`taxonomy_nodes fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function listPlatformCoveredElements() {
  // DISTINCT element_id where scope='platform' (PostgREST: select=distinct on a column is supported via head+count, but
  // for clarity we fetch element_ids and dedupe here).
  const res = await fetch(`${REST_BASE}/documents?scope=eq.platform&select=element_id&limit=1000`, { headers: HEADERS });
  if (!res.ok) throw new Error(`documents fetch failed: ${res.status} ${res.statusText}`);
  const rows = await res.json();
  return new Set(rows.map((r) => r.element_id));
}

async function listTeacherPersonalElements(teacherId) {
  const res = await fetch(
    `${REST_BASE}/documents?owner_id=eq.${encodeURIComponent(teacherId)}&scope=eq.personal&select=element_id&limit=200`,
    { headers: HEADERS },
  );
  if (!res.ok) throw new Error(`personal documents fetch failed: ${res.status} ${res.statusText}`);
  const rows = await res.json();
  return new Set(rows.map((r) => r.element_id));
}

async function listExistingPending() {
  const res = await fetch(`${REST_BASE}/pending_slots?select=element_id&limit=200`, { headers: HEADERS });
  if (!res.ok) throw new Error(`pending_slots fetch failed: ${res.status} ${res.statusText}`);
  const rows = await res.json();
  return new Map(rows.map((r) => [r.element_id, r]));
}

async function upsertPendingSlot({ elementId, reason, notes }) {
  // PostgREST upsert on UNIQUE (element_id).
  const url = `${REST_BASE}/pending_slots?on_conflict=element_id`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ element_id: elementId, reason, notes: notes ?? null }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`pending_slots upsert failed: ${res.status} ${res.statusText} ${txt}`);
  }
}

// ============ main ============
const args = parseArgs(process.argv);
if (args.help) { printHelp(); process.exit(0); }

try {
  const [elements, platformCovered, existingPending] = await Promise.all([
    listAllElements(),
    listPlatformCoveredElements(),
    listExistingPending(),
  ]);
  const personalCovered = args.teacherId ? await listTeacherPersonalElements(args.teacherId) : null;

  let queued = 0, updated = 0, skipped = 0, errors = 0;
  for (const el of elements) {
    try {
      const hasPlatform = platformCovered.has(el.id);
      // Without a teacher id, we don't know which personal slots are empty;
      // treat "unknown" as "filled" so the queue only flags platform gaps.
      const personalStatus = personalCovered ? personalCovered.has(el.id) : true;
      let reason = null;
      if (!hasPlatform && !personalStatus) reason = "no_either";
      else if (!hasPlatform && personalStatus) reason = "no_platform";
      else if (hasPlatform && !personalStatus) reason = "no_personal";
      else reason = null;

      if (reason === null) {
        // When both platform and personal docs now exist, the slot is filled;
        // remove its queue row so the list reflects reality on every re-run.
        const url = `${REST_BASE}/pending_slots?element_id=eq.${encodeURIComponent(el.id)}`;
        const del = await fetch(url, { method: "DELETE", headers: HEADERS });
        if (del.ok) skipped += 1;
        continue;
      }

      const wasExisting = existingPending.has(el.id);
      const notes = wasExisting
        ? (existingPending.get(el.id).notes ?? null)
        : (args.teacherId ? `auto-queued at ${new Date().toISOString()}` : null);

      await upsertPendingSlot({ elementId: el.id, reason, notes });
      if (wasExisting) { updated += 1; } else { queued += 1; }
      console.log(`[${wasExisting ? "updated" : "queued"}] ${el.id} (${el.label_ar}) → ${reason}`);
    } catch (err) {
      console.error(`[error] ${el.id}: ${err.message}`);
      errors += 1;
    }
  }

  console.log(`\nSummary: queued=${queued} updated=${updated} cleared=${skipped} errors=${errors}`);
  if (errors > 0) process.exitCode = 1;
} catch (err) {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
}

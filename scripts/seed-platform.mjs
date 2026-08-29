#!/usr/bin/env node
// scripts/seed-platform.mjs
//
// Operator maintenance script: publish platform fiches into Supabase
// Storage + insert documents rows with scope='platform'. NEVER run from
// browser code (constitution III, research R7/R10). SERVICE_ROLE_KEY is
// read from the local env only; never committed, never logged.
//
// Usage:
//   # manifest mode (default): read scripts/manifests/platform-fiches.json
//   node scripts/seed-platform.mjs
//
//   # manifest mode (explicit):
//   node scripts/seed-platform.mjs --manifest ./path/to/manifest.json
//
//   # CLI mode: one folder, one element
//   node scripts/seed-platform.mjs ./platform-papers --element didaktiki.takhtit.judhur
//
// Required env:
//   SUPABASE_URL                  https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     <service key> (do NOT commit, do NOT log)

import { readFile, stat } from "node:fs/promises";
import { join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const DEFAULT_MANIFEST = join(PROJECT_ROOT, "scripts", "manifests", "platform-fiches.json");
const BUCKET = "documents";

import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  const envPaths = [join(PROJECT_ROOT, "scripts", ".env.local"), join(PROJECT_ROOT, ".env.local")];
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
  const args = { manifest: null, folder: null, elementId: null, help: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--manifest") { args.manifest = argv[++i]; }
    else if (a === "--element")  { args.elementId = argv[++i]; }
    else if (!a.startsWith("--")) { args.folder = a; }
    else { console.error(`Unknown arg: ${a}`); process.exit(2); }
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/seed-platform.mjs                                  # default manifest
  node scripts/seed-platform.mjs --manifest <path.json>           # custom manifest
  node scripts/seed-platform.mjs <folder> --element <element_id>  # CLI mode
`);
}

// ============ mime + format detection ============
const EXT = {
  ".pdf":  { mime: "application/pdf",                                                          format: "pdf"   },
  ".doc":  { mime: "application/msword",                                                       format: "doc"   },
  ".docx": { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  format: "doc"   },
  ".xls":  { mime: "application/vnd.ms-excel",                                                 format: "xls"   },
  ".xlsx": { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        format: "xls"   },
  ".ppt":  { mime: "application/vnd.ms-powerpoint",                                            format: "ppt"   },
  ".pptx": { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", format: "ppt"   },
  ".jpg":  { mime: "image/jpeg",                                                               format: "img"   },
  ".jpeg": { mime: "image/jpeg",                                                               format: "img"   },
  ".png":  { mime: "image/png",                                                                format: "img"   },
  ".mp4":  { mime: "video/mp4",                                                                format: "video" },
};

function detectFormat(filename) {
  const ext = extname(filename).toLowerCase();
  return EXT[ext] ?? { mime: "application/octet-stream", format: "other" };
}

import { createHash } from "node:crypto";

function sanitizeStorageSegment(s) {
  return s.replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_").slice(0, 150);
}

function storagePathFor(elementId, relOrName) {
  const hash = createHash("sha1").update(relOrName).digest("hex").slice(0, 8);
  const ext = extname(relOrName);
  const base = basename(relOrName, ext);
  const safeBase = sanitizeStorageSegment(base).replace(/^_+|_+$/g, "") || "fiche";
  return `platform/${elementId}/${hash}_${safeBase}${ext}`;
}

// ============ Supabase REST + Storage helpers ============
const REST_BASE = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`;
const STORAGE_BASE = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1`;
const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};
const storageHeaders = (mime) => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": mime,
  "x-upsert": "true", // idempotent re-runs overwrite same storage object
});

async function storageObjectExists(path) {
  // HEAD on /storage/v1/object/{bucket}/{path}
  const url = `${STORAGE_BASE}/object/${BUCKET}/${path}`;
  const res = await fetch(url, { method: "HEAD", headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
  return res.status === 200;
}

async function uploadToStorage(path, mime, bytes) {
  const url = `${STORAGE_BASE}/object/${BUCKET}/${path}`;
  const res = await fetch(url, { method: "POST", headers: storageHeaders(mime), body: bytes });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Storage upload failed: ${res.status} ${res.statusText} ${txt}`);
  }
}

async function documentsRowExistsByStoragePath(storagePath) {
  const url = `${REST_BASE}/documents?storage_path=eq.${encodeURIComponent(storagePath)}&select=id&limit=1`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`documents lookup failed: ${res.status} ${res.statusText}`);
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function insertDocumentRow(row) {
  const url = `${REST_BASE}/documents`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(row) });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`documents insert failed: ${res.status} ${res.statusText} ${txt}`);
  }
}

async function elementExists(elementId) {
  const url = `${REST_BASE}/taxonomy_nodes?id=eq.${encodeURIComponent(elementId)}&select=id&limit=1`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`taxonomy_nodes lookup failed: ${res.status} ${res.statusText}`);
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

// ============ core ============
async function publishOne({ filePath, relPath, elementId, title, tags }) {
  const { mime, format } = detectFormat(filePath);
  const originalName = basename(filePath);
  const size = (await stat(filePath)).size;
  if (size > 52_428_800) throw new Error(`File exceeds 50 MB cap: ${filePath}`);
  if (!(await elementExists(elementId))) {
    throw new Error(`Unknown element_id '${elementId}'. Run migration 0002_seed_taxonomy first.`);
  }
  const storagePath = storagePathFor(elementId, relPath || originalName);

  const existsInDb = await documentsRowExistsByStoragePath(storagePath);
  if (existsInDb) {
    return { filePath, storagePath, status: "skipped", reason: "documents row exists" };
  }

  const bytes = await readFile(filePath);
  await uploadToStorage(storagePath, mime, bytes);

  await insertDocumentRow({
    owner_id: null,
    scope: "platform",
    element_id: elementId,
    storage_path: storagePath,
    original_name: originalName,
    format,
    mime_type: mime,
    size_bytes: size,
    title: title ?? null,
    notes: null,
    tags: Array.isArray(tags) ? tags : [],
  });
  return { filePath, storagePath, status: "uploaded", size };
}

async function runManifest(manifestPath) {
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  if (!manifest.source_root) throw new Error(`Manifest missing 'source_root': ${manifestPath}`);
  const fiches = Array.isArray(manifest.fiches) ? manifest.fiches : [];
  if (fiches.length === 0) {
    console.warn("Manifest has no fiches; nothing to do.");
    return [];
  }
  const results = [];
  for (const fiche of fiches) {
    const filePath = join(manifest.source_root, fiche.file);
    try {
      const r = await publishOne({ filePath, relPath: fiche.file, elementId: fiche.element_id, title: fiche.title, tags: fiche.tags });
      results.push(r);
      console.log(`[${r.status}] ${fiche.file} → ${r.storagePath}`);
    } catch (err) {
      console.error(`[error] ${fiche.file}: ${err.message}`);
      results.push({ filePath, status: "error", error: err.message });
    }
  }
  return results;
}

async function runCli(folder, elementId) {
  // Walk folder non-recursively, upload each file under elementId.
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(folder, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => join(folder, e.name));
  const results = [];
  for (const filePath of files) {
    try {
      const r = await publishOne({ filePath, elementId, title: basename(filePath) });
      results.push(r);
      console.log(`[${r.status}] ${basename(filePath)} → ${r.storagePath}`);
    } catch (err) {
      console.error(`[error] ${basename(filePath)}: ${err.message}`);
      results.push({ filePath, status: "error", error: err.message });
    }
  }
  return results;
}

function summarize(label, results) {
  const ok = results.filter((r) => r.status === "uploaded").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errs = results.filter((r) => r.status === "error").length;
  console.log(`\n${label}: uploaded=${ok} skipped=${skipped} errors=${errs}`);
  if (errs > 0) process.exitCode = 1;
}

// ============ main ============
const args = parseArgs(process.argv);
if (args.help) { printHelp(); process.exit(0); }

try {
  if (args.folder && args.elementId) {
    const results = await runCli(args.folder, args.elementId);
    summarize(`CLI mode (${args.folder} → ${args.elementId})`, results);
  } else {
    const manifestPath = args.manifest ?? DEFAULT_MANIFEST;
    const results = await runManifest(manifestPath);
    summarize(`Manifest mode (${manifestPath})`, results);
  }
} catch (err) {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
}

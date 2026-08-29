<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-document-archive/plan.md

Tech stack summary: vanilla HTML/CSS/ES-module JS (no framework, no build),
Clerk for auth (clerk-js CDN), Supabase for data/files (Postgres RLS keyed on
Clerk JWT sub + Storage), static hosting on Netlify/Vercel, Arabic-first RTL
WCAG 2.1 AA.
<!-- SPECKIT END -->

# Agent Discipline (NON-NEGOTIABLE)

Governed by `.specify/memory/constitution.md` v2.0.0:

1. **Clean code**: every agent MUST load and apply the `clean-code-guard`
   skill to all production code BEFORE presenting/committing it. No exemptions.
2. **Test guard**: every agent MUST finish every coding task by running the
   `test-guard` skill (`node --test tests/unit/`, Playwright smoke, RLS matrix
   per `specs/001-document-archive/quickstart.md`). A task without a passing
   test-guard run is NOT complete.
3. Feature workflow lives in `specs/001-document-archive/`; follow
   spec → plan → tasks artifacts before implementing.

---

# Project Context: Mihafazati (محفظتي) — BUILT 2026-08-29

## Identity

- **Name**: Mihafazati (محفظتي) — "My Portfolio"
- **Type**: Arabic-first RTL personal archive web app
- **Audience**: Moroccan qualifying-secondary philosophy teachers (الثانوي التأهيلي، مادة الفلسفة)
- **Purpose**: Login-gated living database that files every teacher document into the
  official ministry three-section taxonomy. Inspection-ready at any moment.
- **Brand voice**: رصين، هادئ، موثوق (dignified, serene, dependable)
- **V1 success metric**: file a document in < 60s, find it in < 5s during inspection

## Source of Truth — Master archive (Cumulative Archive Inventory: 2026-08-29)

The user maintains the canonical corpus and built-in fiches in `C:\Users\Pc\Downloads\الملف التراكمي` containing **211 files** across all three sections:

```
C:\Users\Pc\Downloads\الملف التراكمي\
├── القسم التربوي-الإدراي\                  # Section 1: التربوي الإداري (11 files)
│   ├── 1التشريع المدرسي\                  # 5 files (3 مراسيم + 2 أخلاقيات)
│   ├── 2المسار المهني\                     # Structure scaffolding (الاندماج / الاستقرار / التطور)
│   └── 3دفتر النصوص\                      # 6 files (المعطيات / تتبع إنجاز الدروس / تتبع عمل التلميذ)
├── 2القسم الديداكتيكي-المدرسي\             # Section 2: الديداكتيكي (193 files)
│   ├── 1تخطيط التعلمات\                    # 18 files (3 وثائق + 5 بطاقات + 10 برنامج دراسي)
│   ├── 2تدبير التعلمات\                     # 6 files (3 وثائق + 3 بطاقات تقنية)
│   └── 3تقويم التعلمات\                    # 169 files (3 وثائق + 3 بطاقات + 163 أساليب تقويمية)
└── 3القسم التكويني-المهني\                 # Section 3: التكويني المهني (7 files)
    ├── 1الممارسة المهنية\                  # 2 files (توصيف + بطاقة تقييم الأداء التواصلي)
    ├── 2التكوين المستمر\                   # 4 files (3 توصيف تخصص + بطاقة تقييم المعارف)
    └── 3الصحة المهنية\                    # 1 file (بطاقة تقييم الإجهاد السيكو-فيزيولوجي)
```

**Treat `C:\Users\Pc\Downloads\الملف التراكمي` as the master canonical corpus.** Platform fiches (`scope = 'platform'`, owned by operator) are published into Supabase Storage from these `.docx`/`.pdf` templates by `scripts/seed-platform.mjs` using `SERVICE_ROLE_KEY`. Do not duplicate, rename, or move files inside this folder from inside the agent — it is the human's master copy.

## Comprehensive Built-In Fiches & Files Inventory

### Section 1: القسم التربوي الإداري (`tarbawi`) — 11 files
| Axis · Element | Disk Path (`الملف التراكمي\`) | Status | Built Files |
|---|---|---|---|
| 0. التشريع المدرسي · المراسيم | `القسم التربوي-الإدراي\1التشريع المدرسي\1مراسيم\` | ✅ 3 PDFs | `القانون الأساسي للمؤسسات التعليمية.pdf` · `القانون الأساسي لموظفي الوزارة الوطنية.pdf` · `النظام الأساسي للوظيفة العمومية.pdf` |
| 0. التشريع المدرسي · المذكرات | `القسم التربوي-الإدراي\1التشريع المدرسي\2مذكرات\` | ❌ Scaffolded | Directory structure ready |
| 0. التشريع المدرسي · الأخلاقيات | `القسم التربوي-الإدراي\1التشريع المدرسي\3أخلاقيات\` | ✅ 2 PDFs | `ميثاق أخلاقيات المهنة.pdf` · `ميثاق حسن سلوك الموظف العمومي.pdf` |
| 1. المسار المهني · الاندماج/الاستقرار/التطور | `القسم التربوي-الإدراي\2المسار المهني\` | ❌ Scaffolded | Subdirectories: التوظيف، التعيين، الترسيم، الترقية، الحركة، الرخص، تغيير الإطار، التقاعد |
| 2. دفتر النصوص · المعطيات | `القسم التربوي-الإدراي\3دفتر النصوص\1المعطيات التربوية\` | 🟡 1 PDF | `1المقرر الوزاري\1783238281_-مقرر-تنظيم-السنة-الدراسية-2026-2027.pdf` (مجالس المؤسسة + جدول الحصص scaffolded) |
| 2. دفتر النصوص · تتبع إنجاز الدروس | `القسم التربوي-الإدراي\3دفتر النصوص\2تتبع إنجاز الدروس\` | 🟡 1 docx + tmp | `2المستويات\1 TC\S1\1شتنبر\TC CB S1 09.docx` |
| 2. دفتر النصوص · تتبع عمل التلميذ(ة) | `القسم التربوي-الإدراي\3دفتر النصوص\3تتبع عمل التلميذ(ة)\` | 🟡 1 docx | `1 TC\PH TCLSH1 PÉT S1.docx` |

### Section 2: القسم الديداكتيكي المدرسي (`didaktiki`) — 193 files
| Axis · Element | Disk Path (`الملف التراكمي\`) | Status | Built Files / Summary |
|---|---|---|---|
| 0. تخطيط التعلمات · الوثائق التربوية | `2القسم الديداكتيكي-المدرسي\1تخطيط التعلمات\1الوثائق التربوية\` | ✅ 3 PDFs | `التوجيهات التربوية لمادة الفلسفة.pdf` · `دليل إدماج تكنلوجيا المعلومات والاتصال.pdf` · `دليل الحياة المدرسية_ دجنبر 2019.pdf` |
| 0. تخطيط التعلمات · البطاقات التقنية | `2القسم الديداكتيكي-المدرسي\1تخطيط التعلمات\2البطاقات التقنية\` | ✅ 5 DOCX | `السيرورة التعليمية التعلمية.docx` · `اللوازم المدرسية الإلزامية للتلميذ(ة).docx` · التوزيع الدوري لـ `TC S½.docx`، `1BAC S½.docx`، `2BAC S½.docx` |
| 0. تخطيط التعلمات · البرنامج الدراسي | `2القسم الديداكتيكي-المدرسي\1تخطيط التعلمات\3البرنامج الدراسي\` | ✅ 10 DOCX | مجزوءات ومصوغات الفلسفة والإنسان والوضع البشري عبر المستويات (TC, 1BAC, 2BAC S1 & S2) |
| 1. تدبير التعلمات · الوثائق التربوية | `2القسم الديداكتيكي-المدرسي\2تدبير التعلمات\1الوثائق التربوية\` | ✅ 3 PDFs | `دليل التواصل البيداغوجي والتنشيط.pdf` · `دليل الحياة المدرسية_ دجنبر 2019.pdf` · `ميثاق القسم لمادة الفلسفة.pdf` |
| 1. تدبير التعلمات · البطاقات التقنية | `2القسم الديداكتيكي-المدرسي\2تدبير التعلمات\2البطاقات التقنية\` | ✅ 3 DOCX | `1التواصل البيداغوجي\بطاقة.docx` · `2الطرائق البيداغوجية\بطاقة.docx` · `3أساليب التدريس\بطاقة.docx` |
| 2. تقويم التعلمات · الوثائق التربوية | `2القسم الديداكتيكي-المدرسي\3تقويم التعلمات\1الوثائق التربوية\` | ✅ 3 files | `المذكرة 04-142.pdf` · `الإطار المرجعي المحين` · `المذكرة 04-7` |
| 2. تقويم التعلمات · البطاقات التقنية | `2القسم الديداكتيكي-المدرسي\3تقويم التعلمات\2البطاقات التقنية\` | ✅ 3 DOCX | `1تعليمات تربوية\بطاقة.docx` · `2استعدادات منهجية\بطاقة.docx` · `3تقييمات ذاتية\بطاقة.docx` |
| 2. تقويم التعلمات · الأساليب التقويمية | `2القسم الديداكتيكي-المدرسي\3تقويم التعلمات\3الأساليب التقويمية\` | ✅ 163 DOCX | بنك كامل من التمارين والوضعيات الاختبارية والدعم والمعالجة لجميع المستويات (63 لـ TC، 50 لـ 1BAC، 50 لـ 2BAC عبر S1/S2 والشهور) |

### Section 3: القسم التكويني المهني (`takwini`) — 7 files
| Axis · Element | Disk Path (`الملف التراكمي\`) | Status | Built Files |
|---|---|---|---|
| 0. الممارسة المهنية · التوصيف والشبكات | `3القسم التكويني-المدرسي\1الممارسة المهنية\` | ✅ 2 files | `تحليل-الممارسة-المهنية-الصفية-المفهوم،-الأبعاد-ومعايير-التحليل_copie.pdf` (PDF) · `تقييم الأداء التواصلي\بطاقة.docx` (DOCX) |
| 1. التكوين المستمر · التوصيف والشبكات | `3القسم التكويني-المدرسي\2التكوين المستمر\` | ✅ 4 files | `التانوي _الفلسفة.pdf` · `الفلسفة.pdf` · `علوم التربية.pdf` (PDFs) · `تقييم المعارف التخصصية\بطاقة.docx` (DOCX) |
| 2. الصحة المهنية · الشبكات التشخيصية | `3القسم التكويني-المدرسي\3الصحة المهنية\` | ✅ 1 DOCX | `تقييم الاجهاد السيكو-فيزيولوجي\بطاقة.docx` (DOCX) |

### Folder → data.js TAXONOMY mapping (verified 2026-08-29)

| Disk folder | `TAXONOMY[s].id` | Section name | Axes in folder |
|---|---|---|---|
| `القسم التربوي-الإدراي\` | `tarbawi` | القسم التربوي الإداري | التشريع المدرسي · المسار المهني · دفتر النصوص |
| `2القسم الديداكتيكي-المدرسي\` | `didaktiki` | القسم الديداكتيكي | تخطيط التعلمات · تدبير التعلمات · تقويم التعلمات |
| `3القسم التكويني-المهني\` | `takwini` | القسم التكويني المهني | الممارسة المهنية · محاور التكوين · الصحة المهنية |

> Note: Disk folder names match the official ministerial structure for philosophy qualifying secondary education. When referencing fiches in data.js / DB seed, they map directly to the canonical taxonomy.

## Hard constraints (from spec.md + plan.md — non-negotiable)

- **Max 10 personal documents per teacher** (UI gate + DB trigger). The 11th insert
  raises `PERSONAL_LIMIT_REACHED`.
- **50 MB per file**, formats: PDF, DOC(X), XLS(X), PPT(X), JPG/PNG, MP4.
- **Every document exactly one element** (`element_id NOT NULL FK taxonomy_nodes`).
- **RLS on every table**, keyed on Clerk JWT `sub` (`= public.requesting_user_id()`).
- **Platform fiches are immutable to all clients** (no edit/delete controls in UI;
  RLS denies anyway).
- **No build step, no framework, no state library** (Constitution VI). Vanilla
  ES modules only. Only runtime deps: `@clerk/clerk-js` + `@supabase/supabase-js` v2
  via CDN. IBM Plex Sans Arabic via Google Fonts CDN.
- **Publishable keys only in browser** (Clerk `pk_…`, Supabase anon).
  `SERVICE_ROLE_KEY` is read by `scripts/seed-platform.mjs` from env, never committed.
- **Arabic-first RTL throughout** (`<html lang="ar" dir="rtl">`), WCAG 2.1 AA.
- **Latin filenames/emails render LTR inline** without breaking RTL.

## Tech stack snapshot

| Layer | Choice | Where |
|---|---|---|
| Hosting | Netlify or Vercel (static) | TBD on deploy |
| Auth | Clerk (clerk-js CDN) | `js/auth.js` (only file importing Clerk) |
| Data + Files | Supabase Postgres + Storage | `js/supabase.js` (single client) |
| DB layer | `js/api/*` (only files importing supabase.js) | `auth.js`, `documents.js`, `taxonomy.js` |
| Pure logic | `js/domain/*` (unit-test targets, no network) | `completeness.js`, `format.js`, `validation.js` |
| UI renderers | `js/ui/*` (pure DOM functions) | `tree.js`, `documentList.js`, `upload.js`, `toast.js` |
| Page controllers | `js/features/*` (wires api+domain+ui) | `authPage.js`, `dashboard.js`, `library.js`, `settings.js` |
| Migrations | `supabase/migrations/` | `0001_init.sql`, `0002_seed_taxonomy.sql`, `0003_storage.sql`, `0004_pending_slots.sql` |
| Operator scripts | `scripts/` (Node 20+ + `fetch`; service-role only) | `seed-platform.mjs`, `seed-queue.mjs`, `manifests/platform-fiches.json` |
| Unit tests | `node --test` + happy-dom over `js/domain/*` | `tests/unit/` |
| E2E | Playwright smoke + RLS isolation matrix | `tests/e2e/` |

## Layering rule (strict)

```
features → ui/domain → api → supabase.js
                        ↘ auth.js
       main.js / auth.js → Clerk (only place Clerk is imported)
```

`api/*` is the only layer that may import `supabase.js`. `main.js`/`auth.js` are the
only files that import Clerk. This keeps `js/domain/*` free of network mocks and
makes `test-guard` unit scope reliable.

## Known gotchas

- The prototype in `index.html` + `js/app.js` predates the spec; the plan is to
  evolve it in place, not relocate. When the new layered structure lands, `app.js`
  becomes the orchestration glue and most logic moves to `features/*` + `ui/*`.
- The data.js `slotKey`/`sectionTotals` helpers are prototype-only; the production
  completeness computation lives in `js/domain/completeness.js` and uses
  `taxonomy_counts()` RPC (personal docs only, per the data model).
- The 10-file cap is a UI gate **AND** a BEFORE INSERT trigger — never weaken
  the trigger. It is the backstop that cannot be bypassed via crafted requests.
- Subscription codes are consumed atomically with profile creation in the
  `consume_signup_code` Edge Function / RPC, not by a client-side update.
- Operator scripts (`scripts/seed-platform.mjs`, `scripts/seed-queue.mjs`) read
  `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from env only. They use Node's
  built-in `fetch` against Supabase REST + Storage — no new npm deps, no build
  step. The `scripts/manifests/platform-fiches.json` manifest maps each of the
  8 actual fiches in the standalone tarbawi folder to its target
  `element_id` in the production taxonomy. Re-running either script is safe
  and idempotent. See `scripts/README.md` for the runbook.
- The `pending_slots` table (migration 0004) is the operator-managed
  empty-slot queue. RLS is SELECT-only for authenticated users; no write
  policy exists for the `authenticated` role, so mutations require the
  service-role key. Reason values: `no_platform` (no platform fiche yet),
  `no_personal` (no personal doc for the given teacher), `no_either` (both
  empty). Status values: `pending` (default), `in_progress`, `done`,
  `skipped` — managed out-of-band via SQL editor or a future UI.
- **Spec drift to be aware of (2026-08-29)**: `js/data.js` (prototype) has
  **3 elements** under `tarbawi.tashrii` (المراسيم / المذكرات / الأخلاقيات)
  while `0002_seed_taxonomy.sql` (production) has **2** (`lawا` + `mudhakkirat`).
  The الأخلاقيات PDFs are mapped to `mudhakkirat` as the closest available
  slot in the platform manifest. If you want true 3-element fidelity, ship a
  `0005_taxonomy_refine.sql` migration that splits `mudhakkirat` into
  `mudhakkirat` + `akhlaqiyat` and update the manifest.

## When the user says … (intent hints)

| They say | They mean |
|---|---|
| "أضف بطاقة" / "fiche" | a new `taxonomy_nodes` row (element-level) or a new platform document under an existing element |
| "ارفع الوثيقة إلى …" | upload to a specific `element_id` (use the context-resolved destination) |
| "حدّث الشجرة" | re-seed `taxonomy_nodes` from `js/data.js`; the data.js file IS the canonical hierarchy |
| "فعّل v2/v3/v4" | see `FEASIBILITY-ROADMAP.md` for scope — do not skip v1 checks first |
| "افتح الملف التراكمي" | open `C:\Users\Pc\Downloads\الملف التراكمي\` in the user's view; do not modify contents |

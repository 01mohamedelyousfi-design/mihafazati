# Feature Specification: Mihafazati — Personal Professional-Cumulative Portfolio Archive

**Feature Branch**: `001-document-archive`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "We will have a big amount of papers (pdf, docs, excel). We will use Supabase for auth." Built on PRODUCT.md (Moroccan philosophy-teacher portfolio archive, Arabic-first RTL).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Signup & First Entry (Priority: P1)

A philosophy teacher opens the app, registers with personal email + password
(via Clerk), selects her cycle (السلك) and subject (المادة), enters a
subscription code (رمز الاشتراك), accepts the data-responsibility agreement,
and lands on her empty dashboard. Returning users log in with email/password
and resume exactly where their archive stands. Sessions survive page reloads;
logout clears access.

**Why this priority**: Nothing else works without authenticated, gated accounts;
the Clerk identity (JWT `sub`) is the security boundary for every document.

**Independent Test**: Can be fully tested by registering with a valid code,
reloading mid-session, logging out, and attempting to open the app while logged
out — delivers confidence that archives are private.

**Acceptance Scenarios**:

1. **Given** an unregistered visitor with a valid subscription code, **When**
   she completes the signup flow (Clerk email+password, cycle, subject, code,
   agreement checkbox), **Then** a Clerk account exists, a profile row keyed by
   her Clerk id stores cycle/subject/agreement timestamp, and she reaches the
   dashboard.
2. **Given** a visitor with an invalid or exhausted subscription code, **When**
   she submits signup, **Then** no usable account state is created and a clear
   Arabic error explains the code problem.
3. **Given** a logged-in teacher, **When** she reloads the page or returns the
   next day, **Then** she stays logged in without re-entering credentials.
4. **Given** a logged-out visitor navigating directly to `/library`, **When**
   the page loads, **Then** she is redirected to the login screen.

---

### User Story 2 - File Any Document in Under a Minute (Priority: P1)

From any position in the app, the teacher uploads a PDF, Word, Excel,
PowerPoint, image, or video file. The destination inside the ministry taxonomy
(قسم → محور → عنصر) is resolved automatically from context (e.g., uploading
from داخل عنصر "تخطيط التعلمات" pre-selects it). She confirms, sees progress,
and the document appears filed with format badge, size, and date. Large volumes
are normal: hundreds of files per element, thousands per portfolio.

**Why this priority**: Filing speed is the product's core promise; without it
the archive never gets populated.

**Independent Test**: Can be fully tested by opening the upload flow from three
different contexts and confirming each file lands under the correct taxonomy
element with visible metadata.

**Acceptance Scenarios**:

1. **Given** a teacher viewing عنصر "التشريع المدرسي", **When** she clicks
   upload and selects a 30 MB PDF named `مذكرة_تنظيمية.pdf`, **Then** the
   destination is pre-filled with that element, the upload completes with
   progress feedback, and the document row appears with PDF badge.
2. **Given** a teacher starting upload from the global dashboard, **When** the
   picker opens, **Then** she can search/select the target element inline
   without navigating away.
3. **Given** an interrupted network during upload, **When** the connection
   fails, **Then** the teacher sees a retry affordance and no orphaned or
   half-visible document row is created.
4. **Given** an element containing a platform fiche, **When** the teacher opens
   it, **Then** preview/download works but no edit or delete controls are
   offered, and the row carries the 'منصة' badge.

---

### User Story 3 - Find Any Document in Seconds (Priority: P2)

The teacher navigates the three-section tree (always visible in the sidebar),
filters within an element by format or date, or searches across her whole
archive by title/tag. Results arrive instantly enough to feel immediate during
an inspection visit.

**Why this priority**: Retrieval under pressure (inspector waiting) is the
second core promise; it depends on filing (US2) but is independently valuable.

**Independent Test**: Can be fully tested by seeding 500+ documents and timing
tree navigation, filter application, and search-to-result.

**Acceptance Scenarios**:

1. **Given** an archive of 800 documents, **When** the teacher searches
   "امتحان", **Then** matching titles appear within 2 seconds with their
   taxonomy location shown.
2. **Given** a teacher inside محور "تدبير التعلمات", **When** she filters by
   format XLS, **Then** only spreadsheet documents under its عناصر are listed,
   with counts consistent with the sidebar numerals.
3. **Given** an empty element, **When** opened, **Then** an instructive empty
   state shows what belongs there and the action that fills it.

---

### User Story 4 - Inspection-Ready Completeness Ledger (Priority: P2)

At any moment the teacher can see, per section/mahwar/element, what exists,
what is missing, and how many documents are filed — before the inspector asks.
The dashboard leads with this ledger plus recent activity.

**Why this priority**: Prevents the worst outcome (caught incomplete during
evaluation) and drives daily engagement.

**Independent Test**: Can be fully tested by filing/removing documents and
verifying completeness counts update everywhere consistently.

**Acceptance Scenarios**:

1. **Given** عناصر with 0, 2, and 5 documents respectively, **When** the
   teacher opens the completeness view, **Then** each shows its state (missing /
   partial / filled) using the design's warning/success colors.
2. **Given** the teacher deletes a document, **When** she reopens the ledger,
   **Then** counts reflect the deletion with no stale numbers.

---

### User Story 5 - Account & Data Settings (Priority: P3)

The teacher manages notifications preferences, reviews privacy/data-responsibility
terms, sees her storage usage, and can delete individual documents or export her
portfolio structure. Deleting her account removes her documents.

**Why this priority**: Trust and data-responsibility are brand pillars but not
needed for the first usable release.

**Independent Test**: Can be fully tested by adjusting settings, verifying
persistence, and confirming usage figures match actual stored bytes.

**Acceptance Scenarios**:

1. **Given** a teacher in settings, **When** she toggles notification
   preference, **Then** the choice persists across sessions.
2. **Given** a teacher reviewing privacy, **When** she opens the data
   responsibility agreement, **Then** she reads the same text accepted at
   signup with acceptance date shown.

---

### Edge Cases

- What happens when a teacher who already holds 10 personal documents tries to
  upload an 11th? Upload is blocked before file selection with the remaining
  quota shown, and the database rejects any bypass attempt.
- What happens when a crafted request tries to edit/delete a platform fiche?
  RLS denies the operation silently; the UI never exposes such controls.
- What happens when a teacher uploads the same file twice? System MUST warn on
  exact duplicates (same name + size within the same element) and require
  confirmation rather than silently creating copies.
- What happens when a file exceeds the size cap (50 MB)? Clear Arabic error
  before upload starts; nothing partial is stored.
- What happens when storage quota is reached? Upload blocked with usage
  breakdown and cleanup guidance.
- What happens when the session expires mid-upload? Clerk refreshes tokens
  transparently and the Supabase client picks up fresh JWTs per request; if
  re-auth is truly required, work-in-progress state is preserved and the user
  signs in again without losing form context.
- What happens with Latin filenames/emails inside Arabic UI? They render LTR
  inline without breaking RTL layout.
- What happens when a teacher has zero documents on first login? Guided empty
  states orient her toward the taxonomy, never blank screens.
- What happens when two devices modify the archive concurrently? Last-write-wins
  per document row; lists refetch on focus so stale views self-heal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via Clerk (email + password)
  including password recovery by email.
- **FR-002**: Signup MUST capture cycle (السلك), subject (المادة), and a
  subscription code, and MUST reject invalid/exhausted/expired codes before the
  profile becomes usable; the code is consumed atomically with profile creation.
- **FR-003**: System MUST require explicit acceptance of the data-responsibility
  agreement before first use and record the acceptance timestamp.
- **FR-004**: System MUST enforce that every user's data (database rows and
  stored files) is isolated by Row Level Security keyed on the Clerk JWT `sub`
  claim such that no user can read or write another user's data even by
  crafting requests.
- **FR-005**: System MUST present the ministry taxonomy (3 أقسام → محاور →
  عناصر, with الجذع المشترك / الأولى / الثانية levels where applicable) as the
  primary navigation, seeded from the official framework and identical for all
  users.
- **FR-006**: System MUST allow upload of PDF, DOC(X), XLS(X), PPT(X), JPG/PNG,
  MP4 files up to 50 MB each, with visible progress and error/retry handling.
  A teacher MAY hold at most **10 personal documents** at any time; the system
  MUST refuse the 11th with a clear Arabic explanation (enforced in UI AND at
  database level).
- **FR-007**: System MUST store each document against exactly one taxonomy
  element, recording original name, format, size, upload date, and optional
  title/notes/tags.
- **FR-008**: Upload flows MUST resolve destination from current context
  (pre-selection) and allow changing it inline without losing the picked file.
- **FR-009**: System MUST support listing documents per element with
  pagination/virtualization sufficient for 1000+ items in one element without
  UI freeze.
- **FR-010**: System MUST provide whole-archive search over titles and tags
  returning results within 2 seconds at 1000+ documents, showing each result's
  taxonomy location.
- **FR-011**: System MUST expose completeness states (missing/partial/filled)
  per axis and element, recomputed live after every mutation.
- **FR-012**: System MUST provide a dashboard combining the completeness ledger
  and recent activity.
- **FR-013**: System MUST provide preview/download/share for stored files and
  safe permanent delete with confirmation.
- **FR-014**: System MUST show storage usage in settings and block uploads past
  quota.
- **FR-015**: All interfaces MUST be Arabic-first RTL (`lang="ar"`,
  `dir="rtl"`), WCAG 2.1 AA compliant, keyboard-navigable with visible focus,
  and honor `prefers-reduced-motion`.
- **FR-016**: System MUST work on current Chrome/Edge/Firefox/Safari desktop
  and mobile browsers at 360px width minimum.
- **FR-017**: System MUST publish operator-uploaded reference fiches (فيشات
  المنصة) inside their taxonomy elements, visible to every subscribed teacher
  alongside personal files and marked with a distinct 'منصة' badge. Platform
  fiches are uploaded by the operator only, never by teachers.
- **FR-018**: Teachers MUST NOT be able to modify or delete platform fiches
  through any client action; all mutating operations MUST be restricted to the
  teacher's own personal documents at the database (RLS) level.
- **FR-019**: The completeness ledger (FR-011) MUST count only the teacher's
  personal documents; platform fiches never affect missing/filled states or
  sidebar counts of personal progress.

### Key Entities *(include if feature involves data)*

- **User Profile**: One per account, keyed by the Clerk user id (`sub` claim);
  full name, cycle, subject, agreement acceptance timestamp, notification
  preferences.
- **Subscription Code**: Issued access codes with usage limits and expiry;
  consumed once per successful signup.
- **Taxonomy Node**: Section/axis/element entries forming the fixed ministry
  hierarchy; labels in Arabic; level applicability; immutable except by official
  framework updates.
- **Document**: A stored file filed under exactly one element. Has a scope:
  **platform** (published by the operator, no owner, read-only to everyone) or
  **personal** (owned by one teacher, max 10 per teacher). Records name, format,
  size, storage path, optional title/notes/tags, timestamps.
- **Activity Event**: Recent-action record (upload/delete/update) powering the
  dashboard feed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new teacher completes signup-to-dashboard in under 3 minutes
  including agreement reading.
- **SC-002**: A practiced teacher files any document in under 60 seconds from
  any screen (measured in usability checks).
- **SC-003**: Any of 1000+ archived documents is retrievable within 2 seconds
  via search or within 5 seconds via tree navigation.
- **SC-004**: Zero cross-user data leaks in security review of RLS policies
  (automated policy tests pass).
- **SC-005**: An inspector-facing completeness review of the full portfolio
  completes without the teacher needing pen-and-paper notes.
- **SC-006**: Lighthouse accessibility score ≥ 95 on main screens; no WCAG AA
  contrast violations.

## Assumptions

- Teachers have intermittent but functional internet (school Wi-Fi/mobile
  data); offline-first is NOT in scope for v1.
- Subscription codes are issued out-of-band (by the operator) and entered
  manually; payment integration is out of scope.
- Platform fiches are uploaded by the operator out-of-band via a service-role
  maintenance script; there is no teacher-facing moderation or upload of
  platform content.
- Document content extraction/OCR is explicitly out of scope (store &
  organize only) until amended.
- The ministry taxonomy structure is stable for the launch year; updates ship
  as data migrations.
- Clerk issues JWTs to Supabase via a dedicated JWT template (third-party auth
  integration); `sub` claim = Clerk user id and is stable forever.
- One Supabase project serves all users; per-teacher volume is bounded by the
  10-personal-file × 50 MB cap; platform fiche corpus is operator-managed.
- Existing prototype (`index.html`, `css/styles.css`, `js/app.js`,
  `js/data.js`) provides visual language and seed taxonomy to be refactored
  into the production structure.

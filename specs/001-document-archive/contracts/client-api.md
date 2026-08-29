# Client API Contracts: internal JS module surface

The app's external APIs are **Clerk** (auth) and **Supabase** (PostgREST +
Storage), fully specified by `db-schema.sql`, `seed-taxonomy.sql`, and
`storage-policies.sql`. This file fixes the INTERNAL contract between layers so
`features → ui/domain → api → auth.js/supabase.js` stays one-directional
(plan: Project Structure). All functions return Promises; all thrown errors are
normalized to `{ code, messageAr }` where `messageAr` is user-facing Arabic.

## js/auth.js (the ONLY Clerk-aware module)

```ts
loadClerk(): Promise<void>              // window.Clerk.load({ publishableKey })
getClerk(): Clerk | null
onSession(cb: (session | null) => void): unsubscribe()
getToken(template = 'supabase'): Promise<string | null>   // JWT for RLS
userId(): string | null                 // session.user.id ('sub' claim)
signUp({ email, password }): Promise<void>   // Clerk flow; then activate() below
signIn(email, password): Promise<void>
signOut(): Promise<void>
openResetPassword(): void               // Clerk account portal / custom flow (FR-001)
```

## js/supabase.js

```ts
export const supabase: SupabaseClient
// createClient(url, anonKey, { accessToken: () => auth.getToken('supabase') })
// per-request JWTs via the hook — research R1b; no manual refresh anywhere
```

## js/api/auth.js

```ts
activate({ code, fullName, cycle }): Promise<Profile>
// → RPC consume_signup_code; throws {code:'CODE_INVALID'|'ALREADY_ACTIVATED', messageAr}
checkCode(code): Promise<boolean>       // → RPC check_code (pre-check UX only)
isActivated(): Promise<boolean>         // profile row exists for current Clerk id
getProfile(): Promise<Profile>
updateProfile(patch): Promise<Profile>
```

## js/api/taxonomy.js

```ts
getTree(): Promise<Node[]>              // cached; Node = {id,parent_id,kind,label_ar,levels,children}
getNode(id): Promise<Node | null>
getCounts(): Promise<Map<nodeId,count>> // RPC taxonomy_counts(), cached 60s, invalidated on mutations
```

## js/api/documents.js

```ts
listByElement(elementId, { page, pageSize=50 }): Promise<{rows: Document[], total: number}>
// rows include scope:'platform'|'personal'; platform rows render badged, no edit/delete
search(q): Promise<SearchRow[]>          // RPC search_documents(); includes platform rows (scope field)
personalCount(): Promise<number>         // count of own personal docs; drives the 10-file gate
upload({ file, elementId, onProgress, signal }): Promise<Document>
// XHR PUT per research R2; inserts DB row only after storage success.
// Throws {code:'PERSONAL_LIMIT_REACHED'} when personalCount() >= 10 (FR-006).
remove(doc): Promise<void>               // personal docs only; RLS denies platform rows
update(docId, patch): Promise<Document>  // title/notes/tags/move element; personal only
createSignedUrl(storagePath, expiresInSec=300): string   // preview/download/share
getUsageBytes(): Promise<number>         // RPC storage_usage() (personal bytes)
findDuplicate(file, elementId): Promise<Document | null> // name+size rule
```

## js/domain/completeness.js (pure)

```ts
stateForCount(count): 'missing' | 'filled'
ledger(tree, counts): LedgerNode[]       // rolls counts up axis→section
```

## js/domain/format.js (pure)

```ts
badgeFor(mimeOrName): 'PDF'|'DOC'|'XLS'|'PPT'|'IMG'|'MP4'|'?'
formatSize(bytes): string                // Arabic units ك.ب / م.ب
formatDate(iso): string                  // Arabic-Indic numerals convention
sanitizeFileName(name): string           // keeps Arabic, strips path/hostile chars
extToFormat(name): 'pdf'|'doc'|...|'other'
```

## js/domain/validation.js (pure)

```ts
validateSignup(form): Map<field, messageAr>
validateFile(file): { ok: boolean } & ({ format } | { errorAr })  // type+size allow-list (FR-006)
validateUploadQuota(personalCount): { ok } | { errorAr }          // 10-file gate message
isDuplicateCandidate(a, b): boolean      // same original_name && size_bytes
```

## Database RPCs (replacing the former Edge Function)

```sql
check_code(p_code text) returns boolean
-- anon-callable pre-check; UX only, never authoritative

consume_signup_code(p_code text, p_full_name text, p_cycle text) returns void
-- authenticated via Clerk JWT; atomic: validate → used_count++ → insert profile
-- error codes: NOT_AUTHENTICATED | ALREADY_ACTIVATED | CODE_INVALID (exhausted/expired/unknown)
```

Signup order (US1): `checkCode` for instant feedback → Clerk `signUp` →
`activate()` → dashboard. If `activate` fails after Clerk signup succeeded, the
user holds a Clerk account with no profile — every RLS query returns nothing and
the UI routes to the activation screen until a valid code is consumed.

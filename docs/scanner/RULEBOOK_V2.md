# V2 Production Readiness Scanner Rulebook

Single source of truth for rule IDs, severity, and remediation. The scanner MUST reference these rule IDs in every finding.

## Schema

- **ruleId:** e.g. `AUTH-1`, `UI-1`
- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **Confidence:** LOW | MEDIUM | HIGH (optional; infer from detection method)
- **Output per finding:** ruleId, severity, category, message, filePath, line (if available), fix, optional evidence

---

## 1. Authentication (AUTH)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| AUTH-1 | Mutation (write/update/delete) without auth check in same handler | AST: handler body has Supabase write or fetch POST/PUT/DELETE but no getSession/getUser/auth check | CRITICAL | Unauthenticated writes |
| AUTH-2 | Missing tenant isolation (org_id/account_id/tenant_id/user_id in filter) | AST: mutation or select on tenant-scoped table without .eq(tenantColumn, ...) | HIGH | Data leakage across tenants |
| AUTH-3 | Client-side code performing privileged writes | AST: insert/update/delete in "use client" file or client boundary | CRITICAL | Client can be tampered |
| AUTH-4 | Service role used in user-facing flow | AST: createClient(service_role) in route handler or code path used by non-admin | CRITICAL | Bypasses RLS |

---

## 2. Secrets & env (SEC)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| SEC-1 | Service role key in client bundle or NEXT_PUBLIC_*SUPABASE_SERVICE | Grep / AST: NEXT_PUBLIC.*service|SUPABASE_SERVICE in client file or env | CRITICAL | Key exposure |
| SEC-2 | NEXT_PUBLIC_* containing SECRET/TOKEN/KEY | Grep: NEXT_PUBLIC_.*SECRET|TOKEN|KEY | HIGH | Accidental exposure |
| SEC-3 | Required env vars not validated at startup | Compare process.env usage to .env.example; flag if no validation layer | MEDIUM | Runtime failures |

---

## 3. RLS & database (DB)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| DB-1 | Table without RLS enabled | Migration parse: table has no ENABLE ROW LEVEL SECURITY | CRITICAL | Full table access |
| DB-2 | RLS enabled but no policies | Migration parse: RLS on but no CREATE POLICY for table | HIGH | Denies all or misconfiguration |
| DB-3 | Policy missing tenant column | Migration parse: policy does not reference tenant column | HIGH | Cross-tenant access |
| DB-4 | Unsafe migration (DROP TABLE/COLUMN, ALTER TYPE, TRUNCATE without backup) | Migration parse: destructive DDL | HIGH | Data loss risk |
| DB-5 | Mutation without idempotency/unique constraint | Heuristic: insert/upsert without unique key or idempotency key | MEDIUM | Duplicate data |

---

## 4. API & endpoints (API)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| API-1 | Webhook without signature verification | Grep/AST: webhook handler without verify signature call | CRITICAL | Forged webhooks |
| API-2 | Webhook without idempotency | AST: webhook handler without idempotency key check | HIGH | Duplicate processing |
| API-3 | Sensitive endpoint without rate limiting | Heuristic: auth/login/payment endpoint, no rate limit | HIGH | DoS / brute force |
| API-4 | Mutation endpoint without input validation | AST: POST/PUT/PATCH handler without zod/validation | HIGH | Invalid data |

---

## 5. Storage & uploads (FILE)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| FILE-1 | Upload without server-side validation | AST: upload path without type/size check on server | HIGH | Malicious uploads |
| FILE-2 | getPublicUrl on private/sensitive data | AST: storage.getPublicUrl or public URL for private bucket | HIGH | Data exposure |

---

## 6. XSS & injection (INJ)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| INJ-1 | dangerouslySetInnerHTML with unsanitized input | AST: dangerouslySetInnerHTML without DOMPurify/sanitize | HIGH | XSS |
| INJ-2 | CSV export with unsanitized cell content | AST: CSV cell = user content without escape | MEDIUM | CSV injection |
| INJ-3 | RPC with raw SQL or string interpolation | AST: .rpc with template literal or concatenation | HIGH | SQL injection |

---

## 7. Logging & privacy (LOG)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| LOG-1 | Sensitive data in logs | Grep: log(.*password|token|email|pii) | HIGH | PII leakage |
| LOG-2 | Mutation API without error logging | AST: mutation handler without try/catch log | MEDIUM | Blind failures |

---

## 8. Performance (PERF)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| PERF-1 | List query without pagination | AST: .select() without .range()/.limit() in list path | HIGH | Large result sets |
| PERF-2 | SELECT * on list/table query | AST: .select('*') or .select() on list | MEDIUM | Over-fetching |
| PERF-3 | N+1 query pattern | AST: loop with query inside | HIGH | Latency |
| PERF-4 | Waterfall requests | AST: sequential awaits in loader | MEDIUM | Latency |
| PERF-5 | Duplicate identical queries | Graph: same query shape in same route | MEDIUM | Redundant work |
| PERF-6 | Query without index hint for known large table | Heuristic: table known large, no index in migration | LOW | Slow queries |

---

## 9. Next.js specific (NEXT)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| NEXT-1 | Server-only package imported in client | AST: 'server-only' or server package in "use client" | HIGH | Build/runtime error |
| NEXT-2 | User-specific data in cache with public scope | AST: fetch/cache with user data and no revalidate | HIGH | Cache poisoning |
| NEXT-3 | Large client bundle (heuristic) | Build analysis | LOW-MEDIUM | Slow FCP |

---

## 10. Dependencies (DEP)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| DEP-1 | npm audit critical/high | Subprocess: npm audit --json | HIGH | Known vulnerabilities |
| DEP-2 | Missing lockfile | Filesystem: no package-lock.json | MEDIUM | Non-reproducible installs |

---

## 11. Observability (OBS)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| OBS-1 | Errors swallowed (empty catch) | AST: catch {} or catch { return } | HIGH | Silent failures |
| OBS-2 | No error tracking (Sentry etc.) | Heuristic: no Sentry/error boundary in app | MEDIUM | Blind production errors |
| OBS-3 | No request correlation ID | Heuristic: no x-request-id or trace id | LOW | Hard to trace |

---

## 12. Data export (EXP)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| EXP-1 | Export without role check | AST: export/download endpoint without auth | HIGH | Data leak |
| EXP-2 | Large export without streaming | AST: full load then send | MEDIUM | Memory / timeouts |

---

## 13. Abuse & rate limiting (DOS)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| DOS-1 | Public endpoint without rate limiting | Heuristic: public API route, no rate limit | MEDIUM-HIGH | DoS |

---

## 14. Cookie & CSRF (CSRF)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| CSRF-1 | Cookie without HttpOnly/Secure/SameSite | AST: set-cookie or cookie config | HIGH | Theft / CSRF |
| CSRF-2 | Mutation vulnerable to CSRF | Heuristic: state-changing GET or no CSRF token | HIGH | Cross-site writes |

---

## 15. UI & flow integrity (UI)

| ID | What to detect | How | Severity | Why |
|----|----------------|-----|----------|-----|
| UI-1 | Unwired button (no handler or stub) | AST: button with empty/TODO handler | MEDIUM | Dead UI |
| UI-2 | Dead link (href to non-existent route) | Graph: Link href not in route list | MEDIUM | 404 |
| UI-3 | Orphan route (no incoming link or redirect) | Graph: route never referenced | LOW | Dead route |
| UI-4 | Endpoint never called | Graph: API route not in callsites | LOW | Dead code |
| UI-5 | Dashboard field not connected to data | Heuristic: placeholder or mock in dashboard | MEDIUM | Wrong data |
| UI-6 | Placeholder/mock in production path | Grep: TODO|FIXME|mock|placeholder in prod code | MEDIUM | Incomplete feature |

---

## Baseline / suppressions

Findings can be suppressed via `validation-baseline.json` (rule ID + file/line or gap ID). Suppressed findings are still reported but do not affect ship decision or score.

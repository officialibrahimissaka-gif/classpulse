# Project continuation validation

2 November 2026. Baseline `570e2fc6598d350157a27b2d839a33e7c0582d8c`. Current program milestone **M8: R1 release acceptance remains OPEN / NO-GO**. Slice **M8.1 / CONT-T001: snapshot consistency is locally complete**. No independent certification, cloud deployment, environment publication, live payment or outreach.

## Executed quality evidence

Complete `npm run check` exited 0: formatting, lint, strict types, **18 unit + 34 native PostgreSQL integration + 4 browser = 56 tests**, deterministic 40-operation OpenAPI validation, **nine** immutable migration checksums, fresh database replay/no drift/FORCE RLS, static security, zero-vulnerability production dependency audit and standalone production build. See final-gate.log. No check was skipped or marked expected failure. Prisma/pg connection-serialization and Playwright color warnings remain visible. Development lint dependency advisory remains open; clean production dependencies do not certify the full development tree.

The existing populated local database accepted the additive ninth migration. Prior migration files are unchanged. Summary is nullable for legacy snapshots; no backfill rewrites immutable history. Strict typing initially caught missing named drill-down schema properties and use of the independent XLSX reader's older API; both were corrected without weakening assertions. CI now installs Poppler for independent PDF text reconciliation. No new production load/latency or actual cloud/provider test was performed; historical Phase 6 benchmark numbers are not a performance certification for this change.

## Acceptance actually exercised

| Case | Scope and result |
|---|---|
| CONT-SNAP01 | Freeze 12 ordered projections/KPIs, cancel a source through real business logic, prove live result changes while frozen result stays identical; render and independently parse PDF/CSV/XLSX; same snapshot and original expiry, exact format/artifact, repeat worker delivery, one snapshot. PASS |
| CONT-SNAP02 | Another tenant and another member in the same tenant cannot view/re-export the snapshot. PASS |
| CONT-SNAP03 | Reassign ownership/tasks after a self-scoped recruiter freezes; grant fingerprint stays unchanged but current record predicates block snapshot and existing download. PASS |
| CONT-SNAP04 | Append-only guard rejects summary update; controlled application clock beyond expiry blocks snapshot view, new re-export and repeated queued-worker publication. No artificial maintenance privilege was granted. PASS |
| CONT-SNAP05 | Real reviewed retention operation erases a terminal candidate and invalidates snapshot, existing file and queued re-export; no artifact remains. PASS |
| CONT-SNAP06 | Real HTTP/browser owner freezes dashboard, source changes externally, all formats generate/download through the actual worker; frozen view persists until explicit live refresh; axe WCAG tags/mobile width pass. PASS |
| CONT-SNAP07 | Pre-migration/null-summary artifact remains downloadable under its original hash; cannot be silently reused/upgraded; ordinary data revision still invalidates its legacy download fence. PASS |

## Traceability

CONT-T001 → REQ-R002/R005 → US-R002/US-R005 → DES-R002/DES-R005 and CONT-D003–D005 → `src/domain/report-snapshots.ts`, `exports.ts`, snapshot/export routes, `report-export.tsx`/Overview, ninth migration/API contract → CONT-SNAP01–07 and final gate. These are local R1 cases, not a blanket pass of every full-vision TEST-R clause.

The frozen summary uses central metric values/drill-down membership captured once. Current access is separate from historical source values: new fingerprints retain tenant/member/grants/membership/entitlement revisions while excluding ordinary data revision; every snapshot read/generation/publication/download also checks current source placement scope, owner, expiry and hash. Legacy snapshots preserve the earlier stricter behavior. Existing privacy erasure and expiry cleanup apply to frozen-but-unexported snapshots as well. PDF/CSV/XLSX inherit the original deadline, not a new seven days on each rendering.

## Management records and remaining work

PROJECT_CHARTER.md, PRODUCT_ROADMAP.md, DECISION_LOG.md, ASSUMPTIONS_LOG.md and RISK_REGISTER.md were absent from the checkout and all available Git history. They were reconstructed from existing documents and current founder instruction, explicitly not labeled historical approvals. DEVELOPMENT_STATUS.md/CHANGELOG.md now link current evidence and retain previous results as historical.

P6-G01 is **locally remediated**. Whole REQ-R005 classification/watermark/manual accessible-report controls and other gaps remain partial. M8.2/CONT-T002 next: import record/batch/row/source-revision provenance, conflict disposition and history-preserving correction, with tenant/privacy/stale/duplicate/concurrency tests. P6-B01–B05/G02–G06, P7-B01–B03 and REQ-L002 retain their unresolved dispositions. Named external approvers/account/domain/test-provider bindings and customer evidence are still absent. No source upload or green local test authorizes production or live recurring collection.

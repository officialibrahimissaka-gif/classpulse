# Development status

Updated 2026-11-01 17:59 UTC.

**Local MVP milestone complete: R1 accepted-placement-to-start coordination. Production/commercial release remains gated.** Phase 5 authorizes implementation; earlier documents remain the approved design baseline. No environment publication or deployment was performed. Payroll is excluded.

## Delivered vertical slices

| Slice | Requirement / acceptance links | Database → logic/policy → API → UI | Automated evidence |
|---|---|---|---|
| M1 — foundation | REQ-P001–P004/P006/P009/P011/P012 and R1 REQ-E clauses; matching US/DES/TEST IDs in trace register | 56-model R1 closure, tracked SQL, forced tenant RLS/non-owner login; atomic setup/trial/roles, scoped sessions/CSRF, MFA gates, quotas, audit/outbox; sign-in/company setup | Unit and native workflow/administration tests; browser setup; fresh migration/security/build checks |
| M2 — agency workflow | REQ-F001/F002/F029; corresponding TEST-F cases | Source-key clients/candidates; checklist revisions/ownership/evidence, blockers/waivers, human readiness/start/cancel/reopen/reschedule; versioned commands and responsive source screens | Native lifecycle/idempotency/stale-write checks; full browser first-day journey |
| M3 — client coordination | REQ-F003; TEST-F003 and field-scope clauses | Verified-email invite acceptance, explicit fields/task allowlists, contact membership links, grant revocation and replacement; internal member invitations remain separate | SMTP delivery attempts, wrong identity, projection/assignment limits, renewal with reduced scope, revocation and internal-role tests |
| M4 — data entry and reminders | REQ-F040/F038; TEST-F040/F038 | Encrypted bounded CSV staging, row/column error codes, atomic preview/commit/source conflict checks; PostgreSQL outbox/jobs and idempotent BullMQ transport; fixed minimal daily digest | CSV validation/rollback, 101-row paid import, duplicate invitation attempts; real worker in browser flow |
| M5 — reporting | REQ-F039, REQ-K001–K004, REQ-R001–R006/R009/R010, agency-only D001/D004 | Central versioned KPI definitions and exact cohorts; filters/private/team views; immutable projections/metric bindings; PDF/CSV/XLSX; scoped authenticated downloads/expiry | Metric fixtures, actual formats/Unicode/formula safety, team view scoping, browser PDF generation/download, axe/mobile checks |
| M6 — modular/commercial operations | REQ-E001–E014 R1 clauses | Active/read-only dependency fences, retained reads/exports/reactivation; plan-change requests plus reviewed effective-dated operator orders; downgrades retain over-capacity data, cancellation preserves 30-day exit access | Native module denial/dependency checks and paid-order/downgrade/cancellation evidence |
| M7 — reviewed privacy and maintenance | REQ-P005 R1 implementation; release review still open | Verified-request/hold records and owner UI; separate narrowly scoped retention login; resumable erasure/derived-object manifest, tombstones, expiry cleanup with explicit tenant | Active-work/hold blocking, repeat erasure, runtime unable to assume maintenance role; independent operational/legal/backup review outstanding |

Every slice includes tracked schema changes where applicable, business/input validation, server policy, audit, HTTP/UI, automated checks and documentation. The final integrated gate passed after all slices: **8 unit + 12 PostgreSQL integration + 1 browser test**, formatting, lint, strict types, 37-operation API validation, seven fresh migrations/drift/RLS checks, zero-vulnerability production dependency audit, production build and separate bundled-worker smoke. [Evidence](docs/QUALITY_RESULTS.md).

## Traceability and review

[Implementation traceability](docs/IMPLEMENTATION_TRACEABILITY.md) enumerates all 151 canonical requirements, their story/design links, actual code/tests, and deferred/external disposition. It does not label every original TEST scenario as passed. [Decisions](docs/IMPLEMENTATION_DECISIONS.md) record bounded R1 deltas. Full-vision Prisma/OpenAPI and prior phase artifacts remain preserved; only the separate R1 contract is deployed by the application tooling.

## Open release gates

REQ-L002/L003/L005 remain open: founder/customer/payment evidence; independent security/privacy/legal approval; finalized terms; live cloud MFA/identity/storage/mail/IAM/residency binding; production performance/observability; encrypted backup/object restore and tombstone replay. Manual assistive-technology review, source-retention/subject-response completeness and key-rotation/operator-access operations also require review. The repository has Docker targets/CI, not a provisioned production deployment. See [known limitations](KNOWN_LIMITATIONS.md) and [operations runbook](docs/OPERATIONS_RUNBOOK.md).

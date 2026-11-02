# Development status

Updated 2026-11-02, ongoing project continuation.

**Current milestone M8: R1 release acceptance — OPEN / NO-GO.** R1 is locally usable; production/commercial acceptance remains gated. Phase 5 authorizes implementation; earlier documents remain the approved design baseline. No environment publication or deployment was performed. Payroll is excluded.

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

## Phase 6 independent-role audit

The same assistant performed an adversarial audit, not third-party certification. Ten finding areas were fixed and retested, including entity scope, participant authorization, commercial replay integrity, quota validation, export limits/CSV consistency, throttling, production configuration, error responses and ambiguous digest handling. The final complete gate passes **13 unit + 27 native PostgreSQL integration + 2 browser tests = 42**, plus format/lint/types/API/migration/RLS/dependency/build checks. The Phase 5 result above is historical.

[Full results and R1 requirement dispositions](TEST_RESULTS.md), [security findings](SECURITY_AUDIT.md), [compliance gaps](COMPLIANCE_GAP_ANALYSIS.md), [measured local performance](PERFORMANCE_TEST_RESULTS.md), [test plan](TEST_PLAN.md), and [release checklist](RELEASE_READINESS_CHECKLIST.md) distinguish local passes from partial/unverified clauses. Production identity/cloud/recovery/legal/operator-control gates remain open. Snapshot reuse, source provenance and manual accessibility acceptance remain incomplete. No publication or deployment occurred.

## Phase 7 launch preparation — 2 November 2026

**NO-GO remains.** Eight launch deliverables and counsel-review outlines now exist. Added AWS regional dark-stack/network infrastructure templates, a protected/evidence-gated deployment workflow, separate operations image target, public GHS pricing experiment and owner-only billing records. Founder selected Ghana Paystack/GHS; an isolated **test-only** hosted checkout/server verification adapter records tenant-scoped observations through a dedicated importer role. No payment changes entitlements, no live key is accepted and no cloud resource, domain, live collection or customer contact was activated.

The current full gate passes **18 unit + 28 PostgreSQL integration + 3 browser = 49 tests**, plus format/lint/types, 38-operation API validation, eight fresh migrations/no drift/FORCE RLS, production dependency audit and build. Both CloudFormation templates pass cfn-lint; default release preflight intentionally refuses NO_GO. [Evidence and P7 requirement dispositions](docs/quality/phase7/RESULTS.md). [Launch plan](LAUNCH_PLAN.md) covers the first-ten experiment and unresolved provider/invoice/settlement/cloud/legal/customer gates. Existing Phase 5/6 counts above remain historical.

## Ongoing management: CONT-T001 / M8.1

The five requested management files missing from tree/history are now reconstructed with provenance: PROJECT_CHARTER.md, PRODUCT_ROADMAP.md, DECISION_LOG.md, ASSUMPTIONS_LOG.md and RISK_REGISTER.md. Existing design/implementation/market records remain authoritative and preserved; no customer evidence or signoff was invented.

Highest-priority independent task: P6-G01 / REQ-R002/R005 reusable frozen reports. Implemented an immutable summary/projection snapshot, explicit frozen Overview/live refresh, multi-format re-export, exact artifact status, expiry/no-extension and current owner/tenant/record/privacy checks, plus legacy compatibility. Ninth migration is additive; no prior migration/schema history was rewritten. Final evidence/status is in docs/quality/continuation-2026-11-02/RESULTS.md.

Next internal slice: CONT-T002 / M8.2 import source provenance, conflict disposition and history-preserving correction. Independently, actual identity/cloud/restore/legal/operational-audit/customer/live-billing gates remain blocked/open. This continuation does not authorize or perform deployment, environment publication, main merge, live payment or outreach.

Final continuation gate: **56 tests passed (18 unit + 34 native integration + 4 browser)**, format/lint/types, 40-operation API, nine fresh migrations/no drift/FORCE RLS, production dependency audit and build. **M8.1 locally complete; M8 overall remains OPEN/NO-GO.** Current evidence: [continuation results](docs/quality/continuation-2026-11-02/RESULTS.md).

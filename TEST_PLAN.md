# Phase 6 test plan

Audit baseline: commit `1c22cb0`, branch `codex/classpulse-mvp-review`, 1 November 2026. This is a fresh audit pass by the same assistant that implemented the system, not an external third-party certification. Release recommendation will remain separate from test-suite success.

## Scope and authority

Use `MVP_SCOPE.md` and its referenced R1 requirement/acceptance clauses: P001–P012, E001–E014, F001–F003/F029/F038–F040, K001–K004, R001–R006/R009–R010, agency D001/D004 and L001–L006. The broader HR/HCM/payroll vision is not deployed. Do not treat missing payroll/webhook endpoints as tested calculation/signature engines. Do not deploy or change main during the audit. Publish audit artifacts and justified fixes to the existing review branch.

Only synthetic local tenants, native PostgreSQL/Redis, private local files and SMTP Mailpit may be exercised. No customer scanning, actual mail recipients, paid provider operation or production load. Live Cognito/SES/S3/IAM/legal/residency/backup evidence is unavailable and must be recorded as blocked, not passed.

## Method and evidence

1. Record environment, source baseline and existing suite results.
2. Read the approved R1 requirements and actual use-case/route/worker/maintenance implementations. Map every R1 requirement to specific evidence, partial coverage or a release blocker.
3. Add targeted negative and race tests; capture failing secure expectations before fixing reproducible defects. Distinguish scope-defect repros from test-setup faults.
4. Fix authorized local code defects, preserve immutable migrations, retest each finding and run the entire final gate.
5. Benchmark the actual application service against the approved local workload with raw timings/counts/failures. Do not extrapolate availability or cloud RPO/RTO from a local test.
6. Record finding ID, severity, evidence, remediation owner/action, retest and release disposition in the audit documents.

Severity: Critical = tenant escape, unrestricted sensitive access, irreversible corruption/financial miscalculation; High = reproducible scoped authorization/privilege bypass or missing essential production control; Medium = bounded integrity/availability/contract failure; Low = limited usability/documentation issue. A critical/high security, integrity or financial issue blocks release until resolved and evidenced. Missing production control evidence also blocks launch even if code regressions pass.

## Case inventory

| Case family | Coverage and secure expectation |
|---|---|
| P6-BASE | Formatting/lint/strict types/unit/native integration/browser/API drift/fresh migration/RLS/dependency/static-security/production build; retain logs and exact exit status |
| P6-ISO | Two valid populated tenants: list/detail/mutate/invite/import/export IDs swapped; non-owner raw SQL context-free reads and composite FK writes remain denied; no existence/value leakage |
| P6-SCOPE | Tenant/entity/client/self scopes: restricted actor cannot create outside an entity, inspect/revoke another placement’s participant grants, reassign another owner’s task, or promote to owner; admin actions require tenant scope and fresh MFA |
| P6-INV | Wrong identity, expired/revoked invite, expired participant, renewal narrows sharing, unassigned task completion and readiness/start from client rejected; no bearer secrets in projected data/jobs |
| P6-SUB | Required modules, confirmed dependency cascade, core cannot be disabled, retained reads/new exports while read-only, reactivation preserves IDs, trial/exit/cancellation boundaries, queued work reauthorization and quota race at last slot |
| P6-WF | Required tasks/waiver/exception resolution gate readiness; actual start requires separate human review; stale/missing version and future/invalid date rejection; reschedule/reopen retain original/transition history |
| P6-MET | Independently hand-computed cohorts: date boundaries, early/on-time/delayed starts, canceled/unresolved, odd/even median, zero denominator; match drill-down IDs and immutable metric bindings |
| P6-EXP | Actual PDF/CSV/XLSX bytes/rows, Unicode/formula-as-text, documented 5,000-row export cap, current owner/scope/expiry/erasure/content hash checks; no direct public object URLs |
| P6-AUTH | Tampered/expired/revoked/idle sessions, Origin/CSRF, development identity prohibited in production, incomplete production configuration fails closed, privileged read/auth telemetry; real provider challenge assurance remains blocked |
| P6-RATE | Redis fixed-window enforcement and changing spoofed forwarding headers cannot reset the limiter unless an explicit trusted-ingress contract is enabled; Redis failure is not fail-open |
| P6-INJ | SQL strings are data in parameterized operations; unknown/forbidden fields rejected; source keys remain tenant-bound; CSV injection/control bounds; no HTML rendering or script-capable spreadsheet cell types |
| P6-COM | Non-monetary commercial orders: same request retry is idempotent; changed payload/reused order references rejected; future/past ordering checked; downgrade retains records and cancellation retains exit access. Negative/zero/noninteger usage allocations rejected |
| P6-AUD | Mutations/export/download/privileged reads and authentication events have redacted evidence; runtime audit updates/deletes denied; external WORM/archive and alerting remain deployment gates |
| P6-UX | Existing complete browser journey plus tablet/mobile widths, keyboard focus and axe WCAG 2.2 AA tags on relevant screens; manual screen-reader and accessible PDF certification not implied |
| P6-PERF | Approved P008: 20 concurrent users, 10,000 placements, 100-row pages, 5,000-row exports; report p50/p95/max and errors for application reads/writes, imports/exports; server service timing separated from browser/network; no monthly-availability inference |
| P6-OPS | Review worker ambiguous outcomes/recovery, durable jobs, retention/holds/erasure/tombstones and secret isolation; managed restore/load/provider delivery/legal approvals need separate evidence |

## Financial and regulatory boundary

There is no payroll, payslip, tax, wage, payment, monetary rounding or financial calculation engine in R1. Those cases are N/A and the feature remains unavailable; this is not a financial certification. Subscription capacity and accepted-order state are in scope and require duplicate/effective-date/reversal-by-new-order testing. UAE country/authority fields are attestations; no unverified legal rule may be introduced to make a compliance check pass.

## Deliverables and exit

Produce TEST_RESULTS.md, SECURITY_AUDIT.md, COMPLIANCE_GAP_ANALYSIS.md, PERFORMANCE_TEST_RESULTS.md and RELEASE_READINESS_CHECKLIST.md alongside this plan. Retain machine evidence under docs/quality/phase6. Do not sign production readiness without complete essential functional/security/recovery/provider/legal evidence. Unexecuted controls remain UNVERIFIED/BLOCKED; excluded features remain N/A.

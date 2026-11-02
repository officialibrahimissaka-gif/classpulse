# Phase 6 release readiness checklist

**Decision: NO-GO — NOT PRODUCTION READY.** Scope is R1 agency placement coordination. Main is unchanged; no deployment or production activation is performed. Automated local success is necessary but insufficient.

## Demonstrated locally

- [x] Existing implementation baseline rerun; adversarial tests exposed additional defects rather than relying on prior green checks.
- [x] High code findings P6-F01/F02/F06/F07 remediated and locally retested; no confirmed critical tenant escape found in the exercised paths.
- [x] Entity-scoped creation/import and participant administration use scoped predicates; client/internal identity boundaries and current participant permissions enforced.
- [x] Two-tenant detail/mutation/participant/export denial, raw restricted-role isolation and immutable audit constraints exercised.
- [x] Required tasks, waiver, exception resolution, separate human readiness/start, invalid/future dates, reschedule/reopen/cancel and idempotent quota release exercised.
- [x] Module dependency confirmation/read-only behavior, queued-effect reauthorization, retained export/reactivation, trial/exit boundaries and concurrent last-slot capacity tested.
- [x] Manual commercial exact retries, changed retry/reused order denial, safe downgrade/cancellation and effective-date ordering tested; no monetary engine implied.
- [x] Golden metric/cohort cases, actual export parsing, Unicode/formula safety and approved 5,000-row export limit exercised.
- [x] Real HTTP Origin/CSRF/session-tamper/unknown-field/SQL-XSS-as-data/unsupported payroll-webhook denial tested.
- [x] Automated WCAG tags, selected keyboard navigation and 390/768/1440px layout checks exercised on relevant screens.
- [x] Local 20-user/10,000-placement workload: 400 successful reads + 60 successful writes; read/write p95 below approved local targets; 5,000 rows reconciled in each export format.
- [x] Review-branch evidence and six requested audit deliverables produced; final runner results are recorded in TEST_RESULTS.md.

## Required before release — no inferred approvals

- [ ] **P6-B01 — Identity/security owner:** real provider login, signature/issuer/audience/state/nonce/email/MFA/reauthentication/device/federation/session tests and independent review.
- [ ] **P6-B02 — Platform/SRE:** approved actual hosting/residency, private S3 versioning/KMS, least-privilege IAM, TLS/network controls, trusted ingress/WAF and verified SMTP/SES/delivery behavior.
- [ ] **P6-B03 — SRE/privacy:** encrypted PostgreSQL/object restore with deletion-tombstone replay; demonstrate RPO ≤24h/RTO ≤8h; key rotation and failure/incident drills.
- [ ] **P6-B04 — Legal/privacy/backend:** lawful regime/processing/contract/subprocessor/transfer review, complete record-specific retention/rights/correction/scoped-hold flows and verified controller responses.
- [ ] **P6-B05 — Security/operator:** time-bounded tenant-approved operator controls, real billing/maintenance workload separation, complete authentication/denial/privileged audit reconciliation, external tamper evidence and alert exercises.
- [ ] **P6-G01/G02 — Product/reporting/backend:** close same-snapshot multi-format/dashboard-export and per-record source-provenance/conflict-review gaps; accept every R1 clause in the requirement matrix, not just individual endpoints.
- [ ] **P6-G03 — UX/QA/product:** manual assistive-technology/report review, effective read-only UI/precise expiry and cross-user freshness; dedicated least-privilege operational role acceptance.
- [ ] **P6-G04 — Data governance:** approved classification vocabulary/mapping and controlled immutable-history/backfill disposition.
- [ ] **P6-G05 — SRE/performance QA:** sustained representative staging load, queue-lag/resource/soak/fault evidence and production alerting; do not turn this local run into an SLA claim.
- [ ] **P6-G06 — Build/security:** resolve or explicitly review the moderate development lint-chain advisory with compatible dependencies, bounded trusted CI and recorded retest.
- [ ] **REQ-L002 — Founder/product:** actual customer discovery, lawful-access evidence, named buyer/paid-evaluation/accepted terms as approved in the research gate. No invented interview, price or payment evidence.
- [ ] Named product, QA, security, privacy/legal and SRE approvers sign the final release record and accept any nonblocking residual risk.

## Explicitly excluded

Payroll/WPS/payslips/tax/gratuity/financial calculations and public payment/provider webhooks are unavailable. Their monetary rounding, reversal, independent legal examples and webhook-signature verification are N/A for R1, not passed. A future module requires its own validated rules, examples and release gates.

No critical/high security, integrity or financial defect may be waived implicitly. Reopen this checklist when implementation, providers, migrations, deployment region, authorization or legal applicability changes. Findings and closure evidence are in SECURITY_AUDIT.md; completeness is in TEST_RESULTS.md and COMPLIANCE_GAP_ANALYSIS.md.

## Phase 7 follow-through — 2 November 2026

The launch verdict remains **NO-GO**. Gated unprovisioned AWS templates, proposed GHS pricing and an isolated Paystack **test-only** adapter are reviewable; they are not live infrastructure, invoice/settlement processing or revenue. [Phase 7 results and added blockers](docs/quality/phase7/RESULTS.md) preserve P6 gaps and add P7-B01 (actual cloud), P7-B02 (merchant/live recurring/invoice/financial controls), P7-B03 (remaining release evidence) and P7-G01 (price/buyer evidence). [Launch plan](LAUNCH_PLAN.md) names accountable functions and first-ten actions. No release checkbox above is closed by documentation, a test-mode transaction or source upload alone.

# Changelog

## Unreleased — Phase 6 audit, 2026-11-01

- Fix ten audit finding areas: entity and participant scope, commercial replay, safe positive allocation, 5,000-row export cap and uniform CSV, trusted-ingress throttling, fail-closed production adapters, problem responses and ambiguous digest classification. No schema changes.
- Add adversarial tenant/security/lifecycle/quota/browser/metric tests; complete gate passes 42 tests plus API/migration/RLS/dependency/build checks.
- Record controlled 20-user local performance and independently reconciled 5,000-row PDF/CSV/XLSX exports.
- Add six Phase 6 audit reports and a complete R1 requirement disposition. Release verdict remains **NO-GO** pending documented production and acceptance blockers.

## Phase 5 implementation — 2026-11-01

- Implement the approved R1 agency accepted-placement-to-start workflow as a strict TypeScript modular monolith.
- Add a 56-model deployable Prisma closure and seven reviewed migrations with non-owner forced tenant RLS, composite keys, integrity checks and immutable history. Preserve the full-vision design schema/OpenAPI.
- Add company/entity setup, trial/module enforcement, current scoped sessions, explicit roles, CSRF, MFA-sensitive administration, version checks, idempotency, atomic quotas, audit and outbox.
- Add source-key clients/candidates, versioned owned checklists, exceptions/waivers, separate human readiness/start, preserved original/rescheduled dates, cancellation and reopening.
- Add explicit client field/task sharing, real invitation dispatch, verified acceptance, revocation and replacement scopes; separate internal member invitations.
- Add encrypted CSV validation/atomic bulk commit, fixed minimal daily reminders, PostgreSQL-backed jobs and BullMQ transport with ambiguous-send review.
- Add central KPI/cohort registry, filters/drill-downs, private/team saved views, print and immutable PDF/CSV/XLSX snapshots with authenticated private downloads.
- Add reviewed effective-dated commercial upgrade/downgrade/cancellation operations that retain excess records and exit-window access; no payment-provider simulation.
- Add reviewed privacy requests/holds, narrow maintenance privileges, resumable erasure/tombstones and explicit-tenant expiry cleanup.
- Add local PostgreSQL/Redis/Mailpit tooling, Docker targets, CI, API contract/traceability, user/developer/operations guides and executed quality evidence.
- Final local suite passes: 8 unit, 12 native PostgreSQL integration, 1 full browser/accessibility/mobile journey; API/migration/security/build gates pass. Production dependency audit reports zero vulnerabilities. Production/customer/legal/recovery release gates remain open; nothing was published or deployed.

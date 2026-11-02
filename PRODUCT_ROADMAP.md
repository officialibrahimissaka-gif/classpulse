# Product roadmap and active work

2 November 2026. Reconstructed from existing MVP_SCOPE.md, POST_LAUNCH_ROADMAP.md and Phase 6/7 findings because this requested file did not previously exist. It is a management view, not a replacement of accepted scope or a promised calendar.

| Milestone | State | Acceptance / evidence |
|---|---|---|
| M1–M7: bounded R1 implementation | Delivered locally, whole-scope acceptance partial | Existing development slices, preserved Phase 5/6/7 evidence; 49-test Phase 7 baseline does not establish production readiness |
| **M8: R1 release acceptance and operational evidence** | **OPEN; feature work paused for D01** | Close applicable R1 clauses and P6/P7 high blockers; independently reviewed provider/restore/privacy/operator/customer evidence; RELEASE_READINESS_CHECKLIST.md |
| M8.1 / CONT-T001: frozen report consistency | Locally complete; final integrated evidence in docs/quality/continuation-2026-11-02 | REQ-R002/R005 and P6-G01: frozen displayed KPIs/projections, same-snapshot multi-format exports, exact artifact status, immutable summary, no expiry extension, current owner/tenant/record/erasure checks, worker and accessible/mobile UI; CONT-SNAP01–07 |
| **M8.2 / CONT-T002: import provenance and correction design/implementation** | **Previously recommended internal task / PAUSED pending D01** | P6-G02: record→batch/row/source revision and conflict disposition trace, authorized correction preserving history, duplicate/stale/concurrent/privacy tests. Confirm exact existing requirements and schema delta before coding |
| M8.3: remaining R1 UX/data governance | Open | G03/G04: effective read-only/expiry/freshness/least privilege, manual assistive tech/tagged PDF, approved sensitivity mapping and reviewed immutable-history disposition |
| M8 external/security/operations track | Blocked / parallel prerequisites | P6-B01–B05/G05/G06, P7-B01–B03: actual cloud/domain/providers, identity, TLS/roles/audit, retention/rights/holds, restore/tombstones, incident/on-call, sustained load and development dependency disposition |
| M9: approved closed pilots and recurring collection | Blocked by M8 and legal/provider/customer evidence | Named commitments, actual approved Ghana/GHS merchant contract tests, recurring lifecycle/invoice/settlement controls and paid pilot terms; no live key accepted today |
| M10: first ten paying organizations | Experiment, not forecast | Reconciled accepted recurring orders plus actual settled payments; measured activation/support cost/renewal, per LAUNCH_PLAN.md |
| Later expansion | Not authorized by this continuation | ATS connector, employee/leave/input exceptions, broader HRMS or payroll only after separate evidence/scope/legal approval |

## Completed engineering slice M8.1 acceptance checklist

- [x] Capture immutable summary and ordered source projections at a single authorized point in time.
- [x] Display frozen report with visible as-of/expiry and explicit live refresh; selected formats reuse it.
- [x] Generate independent PDF/CSV/XLSX readers' reconciled values after a source mutation; keep original expiry and row limit.
- [x] Deny cross-tenant/other-owner/current-record-scope loss, expired/deleted snapshots and privacy-invalidated artifacts/jobs; preserve legacy downloads without rewriting history.
- [x] Record additive migration, API schemas and meaningful native/browser regressions.
- [x] Full final quality-gate result recorded: 56 tests (18 unit/34 integration/4 browser), format/lint/types/API, nine migrations/no drift/FORCE RLS, production security audit and build; see continuation evidence.

Current total release acceptance remains partial even when M8.1 passes. Financial/legal/provider/production claims do not inherit local test results. No delivery date or spend commitment is invented.

## Active discovery priority — 2 November 2026

D01 is now the active founder-requested stage: [discovery charter](docs/product/PROJECT_CHARTER.md) and [30-day plan](docs/product/30_DAY_VALIDATION_PLAN.md). Preserve M8/M8.1 evidence and existing implementation. Do not start CONT-T002 or other features until the founder reviews customer/incumbent/buyer evidence and selects a bounded direction; do not select agency solely because its prototype exists. Production remains NO-GO independently of discovery progress.

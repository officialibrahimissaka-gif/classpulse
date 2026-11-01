# Phase 6 test results

**Verdict: NO-GO / NOT PRODUCTION READY.** Local automated gates pass after remediation; they do not close missing essential production evidence or incomplete R1 clauses. Baseline: `1c22cb0` on `codex/classpulse-mvp-review`. Audit date: 1 November 2026. Same-assistant audit pass, not independent third-party approval.

## Executed results

| Run | Actual outcome | Evidence |
|---|---|---|
| Existing implementation baseline | PASS: 8 unit + 12 native integration + 1 browser = 21 tests, complete original gate exit 0 | docs/quality/phase6/baseline.log |
| New secure expectations before fixes | FAIL as expected: 5 scope/order/allocation/export cases + 4 configuration/rate/error cases; strict CSV case also failed | docs/quality/phase6/reproduction-summary.json; raw temporary renderer buffers not published |
| Targeted retests | PASS for remediated scope/config/rate/error and workflow/worker cases | targeted-retest.log, journeys-targeted.log, csv-retest.log, browser-targeted.log |
| Final complete quality suite | PASS: **13 unit + 27 native PostgreSQL integration + 2 browser = 42 tests**; no skips/expected-failure tests reported; exit 0 | docs/quality/phase6/final-gate.log |
| API/migrations/security/build | PASS: deterministic 37-operation OpenAPI validation, seven fresh PostgreSQL migrations/no drift/FORCE RLS, static/dependency checks, standalone production build | final-gate.log |
| Local load/exports | PASS measured local read/write targets; 400 reads + 60 writes, 20 users, 10k placements, all three 5000-row formats independently reconciled | PERFORMANCE_TEST_RESULTS.md; performance.json/samples |

The final gate includes formatting, lint and strict types with no lint errors or warnings. The pinned Prisma/pg query-serialization deprecation and Playwright environment-color warnings remain visible and are not test failures. Two test-harness issues (UUID parameter inference and strict CSV consumer exposing a real writer defect) were investigated; the writer defect was fixed rather than changing the parser to accept it. No failing check was silently dropped. Performance is a separate controlled synthetic run, not repeated as a fast CI gate.

## Functional and security cases actually exercised

- **Core/tenancy:** atomic nonce-bound setup, idempotency mismatch, non-owner no-context RLS/composite FKs, valid populated two-tenant BOLA denial, server-side entity scope and privileged participant record predicates.
- **Identity/permissions:** recruiter escalation denial, external task allowlists/fields, wrong/expired invite, internal/client boundary, participant expiry/renewal/revocation, stale membership/session, HTTP cookie tamper, Origin/CSRF and fail-closed production configuration. Real OIDC/MFA/device/federation is BLOCKED, not passed.
- **Lifecycle/approvals:** mandatory checklist/waiver and open exceptions block readiness; resolution and separate human start; future-date/stale/missing version rejection; reschedule preserves original, reopen preserves prior start transition; repeated cancellation does not release quota twice.
- **Subscriptions/modules:** explicit dependency cascade, core retained, source read-only/new export, queued invitation reauthorization, reactivation without deletion/replayed effects, trial and 30-day exit boundaries; real concurrent last slot admits one placement and rolls back the second.
- **Commercial integrity:** exact accepted-order retry, changed effective-date conflict, external order reuse denial, future/effective ordering and historical subscription changes, retained over-capacity downgrade and cancellation. Allocation helper rejects zero/negative/fractional/unsafe integers. These are not monetary rounding tests.
- **Metrics/reports:** hand-calculated early/on-time/delayed/boundary/cohort cases, odd/even median and empty denominator, exact drill-down IDs; PDF text, strict CSV and independent XLSX readers reconcile real 5000-row artifacts; Unicode and formulas-as-literal cells; 5001-row denial; owner/scope/integrity/expiry/erasure enforcement.
- **Browser/HTTP:** company→client→placement→checklist→readiness→start→CSV import→worker PDF/download→mobile sign-out; second journey exercises SQL/XSS-as-data, unknown ownership/salary field rejection, problem headers, unsupported payroll/webhook mutation, keyboard navigation and axe WCAG 2.0/2.1/2.2 tags across Overview/Clients/Placements/Settings; layout widths 390/768/1440.
- **Jobs/privacy:** actual Redis worker classifies a prior ambiguous digest as needs_review, no automatic resend; local SMTP attempt idempotence; active-work/hold blocking and repeated reviewed erasure; runtime cannot assume maintenance role. Real SES delivery, object-store/Redis/DB outage chaos, restore and external processors unverified.

## Financial validation boundary

Payroll, WPS, tax, gratuity, payment amounts, monetary zero/negative/rounding, refunds, money reversals and historical statutory calculation rules are **N/A: no such engine is implemented and the endpoints/modules are unavailable**. Independent payroll examples have not been validated. Public payment/webhook signature verification is also N/A; a 404 boundary test is not a signature verifier test. The commercial-order and integer-capacity cases above are in scope and pass locally. A future financial module cannot inherit readiness from this result.

## Complete approved R1 requirement disposition

The table evaluates whole R1 clauses, not just a successful endpoint. PASS-LOCAL is confined to the exercised local behavior; PARTIAL/BLOCKED require closure before full product acceptance. The manifest’s limited F038/F039/D001/M023/M024 clauses are included even where full-vision sections have later release labels. All other full-vision requirements remain excluded by MVP_SCOPE, not secretly certified.

| Requirement | Status | Executed evidence / remaining acceptance |
|---|---|---|
| [REQ-D001 — Executives dashboard](REPORTING_REQUIREMENTS.md#req-d001) | PARTIAL | Agency-only metric cards/bar/source tables/filters inspected; full visionary dashboards excluded. Snapshot/freshness/manual acceptance remains G01/G03. |
| [REQ-D004 — Recruiters dashboard](REPORTING_REQUIREMENTS.md#req-d004) | PARTIAL | Agency-only metric cards/bar/source tables/filters inspected; full visionary dashboards excluded. Snapshot/freshness/manual acceptance remains G01/G03. |
| [REQ-E001 — Entitlement policy conjunction](ENTITLEMENT_MODEL.md#req-e001) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E002 — Versioned grants and commercial source](ENTITLEMENT_MODEL.md#req-e002) | PARTIAL | Exact accepted-order hash/history/capacity tests pass; real contract/versioned grant/operator approval remains B05/CMP09. |
| [REQ-E003 — Module state machine](ENTITLEMENT_MODEL.md#req-e003) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E004 — Dependency activation and deactivation](ENTITLEMENT_MODEL.md#req-e004) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E005 — Read-only, export and retained access](ENTITLEMENT_MODEL.md#req-e005) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E006 — Safe deactivation and queued work](ENTITLEMENT_MODEL.md#req-e006) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E007 — Retention and reactivation](ENTITLEMENT_MODEL.md#req-e007) | PARTIAL | Retained data/reactivation/expiry cleanup local checks; source schedules/scoped holds/complete rights remain B04. |
| [REQ-E008 — Atomic capacity and usage metering](ENTITLEMENT_MODEL.md#req-e008) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E009 — Limits, rate limits and no surprise overage](ENTITLEMENT_MODEL.md#req-e009) | PARTIAL | P6-RATE exact limit, HTTP bounds and quota guards pass; agreed usage-meter catalog, production ingress/abuse limits require review. |
| [REQ-E010 — Trial lifecycle](ENTITLEMENT_MODEL.md#req-e010) | PARTIAL | P6-SUB-002 proves effective server read-only/exit; exact UI expiry/affordances, reminders and finalized versioned terms remain G03/CMP09. |
| [REQ-E011 — Upgrade, downgrade and cancellation](ENTITLEMENT_MODEL.md#req-e011) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-E012 — Add-ons, services and compliance packs](ENTITLEMENT_MODEL.md#req-e012) | PASS-LOCAL-BOUNDARY | Five-module release allowlist only; later add-ons/services/legal packs unavailable. Not a service/compliance certification. |
| [REQ-E013 — Billing events and reconciliation](ENTITLEMENT_MODEL.md#req-e013) | PASS-LOCAL-R1 | P6-COM-001/003 and commercial history tests; manual accepted orders only. Automated payment webhook reconciliation excluded. |
| [REQ-E014 — Cache invalidation and execution enforcement](ENTITLEMENT_MODEL.md#req-e014) | PASS-LOCAL | P6-SUB-001/002, P6-QUOTA-001, commercial and existing module/dependency/retained-data tests; live production binding remains separate. |
| [REQ-F001 — Accepted-placement entry](FEATURE_CATALOG.md#req-f001) | PASS-LOCAL | P6-WF/ISO/INV/SCOPE plus original fixture and browser journey. Applies to tested R1 paths; provider sign-off remains B01/B02. |
| [REQ-F002 — Owned handoffs and exceptions](FEATURE_CATALOG.md#req-f002) | PASS-LOCAL | P6-WF/ISO/INV/SCOPE plus original fixture and browser journey. Applies to tested R1 paths; provider sign-off remains B01/B02. |
| [REQ-F003 — Scoped client participation and readiness](FEATURE_CATALOG.md#req-f003) | PASS-LOCAL | P6-WF/ISO/INV/SCOPE plus original fixture and browser journey. Applies to tested R1 paths; provider sign-off remains B01/B02. |
| [REQ-F029 — Client accounts and contacts](FEATURE_CATALOG.md#req-f029) | PARTIAL | Client creation/list and invited contact references tested; complete contact maintenance/source correction and ownership lifecycle require product acceptance. |
| [REQ-F038 — Reliable reminders and delivery](FEATURE_CATALOG.md#req-f038) | PARTIAL | P6-OPS-001 real queue ambiguity and P6-SUB stop effects pass; daily digest scheduling/local SMTP covered, provider retry/delivery/alert assurance remains B02/G05. |
| [REQ-F039 — Permission-aware operational reporting](FEATURE_CATALOG.md#req-f039) | PARTIAL | P6-MET/EXP and real formats pass; snapshot reuse/freshness/catalog and manual report acceptance remain G01/G03. |
| [REQ-F040 — Validated CSV placement imports](FEATURE_CATALOG.md#req-f040) | PASS-LOCAL | Atomic CSV conflict/rollback/race, original import tests, browser commit and 1000-row measured reconciliation. Provenance completeness remains G02. |
| [REQ-K001 — Confirmed starts](KPI_CATALOG.md#req-k001) | PASS-LOCAL | P6-MET-001 hand-calculated boundaries/odd median; original empty/even-cohort fixtures; actual 5000-row artifacts parsed. No production baseline claimed. |
| [REQ-K002 — On-time start rate](KPI_CATALOG.md#req-k002) | PASS-LOCAL | P6-MET-001 hand-calculated boundaries/odd median; original empty/even-cohort fixtures; actual 5000-row artifacts parsed. No production baseline claimed. |
| [REQ-K003 — Overdue mandatory tasks](KPI_CATALOG.md#req-k003) | PASS-LOCAL | P6-MET-001 hand-calculated boundaries/odd median; original empty/even-cohort fixtures; actual 5000-row artifacts parsed. No production baseline claimed. |
| [REQ-K004 — Start slippage](KPI_CATALOG.md#req-k004) | PASS-LOCAL | P6-MET-001 hand-calculated boundaries/odd median; original empty/even-cohort fixtures; actual 5000-row artifacts parsed. No production baseline claimed. |
| [REQ-L001 — R1 explicit scope](MVP_SCOPE.md#req-l001) | PASS-LOCAL-BOUNDARY | R1-only modules/routes; unsupported payroll/payment/webhook mutation returns 404 (P6-HTTP-001). |
| [REQ-L002 — Discovery and commercial gate](MVP_SCOPE.md#req-l002) | BLOCKED | No independent buyer/artifact/payment/terms evidence supplied; founder/product gate. |
| [REQ-L003 — Security, retention and recovery gate](MVP_SCOPE.md#req-l003) | BLOCKED | B01-B05: independent production identity/security/privacy/restore/provider approvals absent. |
| [REQ-L004 — End-to-end workflow gate](MVP_SCOPE.md#req-l004) | PARTIAL | Journeys distributed across native two-tenant and HTTP/browser cases, not every approved scenario in one monolithic fixture; remaining functional/provider gaps noted. |
| [REQ-L005 — Capacity and observability gate](MVP_SCOPE.md#req-l005) | PARTIAL | Measured workload/race/limits pass locally; production alerts/fault/soak/queue capacity/restore not certified. |
| [REQ-L006 — Traceability and change control gate](MVP_SCOPE.md#req-l006) | PASS-LOCAL | This requirement-to-case matrix, source hashes and final runner logs; original planning TEST catalog not falsely marked fully executed. |
| [REQ-M001 — platform.core](MODULE_CATALOG.md#req-m001) | PASS-LOCAL-R1 | Provisioning/release allowlist/dependency/read-only/scope tests; no unimplemented feature inherits a grant. |
| [REQ-M002 — agency.starts](MODULE_CATALOG.md#req-m002) | PASS-LOCAL-R1 | Provisioning/release allowlist/dependency/read-only/scope tests; no unimplemented feature inherits a grant. |
| [REQ-M018 — crm.accounts](MODULE_CATALOG.md#req-m018) | PASS-LOCAL-R1 | Provisioning/release allowlist/dependency/read-only/scope tests; no unimplemented feature inherits a grant. |
| [REQ-M023 — platform.analytics](MODULE_CATALOG.md#req-m023) | PARTIAL | Limited R1 analytics/CSV behavior exercised; snapshot/catalog/provenance/usage and production clauses require remaining acceptance. |
| [REQ-M024 — platform.integrations](MODULE_CATALOG.md#req-m024) | PARTIAL | Limited R1 analytics/CSV behavior exercised; snapshot/catalog/provenance/usage and production clauses require remaining acceptance. |
| [REQ-P001 — Tenant isolation](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p001) | PASS-LOCAL | P6-ISO-001; original restricted-role/raw RLS and composite FK tests. Compromised-runtime GUC boundary remains documented. |
| [REQ-P002 — Identity and membership lifecycle](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p002) | PARTIAL | Session tamper/revocation/CSRF/logout and P6-AUTH pass; real OIDC/MFA provider assurance blocked (B01). |
| [REQ-P003 — Least privilege and field authorization](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p003) | PARTIAL | P6-SCOPE, INV, HTTP deny scope/role mixing; exhaustive role/field matrix and dedicated operational roles remain G03/B05. |
| [REQ-P004 — Audit and accountability](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p004) | PARTIAL | Immutable DB audit and added privileged-read/denial evidence; full auth/audit/archive reconciliation remains B05. |
| [REQ-P005 — Privacy, deletion and retention](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p005) | BLOCKED | Native reviewed erasure/hold tests pass; complete source schedules/rights/scoped holds/external backups remain B04. |
| [REQ-P006 — Concurrency and reliable commands](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p006) | PASS-LOCAL | Original idempotency/stale-version tests; P6-WF-001/COM/QUOTA; no general distributed fault certification. |
| [REQ-P007 — Localization and accessibility](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p007) | PARTIAL | P6-HTTP keyboard/axe/390-768-1440px and Unicode/DST tests; manual AT/locale preference/tagged-PDF review remains G03. |
| [REQ-P008 — Operational reliability and performance](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p008) | PARTIAL | 20-user/10k local read/write target passes; 99.5% availability, staging fault/soak and RPO/RTO unverified (B03/G05). |
| [REQ-P009 — Secure delivery and secrets](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p009) | PARTIAL | P6-AUTH/RATE/HTTP/local file checks and dependency scan pass; actual encryption/IAM/ingress/provider/resource controls blocked (B02). |
| [REQ-P010 — SaaS operator access](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p010) | BLOCKED | No support impersonation endpoint; production JIT/tenant-approved operator/identity binding unverified (B05). |
| [REQ-P011 — Data provenance and source of truth](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p011) | PARTIAL | Source keys, no email merge, conflict rollback and batch actor audit pass; per-record revision/batch/conflict mapping remains G02. |
| [REQ-P012 — Controlled configuration change](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p012) | PARTIAL | Template revision, immutable original date and module fences pass; remaining full policy/operational change procedures need acceptance. |
| [REQ-R001 — Permission-preserving query and drill-down](REPORTING_REQUIREMENTS.md#req-r001) | PASS-LOCAL | P6-ISO/SCOPE/MET/EXP/HTTP and 5000-row strict file reconciliation. |
| [REQ-R002 — Metric semantics and snapshot consistency](REPORTING_REQUIREMENTS.md#req-r002) | PARTIAL | Central version/hash/bindings tested; one user-visible snapshot reused across formats/dashboard is not exposed (G01). |
| [REQ-R003 — Visuals and accessible interaction](REPORTING_REQUIREMENTS.md#req-r003) | PARTIAL | Automatic axe/visual/export/audit tests exist; manual AT/catalog/operational coverage remains G03/B05. |
| [REQ-R004 — Filters and saved views](REPORTING_REQUIREMENTS.md#req-r004) | PARTIAL | Private/team filters tested; full organizational dimensions/team administration/catalog maintenance limited. |
| [REQ-R005 — Protected multi-format exports](REPORTING_REQUIREMENTS.md#req-r005) | PARTIAL | Scoped authenticated files/formats/expiry pass; live storage and multi-format snapshot reuse blocked (B02/G01). |
| [REQ-R006 — Export content safety and size](REPORTING_REQUIREMENTS.md#req-r006) | PASS-LOCAL | P6-ISO/SCOPE/MET/EXP/HTTP and 5000-row strict file reconciliation. |
| [REQ-R009 — Freshness and reconciliation](REPORTING_REQUIREMENTS.md#req-r009) | PARTIAL | As-of and central fixtures present; automatic bounded cross-user dashboard freshness/monitoring not established (G03/G05). |
| [REQ-R010 — Report catalog, limits and audit](REPORTING_REQUIREMENTS.md#req-r010) | PARTIAL | Automatic axe/visual/export/audit tests exist; manual AT/catalog/operational coverage remains G03/B05. |

## Remaining work and release ownership

SECURITY_AUDIT.md lists ten remediated code-finding areas and the still-open P6-B01–B05/P6-G01–G05 controls. COMPLIANCE_GAP_ANALYSIS.md assigns legal/privacy/platform/product actions. RELEASE_READINESS_CHECKLIST.md is intentionally unsigned and contains unchecked release blockers. Key incomplete functional clauses include same-snapshot re-export, full provenance/conflict/rights/retention procedures, effective read-only/freshness/user acceptance and manual report/accessibility review. Do not equate 42 green tests with every original acceptance scenario passing.

No production deployment, environment publication, payment execution, customer outreach or change to main was performed. Audit source changes/evidence are delivered on the existing GitHub review branch.

## Additional development-tool scan

Full-tree dependency audit reports 16 moderate affected ESLint-chain nodes (P6-G06); production-only audit is clean. This optional broader scan is recorded as an open finding, not a passing all-dependencies security claim. No incompatible auto-fix was applied. See SECURITY_AUDIT.md and docs/quality/phase6/dependency-summary.json.

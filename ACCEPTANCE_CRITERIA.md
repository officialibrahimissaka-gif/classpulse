# Acceptance criteria and planned verification

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Execution status and test design

All tests are **specified, not implemented or executed**. Each TEST ID maps to one requirement, story, design contract and planned implementation scope through USER_STORIES.md. Acceptance includes positive behavior and meaningful negative/boundary paths. The scenario below is the minimum obligation, not permission to omit inherited tenant, entitlement, record-scope, sensitivity and retention checks.

Fixture conventions: tenants A/B; two legal entities and clients per tenant; owner, narrow recruiter, manager, revoked member, external client participant and service principal; permitted and forbidden records; one entitlement at its exact cap; a frozen UTC clock plus named business timezone. Use synthetic data, never real personal documents. Later payroll/country tests need reviewed jurisdiction/provider golden fixtures; invented legal examples cannot certify compliance.

For each implemented test, record environment/build, fixture version, command/runner, expected vs actual result, assertion count and evidence path. A skipped, blocked, zero-assertion or unrun test is not a pass. Unit checks alone cannot validate end-to-end policy enforcement, exports or job side effects. R1 requires API integration tests, worker/transaction tests and representative UI/export end-to-end coverage.

<a id="test-p001"></a>
### TEST-P001 — Tenant isolation

**Trace:** [REQ-P001](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p001) → US-P001 → DES-P001 → IMP-P001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given two tenants with similar IDs, when a user queries, mutates, imports, exports or subscribes to another tenant's data, then access is denied without leaking existence or row counts; valid own-tenant work succeeds. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p002"></a>
### TEST-P002 — Identity and membership lifecycle

**Trace:** [REQ-P002](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p002) → US-P002 → DES-P002 → IMP-P002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** An expired or replayed invitation fails; removed members cannot use an existing session, export link or queued action; an authorized invited member enters only the assigned scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p003"></a>
### TEST-P003 — Least privilege and field authorization

**Trace:** [REQ-P003](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p003) → US-P003 → DES-P003 → IMP-P003. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A recruiter with a paid payroll module cannot read salary; a line manager sees only the permitted team; totals and searches do not reveal excluded records. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p004"></a>
### TEST-P004 — Audit and accountability

**Trace:** [REQ-P004](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p004) → US-P004 → DES-P004 → IMP-P004. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A successful readiness change and audit event are committed together; a rollback leaves neither business mutation nor false success event; secrets are absent from logs. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p005"></a>
### TEST-P005 — Privacy, deletion and retention

**Trace:** [REQ-P005](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p005) → US-P005 → DES-P005 → IMP-P005. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** An expired unheld record is removed from primary/search/export stores with a tombstone; a scoped held record is preserved with reason; reactivation does not resurrect deleted data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p006"></a>
### TEST-P006 — Concurrency and reliable commands

**Trace:** [REQ-P006](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p006) → US-P006 → DES-P006 → IMP-P006. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Retrying the same placement-create request returns the original result; a conflicting concurrent edit returns a conflict and preserves the first committed version; an event retry does not duplicate a reminder. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p007"></a>
### TEST-P007 — Localization and accessibility

**Trace:** [REQ-P007](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p007) → US-P007 → DES-P007 → IMP-P007. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A keyboard-only participant completes an approval; a screen reader receives validation errors; a Dubai date cutoff remains correct across UTC rendering and a DST-observing report timezone. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p008"></a>
### TEST-P008 — Operational reliability and performance

**Trace:** [REQ-P008](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p008) → US-P008 → DES-P008 → IMP-P008. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A representative isolated load test meets p95 targets without permission leakage; a backup restore within the target replays deletion tombstones and demonstrates tenant consistency. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p009"></a>
### TEST-P009 — Secure delivery and secrets

**Trace:** [REQ-P009](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p009) → US-P009 → DES-P009 → IMP-P009. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A forbidden attachment is rejected; expired credentials and public-storage reads fail; logs and client bundles contain no test secret; critical findings block release. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p010"></a>
### TEST-P010 — SaaS operator access

**Trace:** [REQ-P010](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p010) → US-P010 → DES-P010 → IMP-P010. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** An operator without an active scoped grant cannot read a tenant record; an expired grant stops working mid-session and all allowed access is audited. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p011"></a>
### TEST-P011 — Data provenance and source of truth

**Trace:** [REQ-P011](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p011) → US-P011 → DES-P011 → IMP-P011. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Two imports with the same email and different source IDs do not merge silently; an update conflicting with a confirmed readiness decision requires review. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-p012"></a>
### TEST-P012 — Controlled configuration change

**Trace:** [REQ-P012](PRODUCT_REQUIREMENTS_DOCUMENT.md#req-p012) → US-P012 → DES-P012 → IMP-P012. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Publishing a new milestone template does not alter an existing completed placement; an authorized migration previews changed tasks and records its version. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f001"></a>
### TEST-F001 — Accepted-placement entry

**Trace:** [REQ-F001](FEATURE_CATALOG.md#req-f001) → US-F001 → DES-F001 → IMP-F001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A missing client or cross-tenant reference is rejected; a valid accepted placement has one ID and original planned date; changing the date preserves the original for reporting. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f002"></a>
### TEST-F002 — Owned handoffs and exceptions

**Trace:** [REQ-F002](FEATURE_CATALOG.md#req-f002) → US-F002 → DES-F002 → IMP-F002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A required incomplete task blocks ready status; an authorized waiver with reason is audited; overdue tasks appear once, and a blocked flag does not falsely cancel the placement. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f003"></a>
### TEST-F003 — Scoped client participation and readiness

**Trace:** [REQ-F003](FEATURE_CATALOG.md#req-f003) → US-F003 → DES-F003 → IMP-F003. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A client invited to placement A cannot enumerate placement B, alter readiness or see unshared notes; agency confirmation requires complete/waived mandatory tasks and captures actor/time/version. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f004"></a>
### TEST-F004 — People, entities and contracts

**Trace:** [REQ-F004](FEATURE_CATALOG.md#req-f004) → US-F004 → DES-F004 → IMP-F004. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A transfer retains the old employment version; an HR user without restricted-field permission cannot retrieve salary or bank fields. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f005"></a>
### TEST-F005 — Controlled document records

**Trace:** [REQ-F005](FEATURE_CATALOG.md#req-f005) → US-F005 → DES-F005 → IMP-F005. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An unscanned file is unavailable; a revoked download grant fails; an expiry reminder does not label an expired document legally valid. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f006"></a>
### TEST-F006 — Leave balances and approvals

**Trace:** [REQ-F006](FEATURE_CATALOG.md#req-f006) → US-F006 → DES-F006 → IMP-F006. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Concurrent requests cannot overspend a configured balance; rejection releases a reservation once; a manager cannot view a restricted medical attachment. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f007"></a>
### TEST-F007 — Leave adjustments and payroll handoff

**Trace:** [REQ-F007](FEATURE_CATALOG.md#req-f007) → US-F007 → DES-F007 → IMP-F007. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** An adjustment to a closed period creates a traceable delta; an unauthorized self-approval fails. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f008"></a>
### TEST-F008 — Onboarding and transfers

**Trace:** [REQ-F008](FEATURE_CATALOG.md#req-f008) → US-F008 → DES-F008 → IMP-F008. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A manager who loses entity scope cannot read the transferred case; completed historic tasks remain attributable. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f009"></a>
### TEST-F009 — Offboarding and access handoff

**Trace:** [REQ-F009](FEATURE_CATALOG.md#req-f009) → US-F009 → DES-F009 → IMP-F009. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A failed connector revocation remains visible and retryable; final settlement is not marked paid by checklist completion. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f010"></a>
### TEST-F010 — Benefits and expenses

**Trace:** [REQ-F010](FEATURE_CATALOG.md#req-f010) → US-F010 → DES-F010 → IMP-F010. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An ineligible enrollment is rejected with a safe reason; self-approval is blocked; approved expense remains unpaid until reconciled evidence arrives. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f011"></a>
### TEST-F011 — Recruiting pipeline

**Trace:** [REQ-F011](FEATURE_CATALOG.md#req-f011) → US-F011 → DES-F011 → IMP-F011. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** One candidate can hold two separate applications; moving one does not move the other; an unassigned hiring manager cannot read either. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f012"></a>
### TEST-F012 — Structured evaluation and accepted-offer handoff

**Trace:** [REQ-F012](FEATURE_CATALOG.md#req-f012) → US-F012 → DES-F012 → IMP-F012. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An unapproved offer cannot be issued; repeated acceptance events create one placement; disabling agency.starts preserves the accepted offer without executing a forbidden downstream write. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f013"></a>
### TEST-F013 — Payroll exception workspace

**Trace:** [REQ-F013](FEATURE_CATALOG.md#req-f013) → US-F013 → DES-F013 → IMP-F013. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A batch with an unresolved required input cannot be approved; its preparer cannot approve it; missing workforce.time does not break a valid manual/provider import. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f014"></a>
### TEST-F014 — Versioned payroll exports and reconciliation

**Trace:** [REQ-F014](FEATURE_CATALOG.md#req-f014) → US-F014 → DES-F014 → IMP-F014. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A rejected file remains rejected and traceable; a repeated export does not create a second payroll release; no payment status appears without reconciliation evidence. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f015"></a>
### TEST-F015 — Versioned pay runs

**Trace:** [REQ-F015](FEATURE_CATALOG.md#req-f015) → US-F015 → DES-F015 → IMP-F015. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Known reviewed fixtures reconcile gross/net and rounding; a missing applicable rule version or self-approval blocks finalization; a locked run is immutable. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f016"></a>
### TEST-F016 — Payslips and final settlement

**Trace:** [REQ-F016](FEATURE_CATALOG.md#req-f016) → US-F016 → DES-F016 → IMP-F016. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An employee cannot fetch another payslip; a superseded statement is marked; a settlement lacking an applicable reviewed rule cannot finalize. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f017"></a>
### TEST-F017 — Time entry and attendance exceptions

**Trace:** [REQ-F017](FEATURE_CATALOG.md#req-f017) → US-F017 → DES-F017 → IMP-F017. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** An overlapping pair is flagged; a correction preserves the source; a manager cannot approve time outside the assigned team. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f018"></a>
### TEST-F018 — Approved time handoff

**Trace:** [REQ-F018](FEATURE_CATALOG.md#req-f018) → US-F018 → DES-F018 → IMP-F018. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A corrected locked time entry generates a delta rather than silently changing the payroll input; disabled payroll.inputs stops handoff without deleting time. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f019"></a>
### TEST-F019 — Shift plans and coverage

**Trace:** [REQ-F019](FEATURE_CATALOG.md#req-f019) → US-F019 → DES-F019 → IMP-F019. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An overlapping assignment is flagged before publish; a published edit creates a new version; historical coverage uses its original plan. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f020"></a>
### TEST-F020 — Shift swap approval

**Trace:** [REQ-F020](FEATURE_CATALOG.md#req-f020) → US-F020 → DES-F020 → IMP-F020. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Two conflicting swaps cannot allocate the same worker twice; a removed participant cannot finalize a previously opened swap. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f021"></a>
### TEST-F021 — Employee profile and service requests

**Trace:** [REQ-F021](FEATURE_CATALOG.md#req-f021) → US-F021 → DES-F021 → IMP-F021. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Employee A cannot view employee B through direct IDs or search; a proposed bank change requires separate reviewed workflow rather than direct save. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f022"></a>
### TEST-F022 — Employee inbox and acknowledgments

**Trace:** [REQ-F022](FEATURE_CATALOG.md#req-f022) → US-F022 → DES-F022 → IMP-F022. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Revoked access prevents opening an old link; delivery does not mark acknowledgment; duplicate delivery does not create duplicate action. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f023"></a>
### TEST-F023 — Surveys and confidential employee cases

**Trace:** [REQ-F023](FEATURE_CATALOG.md#req-f023) → US-F023 → DES-F023 → IMP-F023. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A four-response cohort is suppressed; combining filters cannot reveal an individual; a line manager cannot read a confidential case without an explicit case grant. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f024"></a>
### TEST-F024 — Goals and review cycles

**Trace:** [REQ-F024](FEATURE_CATALOG.md#req-f024) → US-F024 → DES-F024 → IMP-F024. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A draft review remains private to authorized reviewers; changing a future scale does not recalculate a completed review. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f025"></a>
### TEST-F025 — Controlled calibration

**Trace:** [REQ-F025](FEATURE_CATALOG.md#req-f025) → US-F025 → DES-F025 → IMP-F025. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An out-of-cohort employee cannot be opened; a rating change without a reason is rejected and completed decisions remain attributable. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f026"></a>
### TEST-F026 — Learning and renewal tracking

**Trace:** [REQ-F026](FEATURE_CATALOG.md#req-f026) → US-F026 → DES-F026 → IMP-F026. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A retried provider callback counts once; an expired credential is flagged independently of course completion. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f027"></a>
### TEST-F027 — Compensation planning cycles

**Trace:** [REQ-F027](FEATURE_CATALOG.md#req-f027) → US-F027 → DES-F027 → IMP-F027. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A user without salary permission sees no amounts; an over-budget proposal blocks approval under configured policy; disabled payroll does not silently drop a handoff. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f028"></a>
### TEST-F028 — Skills profiles and succession plans

**Trace:** [REQ-F028](FEATURE_CATALOG.md#req-f028) → US-F028 → DES-F028 → IMP-F028. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An employee can update permitted skills but cannot view a restricted successor list; expired assessments are marked stale. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f029"></a>
### TEST-F029 — Client accounts and contacts

**Trace:** [REQ-F029](FEATURE_CATALOG.md#req-f029) → US-F029 → DES-F029 → IMP-F029. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A contact linked to a client still sees only explicitly shared placements; deleting an unused contact is audited and referenced contacts follow retention rather than cascading deletion. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f030"></a>
### TEST-F030 — Contracts and account relationships

**Trace:** [REQ-F030](FEATURE_CATALOG.md#req-f030) → US-F030 → DES-F030 → IMP-F030. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An agency recruiter without commercial permission cannot export contract rates; editing a hierarchy does not merge tenants or sharing grants. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f031"></a>
### TEST-F031 — Sales activities and pipeline

**Trace:** [REQ-F031](FEATURE_CATALOG.md#req-f031) → US-F031 → DES-F031 → IMP-F031. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Moving an opportunity preserves prior stage dates; a sales user cannot read restricted candidate notes through an account relation. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f032"></a>
### TEST-F032 — Quote approval and weighted forecast

**Trace:** [REQ-F032](FEATURE_CATALOG.md#req-f032) → US-F032 → DES-F032 → IMP-F032. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An excessive discount blocks issue without approval; forecast reconciliation shows each opportunity and no mixed-currency total without an explicit conversion policy. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f033"></a>
### TEST-F033 — Customer onboarding and success plans

**Trace:** [REQ-F033](FEATURE_CATALOG.md#req-f033) → US-F033 → DES-F033 → IMP-F033. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A tenant CS agent cannot access another tenant's onboarding or vendor administration; late customer milestones use clear owner and due date. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f034"></a>
### TEST-F034 — Explainable health and renewal tracking

**Trace:** [REQ-F034](FEATURE_CATALOG.md#req-f034) → US-F034 → DES-F034 → IMP-F034. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Missing telemetry is shown as unknown rather than a zero score; a restricted ticket cannot leak details through a health drill-down. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f035"></a>
### TEST-F035 — Customer service ticketing

**Trace:** [REQ-F035](FEATURE_CATALOG.md#req-f035) → US-F035 → DES-F035 → IMP-F035. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A restricted ticket is absent from unauthorized search and exports; a reopened ticket preserves prior response/resolution events. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f036"></a>
### TEST-F036 — Knowledge, SLA and CSAT

**Trace:** [REQ-F036](FEATURE_CATALOG.md#req-f036) → US-F036 → DES-F036 → IMP-F036. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An internal article cannot appear publicly; automated acknowledgments do not count as first human response; duplicate survey replies count once. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f037"></a>
### TEST-F037 — Governed cross-module rules

**Trace:** [REQ-F037](FEATURE_CATALOG.md#req-f037) → US-F037 → DES-F037 → IMP-F037. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A rule targeting a disabled module pauses with a safe reason and performs no write; recursive triggers stop at the configured depth without consuming unlimited quota. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f038"></a>
### TEST-F038 — Reliable reminders and delivery

**Trace:** [REQ-F038](FEATURE_CATALOG.md#req-f038) → US-F038 → DES-F038 → IMP-F038. **Release:** R1 bundled only. **Status:** Not executed.

**Acceptance scenario:** A queued digest for a removed participant is suppressed; retry does not send twice; email contains no unshared candidate notes. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f039"></a>
### TEST-F039 — Permission-aware operational reporting

**Trace:** [REQ-F039](FEATURE_CATALOG.md#req-f039) → US-F039 → DES-F039 → IMP-F039. **Release:** R1 limited. **Status:** Not executed.

**Acceptance scenario:** The same as-of snapshot reconciles chart totals, drill-down and all export formats; no field denied in the UI appears in a file. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f040"></a>
### TEST-F040 — Validated CSV placement imports

**Trace:** [REQ-F040](FEATURE_CATALOG.md#req-f040) → US-F040 → DES-F040 → IMP-F040. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A malformed row prevents the atomic commit and yields row-specific errors; a repeated source batch does not duplicate placements; a quota race fails safely without partial records. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f041"></a>
### TEST-F041 — Scoped APIs, webhooks and connector packages

**Trace:** [REQ-F041](FEATURE_CATALOG.md#req-f041) → US-F041 → DES-F041 → IMP-F041. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A revoked token and disabled source module stop API access immediately; an invalid signature/replay fails; a private-network/metadata callback destination is rejected. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f042"></a>
### TEST-F042 — Jurisdiction pack lifecycle

**Trace:** [REQ-F042](FEATURE_CATALOG.md#req-f042) → US-F042 → DES-F042 → IMP-F042. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A pack without reviewed sources or applicable entity mapping cannot activate; a new version does not silently recalculate a finalized run. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f043"></a>
### TEST-F043 — Reviewed UAE employment/payroll adapters

**Trace:** [REQ-F043](FEATURE_CATALOG.md#req-f043) → US-F043 → DES-F043 → IMP-F043. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An ADGM entity cannot select a mainland-only rule by default; an untested provider format cannot be marked supported; exported wages are not displayed as paid. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f044"></a>
### TEST-F044 — Career publishing and candidate intake

**Trace:** [REQ-F044](FEATURE_CATALOG.md#req-f044) → US-F044 → DES-F044 → IMP-F044. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An unapproved or expired requisition is not published; malicious applicant input is sanitized; a parsed field does not overwrite a reviewed record without confirmation. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f045"></a>
### TEST-F045 — Candidate portal and interview coordination

**Trace:** [REQ-F045](FEATURE_CATALOG.md#req-f045) → US-F045 → DES-F045 → IMP-F045. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Candidate A cannot inspect candidate B or internal assessment notes; booking a conflicting slot fails safely; withdrawal does not silently erase a lawful scoped hold. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f046"></a>
### TEST-F046 — Organization directory and position control

**Trace:** [REQ-F046](FEATURE_CATALOG.md#req-f046) → US-F046 → DES-F046 → IMP-F046. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A reporting cycle is rejected; a vacant position remains in authorized position reporting but not active headcount; directory users see no salary or private contacts. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f047"></a>
### TEST-F047 — Asset assignment and return tracking

**Trace:** [REQ-F047](FEATURE_CATALOG.md#req-f047) → US-F047 → DES-F047 → IMP-F047. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A returned asset retains custody history; a failed access revocation remains unresolved; no payroll deduction is created by an unreturned-asset flag. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f048"></a>
### TEST-F048 — Project assignment and client-approved timesheets

**Trace:** [REQ-F048](FEATURE_CATALOG.md#req-f048) → US-F048 → DES-F048 → IMP-F048. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A client sees only assigned timesheets and no worker salary; a changed assignment creates a version; approved client time does not automatically mark wages or invoices paid. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f049"></a>
### TEST-F049 — Learning catalog and program administration

**Trace:** [REQ-F049](FEATURE_CATALOG.md#req-f049) → US-F049 → DES-F049 → IMP-F049. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An unlicensed external course cannot be launched; a changed prerequisite does not rewrite completed learning history; full sessions reject excess enrollment atomically. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f050"></a>
### TEST-F050 — Employee communications and acknowledgments

**Trace:** [REQ-F050](FEATURE_CATALOG.md#req-f050) → US-F050 → DES-F050 → IMP-F050. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** An announcement for entity A is absent for entity B; delivery never marks acknowledgment; directory search cannot reveal hidden personal contact fields. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-f051"></a>
### TEST-F051 — Approved order and invoice handoff

**Trace:** [REQ-F051](FEATURE_CATALOG.md#req-f051) → US-F051 → DES-F051 → IMP-F051. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A won opportunity without accepted terms does not generate an invoice; duplicate callbacks do not double-count revenue; an issued invoice is not displayed as paid. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m001"></a>
### TEST-M001 — platform.core

**Trace:** [REQ-M001](MODULE_CATALOG.md#req-m001) → US-M001 → DES-M001 → IMP-M001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** An attempt to disable platform.core independently is rejected. Whole-tenant closure stops business commands while preserving only authorized exit/recovery access for the agreed window; core provisioning never grants salary access or deletes retained data. Security suspension requires separately verified recovery. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m002"></a>
### TEST-M002 — agency.starts

**Trace:** [REQ-M002](MODULE_CATALOG.md#req-m002) → US-M002 → DES-M002 → IMP-M002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given agency.starts inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m003"></a>
### TEST-M003 — hr.records

**Trace:** [REQ-M003](MODULE_CATALOG.md#req-m003) → US-M003 → DES-M003 → IMP-M003. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given hr.records inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m004"></a>
### TEST-M004 — hr.leave

**Trace:** [REQ-M004](MODULE_CATALOG.md#req-m004) → US-M004 → DES-M004 → IMP-M004. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given hr.leave inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m005"></a>
### TEST-M005 — hr.lifecycle

**Trace:** [REQ-M005](MODULE_CATALOG.md#req-m005) → US-M005 → DES-M005 → IMP-M005. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given hr.lifecycle inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m006"></a>
### TEST-M006 — hr.benefits

**Trace:** [REQ-M006](MODULE_CATALOG.md#req-m006) → US-M006 → DES-M006 → IMP-M006. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given hr.benefits inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m007"></a>
### TEST-M007 — talent.ats

**Trace:** [REQ-M007](MODULE_CATALOG.md#req-m007) → US-M007 → DES-M007 → IMP-M007. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given talent.ats inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m008"></a>
### TEST-M008 — payroll.inputs

**Trace:** [REQ-M008](MODULE_CATALOG.md#req-m008) → US-M008 → DES-M008 → IMP-M008. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given payroll.inputs inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m009"></a>
### TEST-M009 — payroll.engine

**Trace:** [REQ-M009](MODULE_CATALOG.md#req-m009) → US-M009 → DES-M009 → IMP-M009. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given payroll.engine inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m010"></a>
### TEST-M010 — workforce.time

**Trace:** [REQ-M010](MODULE_CATALOG.md#req-m010) → US-M010 → DES-M010 → IMP-M010. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given workforce.time inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m011"></a>
### TEST-M011 — workforce.schedule

**Trace:** [REQ-M011](MODULE_CATALOG.md#req-m011) → US-M011 → DES-M011 → IMP-M011. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given workforce.schedule inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m012"></a>
### TEST-M012 — experience.portal

**Trace:** [REQ-M012](MODULE_CATALOG.md#req-m012) → US-M012 → DES-M012 → IMP-M012. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given experience.portal inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m013"></a>
### TEST-M013 — experience.engagement

**Trace:** [REQ-M013](MODULE_CATALOG.md#req-m013) → US-M013 → DES-M013 → IMP-M013. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given experience.engagement inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m014"></a>
### TEST-M014 — talent.performance

**Trace:** [REQ-M014](MODULE_CATALOG.md#req-m014) → US-M014 → DES-M014 → IMP-M014. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given talent.performance inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m015"></a>
### TEST-M015 — talent.learning

**Trace:** [REQ-M015](MODULE_CATALOG.md#req-m015) → US-M015 → DES-M015 → IMP-M015. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given talent.learning inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m016"></a>
### TEST-M016 — talent.compensation

**Trace:** [REQ-M016](MODULE_CATALOG.md#req-m016) → US-M016 → DES-M016 → IMP-M016. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given talent.compensation inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m017"></a>
### TEST-M017 — talent.succession

**Trace:** [REQ-M017](MODULE_CATALOG.md#req-m017) → US-M017 → DES-M017 → IMP-M017. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given talent.succession inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m018"></a>
### TEST-M018 — crm.accounts

**Trace:** [REQ-M018](MODULE_CATALOG.md#req-m018) → US-M018 → DES-M018 → IMP-M018. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given crm.accounts inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m019"></a>
### TEST-M019 — crm.sales

**Trace:** [REQ-M019](MODULE_CATALOG.md#req-m019) → US-M019 → DES-M019 → IMP-M019. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given crm.sales inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m020"></a>
### TEST-M020 — crm.success

**Trace:** [REQ-M020](MODULE_CATALOG.md#req-m020) → US-M020 → DES-M020 → IMP-M020. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given crm.success inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m021"></a>
### TEST-M021 — crm.support

**Trace:** [REQ-M021](MODULE_CATALOG.md#req-m021) → US-M021 → DES-M021 → IMP-M021. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given crm.support inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m022"></a>
### TEST-M022 — platform.automation

**Trace:** [REQ-M022](MODULE_CATALOG.md#req-m022) → US-M022 → DES-M022 → IMP-M022. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given platform.automation inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m023"></a>
### TEST-M023 — platform.analytics

**Trace:** [REQ-M023](MODULE_CATALOG.md#req-m023) → US-M023 → DES-M023 → IMP-M023. **Release:** R1 limited. **Status:** Not executed.

**Acceptance scenario:** Given platform.analytics inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m024"></a>
### TEST-M024 — platform.integrations

**Trace:** [REQ-M024](MODULE_CATALOG.md#req-m024) → US-M024 → DES-M024 → IMP-M024. **Release:** R1 CSV only. **Status:** Not executed.

**Acceptance scenario:** Given platform.integrations inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m025"></a>
### TEST-M025 — compliance.country

**Trace:** [REQ-M025](MODULE_CATALOG.md#req-m025) → US-M025 → DES-M025 → IMP-M025. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given compliance.country inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-m026"></a>
### TEST-M026 — compliance.uae

**Trace:** [REQ-M026](MODULE_CATALOG.md#req-m026) → US-M026 → DES-M026 → IMP-M026. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given compliance.uae inactive or a hard dependency missing, new commands fail; authorized retained data remains readable/exportable under its lifecycle. Activation with valid prerequisites grants only permitted actions; deactivation does not delete data. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e001"></a>
### TEST-E001 — Entitlement policy conjunction

**Trace:** [REQ-E001](ENTITLEMENT_MODEL.md#req-e001) → US-E001 → DES-E001 → IMP-E001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Direct HTTP requests, bulk endpoints and workers are denied when any gate fails even if a UI button is visible; an unrecognized feature is denied. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e002"></a>
### TEST-E002 — Versioned grants and commercial source

**Trace:** [REQ-E002](ENTITLEMENT_MODEL.md#req-e002) → US-E002 → DES-E002 → IMP-E002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A forged plan string has no effect; an expired override stops access; recomputation records the order and version used without changing role scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e003"></a>
### TEST-E003 — Module state machine

**Trace:** [REQ-E003](ENTITLEMENT_MODEL.md#req-e003) → US-E003 → DES-E003 → IMP-E003. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A failed activation returns to its prior state without orphaned grants; module-off does not erase records; a suspended module exposes a safe reason only to authorized admins. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e004"></a>
### TEST-E004 — Dependency activation and deactivation

**Trace:** [REQ-E004](ENTITLEMENT_MODEL.md#req-e004) → US-E004 → DES-E004 → IMP-E004. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Disabling crm.accounts with agency.starts active is refused without explicit cascade approval; approving the preview changes both to read_only atomically and preserves placements. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e005"></a>
### TEST-E005 — Read-only, export and retained access

**Trace:** [REQ-E005](ENTITLEMENT_MODEL.md#req-e005) → US-E005 → DES-E005 → IMP-E005. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A downgraded authorized admin exports retained placements while placement creation fails; a user who never had record permission gains none through recovery access. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e006"></a>
### TEST-E006 — Safe deactivation and queued work

**Trace:** [REQ-E006](ENTITLEMENT_MODEL.md#req-e006) → US-E006 → DES-E006 → IMP-E006. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A reminder queued before deactivation sends nothing after the transition; an already accepted external delivery is retained with its outcome and cannot be retried as a fresh action. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e007"></a>
### TEST-E007 — Retention and reactivation

**Trace:** [REQ-E007](ENTITLEMENT_MODEL.md#req-e007) → US-E007 → DES-E007 → IMP-E007. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Reactivating after a subject erasure restores no erased record; retained placements reappear after a migration check but overdue reminders are not blindly replayed. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e008"></a>
### TEST-E008 — Atomic capacity and usage metering

**Trace:** [REQ-E008](ENTITLEMENT_MODEL.md#req-e008) → US-E008 → DES-E008 → IMP-E008. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Two creates at one remaining slot result in one success and one capacity denial; failed import reservations release; duplicate usage events do not double-charge/count. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e009"></a>
### TEST-E009 — Limits, rate limits and no surprise overage

**Trace:** [REQ-E009](ENTITLEMENT_MODEL.md#req-e009) → US-E009 → DES-E009 → IMP-E009. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A 101st active placement on a 100-cap plan fails without charge; a rate-limited authorized read returns retry metadata without escalating plan rights. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e010"></a>
### TEST-E010 — Trial lifecycle

**Trace:** [REQ-E010](ENTITLEMENT_MODEL.md#req-e010) → US-E010 → DES-E010 → IMP-E010. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** At expiry direct writes and queued side effects stop; retained authorized data exports remain available; no invoice or charge is generated without order acceptance. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e011"></a>
### TEST-E011 — Upgrade, downgrade and cancellation

**Trace:** [REQ-E011](ENTITLEMENT_MODEL.md#req-e011) → US-E011 → DES-E011 → IMP-E011. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A downgrade from 500 to 100 placements with 150 active retains all 150 but blocks new creates until below cap; canceling does not destroy data or charge a hidden fee. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e012"></a>
### TEST-E012 — Add-ons, services and compliance packs

**Trace:** [REQ-E012](ENTITLEMENT_MODEL.md#req-e012) → US-E012 → DES-E012 → IMP-E012. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Buying migration service does not grant the consultant access; an unreviewed UAE pack cannot activate; a connector package cannot read an unlicensed source module. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e013"></a>
### TEST-E013 — Billing events and reconciliation

**Trace:** [REQ-E013](ENTITLEMENT_MODEL.md#req-e013) → US-E013 → DES-E013 → IMP-E013. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A duplicate or out-of-order paid/canceled event cannot resurrect revoked access or create a second grant; an R1 order change requires an authorized actor and accepted terms. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-e014"></a>
### TEST-E014 — Cache invalidation and execution enforcement

**Trace:** [REQ-E014](ENTITLEMENT_MODEL.md#req-e014) → US-E014 → DES-E014 → IMP-E014. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A live session, API token and scheduled report all stop restricted work after a revision change; stale UI state cannot complete a mutation. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r001"></a>
### TEST-R001 — Permission-preserving query and drill-down

**Trace:** [REQ-R001](REPORTING_REQUIREMENTS.md#req-r001) → US-R001 → DES-R001 → IMP-R001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Removing payroll permission removes payroll measures/fields and derived totals from charts and exports; cross-tenant rows never affect counts. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r002"></a>
### TEST-R002 — Metric semantics and snapshot consistency

**Trace:** [REQ-R002](REPORTING_REQUIREMENTS.md#req-r002) → US-R002 → DES-R002 → IMP-R002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Chart, table, drill-down and files reconcile for one snapshot; a zero denominator returns N/A rather than zero percent or error. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r003"></a>
### TEST-R003 — Visuals and accessible interaction

**Trace:** [REQ-R003](REPORTING_REQUIREMENTS.md#req-r003) → US-R003 → DES-R003 → IMP-R003. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Keyboard/chart-table interaction exposes the same values and filters; a small screen retains readable labels and no hidden inaccessible-only action. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r004"></a>
### TEST-R004 — Filters and saved views

**Trace:** [REQ-R004](REPORTING_REQUIREMENTS.md#req-r004) → US-R004 → DES-R004 → IMP-R004. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A shared view opened by a narrower user contains only that user's rows; deleted dimensions show a safe migration message rather than silently changing meaning. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r005"></a>
### TEST-R005 — Protected multi-format exports

**Trace:** [REQ-R005](REPORTING_REQUIREMENTS.md#req-r005) → US-R005 → DES-R005 → IMP-R005. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Revoking a user/module permission before download makes an existing link unusable; all three formats reconcile and contain no unshared column. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r006"></a>
### TEST-R006 — Export content safety and size

**Trace:** [REQ-R006](REPORTING_REQUIREMENTS.md#req-r006) → US-R006 → DES-R006 → IMP-R006. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A candidate name beginning with an equals sign remains literal text in spreadsheet output; 5,001 rows fails explicitly; malicious markup does not run during PDF generation. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r007"></a>
### TEST-R007 — Scheduled report definitions

**Trace:** [REQ-R007](REPORTING_REQUIREMENTS.md#req-r007) → US-R007 → DES-R007 → IMP-R007. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A schedule lacking its add-on or source access cannot activate; a client address outside tenant membership cannot be added as a general recipient. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r008"></a>
### TEST-R008 — Schedule execution and recipient scope

**Trace:** [REQ-R008](REPORTING_REQUIREMENTS.md#req-r008) → US-R008 → DES-R008 → IMP-R008. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Two recipients with different team scopes receive different permissible rows; removing a recipient before execution suppresses delivery; DST does not create duplicate runs. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r009"></a>
### TEST-R009 — Freshness and reconciliation

**Trace:** [REQ-R009](REPORTING_REQUIREMENTS.md#req-r009) → US-R009 → DES-R009 → IMP-R009. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A failed import leaves the prior snapshot explicitly stale and counts unchanged; known fixture totals match after a successful refresh. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-r010"></a>
### TEST-R010 — Report catalog, limits and audit

**Trace:** [REQ-R010](REPORTING_REQUIREMENTS.md#req-r010) → US-R010 → DES-R010 → IMP-R010. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Concurrent export requests cannot exceed the cap; failed generation releases a reservation; recovery export works after downgrade with authorized fields. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k001"></a>
### TEST-K001 — Confirmed starts

**Trace:** [REQ-K001](KPI_CATALOG.md#req-k001) → US-K001 → DES-K001 → IMP-K001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: two distinct confirmed placements start inside the period, one outside, one canceled, and a join duplicates one in-period row. Expected confirmed starts = 2.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k002"></a>
### TEST-K002 — On-time start rate

**Trace:** [REQ-K002](KPI_CATALOG.md#req-k002) → US-K002 → DES-K002 → IMP-K002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: original-date cohort has 3 started placements (2 on/before original date, 1 late), 1 canceled and 1 unresolved. Expected on-time rate = 2/3 = 66.67% at two-decimal display; canceled and unresolved counts each = 1. A revised planned date does not change the denominator or original deadline.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k003"></a>
### TEST-K003 — Overdue mandatory tasks

**Trace:** [REQ-K003](KPI_CATALOG.md#req-k003) → US-K003 → DES-K003 → IMP-K003. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: 2 overdue required open tasks, 1 overdue optional task, 1 future required task, 1 completed required task and 1 overdue task on a canceled placement. Expected count = 2.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k004"></a>
### TEST-K004 — Start slippage

**Trace:** [REQ-K004](KPI_CATALOG.md#req-k004) → US-K004 → DES-K004 → IMP-K004. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: three eligible completed starts have offsets −1, 0 and +6 calendar days from the original plan. Clamped delays are 0, 0 and 6; expected median = 0 days, and 2/3 are on-time/early.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k005"></a>
### TEST-K005 — Active headcount

**Trace:** [REQ-K005](KPI_CATALOG.md#req-k005) → US-K005 → DES-K005 → IMP-K005. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: 2 people hold 3 effective active employments; one future employment and one terminated employment are excluded. Expected employment headcount = 3 and separately labelled people count = 2.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k006"></a>
### TEST-K006 — Employee turnover

**Trace:** [REQ-K006](KPI_CATALOG.md#req-k006) → US-K006 → DES-K006 → IMP-K006. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: 2 approved exits occur in a period whose daily active headcount mean is 20. Expected turnover = 10%; no-headcount fixture yields N/A.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k007"></a>
### TEST-K007 — HR lifecycle completion

**Trace:** [REQ-K007](KPI_CATALOG.md#req-k007) → US-K007 → DES-K007 → IMP-K007. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: four closed due-cohort cases include 3 on-time and 1 late; one canceled and one still-open case are separately shown. Expected closed-case completion = 75%.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k008"></a>
### TEST-K008 — HR request backlog

**Trace:** [REQ-K008](KPI_CATALOG.md#req-k008) → US-K008 → DES-K008 → IMP-K008. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: 2 open requests are aged 1 and 5 days; a completed and a canceled request are excluded. Expected backlog = 2 with ages 1 and 5, never pooled from another tenant.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k009"></a>
### TEST-K009 — Payroll input completeness

**Trace:** [REQ-K009](KPI_CATALOG.md#req-k009) → US-K009 → DES-K009 → IMP-K009. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: batch has 4 eligible workers; 3 have every required input approved, one lacks required approval. Expected completeness = 75%, with the fourth worker in the exception detail.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k010"></a>
### TEST-K010 — Payroll unresolved exceptions

**Trace:** [REQ-K010](KPI_CATALOG.md#req-k010) → US-K010 → DES-K010 → IMP-K010. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: 2 required unresolved discrepancies, 1 optional unresolved discrepancy and 1 resolved discrepancy. Expected required unresolved exceptions = 2.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k011"></a>
### TEST-K011 — Approved net payroll

**Trace:** [REQ-K011](KPI_CATALOG.md#req-k011) → US-K011 → DES-K011 → IMP-K011. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: eligible finalized lines total AED 10,000 and USD 2,000; a draft AED 500 and superseded AED 300 are excluded. Expected separate amounts AED 10,000 and USD 2,000 with no blended total.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k012"></a>
### TEST-K012 — Shift coverage

**Trace:** [REQ-K012](KPI_CATALOG.md#req-k012) → US-K012 → DES-K012 → IMP-K012. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: two shifts each require 8 hours; first has 10 staffed hours and second 4. Capped coverage is (8+4)/(8+8) = 75%, with 2 overstaffed hours shown separately.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k013"></a>
### TEST-K013 — Pending team approvals

**Trace:** [REQ-K013](KPI_CATALOG.md#req-k013) → US-K013 → DES-K013 → IMP-K013. **Release:** R2 limited. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: actor has 2 pending assigned approvals and 1 pending currently delegated approval; one completed and one other-team approval are excluded. Expected count = 3.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k014"></a>
### TEST-K014 — Leave balance

**Trace:** [REQ-K014](KPI_CATALOG.md#req-k014) → US-K014 → DES-K014 → IMP-K014. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: posted grants 10 days, adjustment +2 days, consumed 3 days, pending reservation 2 days. Expected posted balance = 9 days and pending reserved = 2 days, with policy-defined available = 7 only if separately labelled.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k015"></a>
### TEST-K015 — Employee request status

**Trace:** [REQ-K015](KPI_CATALOG.md#req-k015) → US-K015 → DES-K015 → IMP-K015. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: own requests contain 2 pending, 1 approved and 1 completed; another employee has 4 pending. Expected own grouped counts 2/1/1 and no contribution from the other employee.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k016"></a>
### TEST-K016 — Sales pipeline value

**Trace:** [REQ-K016](KPI_CATALOG.md#req-k016) → US-K016 → DES-K016 → IMP-K016. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: open AED opportunities are 100 in qualified and 200 in proposal; USD 50 is separate; a won AED 500 is excluded. Expected AED stage totals 100/200 and separate USD 50.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k017"></a>
### TEST-K017 — Sales win rate

**Trace:** [REQ-K017](KPI_CATALOG.md#req-k017) → US-K017 → DES-K017 → IMP-K017. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: the period has 3 won and 2 lost terminal decisions plus 4 open opportunities. Expected win rate = 3/5 = 60%; open opportunities do not enter denominator.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k018"></a>
### TEST-K018 — Renewal rate

**Trace:** [REQ-K018](KPI_CATALOG.md#req-k018) → US-K018 → DES-K018 → IMP-K018. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: four renewable contracts are due in period; 3 renew and 1 remains pending. A nonrenewable contract is separately shown and excluded. Expected renewal rate = 75% with pending = 1.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k019"></a>
### TEST-K019 — Customer health coverage

**Trace:** [REQ-K019](KPI_CATALOG.md#req-k019) → US-K019 → DES-K019 → IMP-K019. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: five managed active accounts include 3 valid current health snapshots, 1 stale and 1 missing. Expected coverage = 60%; stale/missing are unknown rather than low scores.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k020"></a>
### TEST-K020 — First human response time

**Trace:** [REQ-K020](KPI_CATALOG.md#req-k020) → US-K020 → DES-K020 → IMP-K020. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: first qualifying human responses occur after 10, 20 and 60 business minutes; an automated acknowledgment and an unreplied ticket do not enter the median. Expected median = 20 and unreplied count = 1.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k021"></a>
### TEST-K021 — Resolution SLA attainment

**Trace:** [REQ-K021](KPI_CATALOG.md#req-k021) → US-K021 → DES-K021 → IMP-K021. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: four eligible resolved tickets include 3 within their captured SLA budgets and 1 breach, plus 1 pending ticket separately shown. Expected attainment = 75%.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-k022"></a>
### TEST-K022 — Customer satisfaction

**Trace:** [REQ-K022](KPI_CATALOG.md#req-k022) → US-K022 → DES-K022 → IMP-K022. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** Given a fixture containing eligible, excluded, duplicate-join and unauthorized rows, the result follows the stated formula exactly once per entity; drill-down and exports reconcile. Empty denominators are N/A, unauthorized rows contribute nothing, and stale sources are labelled. Fixture: five unique valid ratings are 5,4,3,2,1 and a callback duplicates the 5. Expected positive share = 2/5 = 40%, response count = 5; a filtered four-response cohort is suppressed.

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d001"></a>
### TEST-D001 — Executives dashboard

**Trace:** [REQ-D001](REPORTING_REQUIREMENTS.md#req-d001) → US-D001 → DES-D001 → IMP-D001. **Release:** R1 agency KPIs only. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped executives fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d002"></a>
### TEST-D002 — HR leadership dashboard

**Trace:** [REQ-D002](REPORTING_REQUIREMENTS.md#req-d002) → US-D002 → DES-D002 → IMP-D002. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped hr leadership fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d003"></a>
### TEST-D003 — HR operations dashboard

**Trace:** [REQ-D003](REPORTING_REQUIREMENTS.md#req-d003) → US-D003 → DES-D003 → IMP-D003. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped hr operations fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d004"></a>
### TEST-D004 — Recruiters dashboard

**Trace:** [REQ-D004](REPORTING_REQUIREMENTS.md#req-d004) → US-D004 → DES-D004 → IMP-D004. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped recruiters fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d005"></a>
### TEST-D005 — Payroll teams dashboard

**Trace:** [REQ-D005](REPORTING_REQUIREMENTS.md#req-d005) → US-D005 → DES-D005 → IMP-D005. **Release:** R2 inputs; amounts later. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped payroll teams fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d006"></a>
### TEST-D006 — Line managers dashboard

**Trace:** [REQ-D006](REPORTING_REQUIREMENTS.md#req-d006) → US-D006 → DES-D006 → IMP-D006. **Release:** R2 approvals; scheduling later. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped line managers fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d007"></a>
### TEST-D007 — Employees dashboard

**Trace:** [REQ-D007](REPORTING_REQUIREMENTS.md#req-d007) → US-D007 → DES-D007 → IMP-D007. **Release:** R2. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped employees fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d008"></a>
### TEST-D008 — Sales teams dashboard

**Trace:** [REQ-D008](REPORTING_REQUIREMENTS.md#req-d008) → US-D008 → DES-D008 → IMP-D008. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped sales teams fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d009"></a>
### TEST-D009 — Customer success dashboard

**Trace:** [REQ-D009](REPORTING_REQUIREMENTS.md#req-d009) → US-D009 → DES-D009 → IMP-D009. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped customer success fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-d010"></a>
### TEST-D010 — Support teams dashboard

**Trace:** [REQ-D010](REPORTING_REQUIREMENTS.md#req-d010) → US-D010 → DES-D010 → IMP-D010. **Release:** Later. **Status:** Not executed.

**Acceptance scenario:** A correctly scoped support teams fixture shows exactly the allowed KPI widgets and rows; removing any source permission removes its widget and exports; saved views and drill-down do not widen scope. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-l001"></a>
### TEST-L001 — R1 explicit scope

**Trace:** [REQ-L001](MVP_SCOPE.md#req-l001) → US-L001 → DES-L001 → IMP-L001. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** An administrator cannot activate a Later feature by editing a plan; every R1 end-to-end workflow passes with Later modules absent. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-l002"></a>
### TEST-L002 — Discovery and commercial gate

**Trace:** [REQ-L002](MVP_SCOPE.md#req-l002) → US-L002 → DES-L002 → IMP-L002. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A launch checklist missing customer evidence is marked unmet and cannot be represented as validated; a positive interview alone cannot set paid-demand status. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-l003"></a>
### TEST-L003 — Security, retention and recovery gate

**Trace:** [REQ-L003](MVP_SCOPE.md#req-l003) → US-L003 → DES-L003 → IMP-L003. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A critical authorization defect, missing retention schedule or failed restore blocks production release; a document upload route stays disabled. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-l004"></a>
### TEST-L004 — End-to-end workflow gate

**Trace:** [REQ-L004](MVP_SCOPE.md#req-l004) → US-L004 → DES-L004 → IMP-L004. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** The scenario reaches a confirmed start with correct history/KPIs and files; negative paths deny access, preserve data and require explicit retry/recovery without duplicate effects. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-l005"></a>
### TEST-L005 — Capacity and observability gate

**Trace:** [REQ-L005](MVP_SCOPE.md#req-l005) → US-L005 → DES-L005 → IMP-L005. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** Concurrent near-cap requests cannot exceed capacity, 1,001-row import and 5,001-row export fail explicitly, and alerts expose failed reminders without revealing private content. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.

<a id="test-l006"></a>
### TEST-L006 — Traceability and change control gate

**Trace:** [REQ-L006](MVP_SCOPE.md#req-l006) → US-L006 → DES-L006 → IMP-L006. **Release:** R1. **Status:** Not executed.

**Acceptance scenario:** A release requirement with no implemented artifact or executed test evidence blocks completion; duplicate IDs, broken links and unregistered scope additions are rejected. 

**Evidence required:** automated assertions or a documented repeatable scenario covering success and denial/boundary outcomes; link actual implementation and current-run results when available. Cross-tenant, off-module and out-of-scope access must contribute no unauthorized rows or side effects.


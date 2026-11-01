# Realistic first release and staged scope

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## R1 product

R1 is a multi-tenant accepted-placement coordination workspace for UAE permanent-recruitment agencies using an existing ATS. It keeps client/candidate references, milestones, task ownership, controlled client participation, exceptions, human readiness/start decisions and permission-aware operational reports. Candidate self-service and document-file uploads are excluded; record only necessary contact/status metadata and safe notes. Do not collect passport, medical, bank or permit-document copies in this release.

This specification is authorized planning work. Building features, contacting customers, buying services, publishing an environment and production deployment are outside this task. The initial evidence remains provisional; regulatory and commercial claims are not approved merely because Phase 1 was requested.

## Release manifest

| Scope | Included R1 requirement IDs | Explicit boundary |
|---|---|---|
| Core controls | REQ-P001–REQ-P012; REQ-E001–REQ-E014, limited to their R1 clauses | Full isolation/authorization/audit/retention; order-based grants. Automated payment provider integration and automated overages later |
| Agency work | First three agency features in FEATURE_CATALOG.md | Accepted placement → tasks/exceptions → agency-reviewed ready → confirmed start; client task participation only |
| CRM | Client-reference feature only | Minimal client/work-contact/owner references; no opportunities, quotes, contracts, marketing or broad CRM import |
| Data entry | CSV placement-import feature and manual entry | 1,000 rows/batch, atomic preview/commit; no native ATS connector or public API |
| Reminders | Fixed reminder feature bundled with agency.starts | Daily task digest with safe retries; no custom rule builder, SMS/WhatsApp or bulk campaigns |
| Reporting | REQ-R001–REQ-R006, REQ-R009–REQ-R010; REQ-K001–REQ-K004; REQ-D001 and REQ-D004 agency views | Cards/bar/table, drill-down, private/team saved views, PDF/CSV/XLSX exports; no scheduled delivery or custom SQL |
| Modules | platform.core, crm.accounts, agency.starts, platform.analytics (limited), platform.integrations (CSV only) | Parent platform.automation is not activated just to send the bundled fixed reminder |

Feature IDs are enumerated in the manifest below to avoid relying on display-name matching. No later feature inherits R1 eligibility from a parent module being available.

| Feature | Requirement | R1 slice |
|---|---|---|
| Accepted-placement entry | REQ-F001 | R1 |
| Owned handoffs and exceptions | REQ-F002 | R1 |
| Scoped client participation and readiness | REQ-F003 | R1 |
| Client accounts and contacts | REQ-F029 | R1 |
| Reliable reminders and delivery | REQ-F038 | R1 bundled only |
| Permission-aware operational reporting | REQ-F039 | R1 limited |
| Validated CSV placement imports | REQ-F040 | R1 |

## Later roadmap, not first-release commitments

R2 candidates: employee master, leave/lifecycle/self-service, time approval and payroll-input exceptions. These require a separate customer/buyer case, data-classification expansion and provider/entity review. Later vision: full ATS, payroll calculation/statements, shift scheduling, benefits/expenses, engagement/employee cases, performance/calibration, learning/skills/succession, compensation, full CRM sales/CS/support, country rules, document-file storage, public APIs/native connectors, scheduled reports and self-service billing automation.

No immigration decisions, legal-employer service, labor supply, government submission, payment execution, professional-license verification, autonomous employment decisions or claim of universal UAE compliance is in R1. Adding any requires a separately approved requirements and legal/service scope.

## R1 user journey and delivery sequence

1. Establish tenant, verified owner, explicit role/scopes, accepted trial/order and retention schedule. Provision core and minimal enabled modules.
2. Create client references and a minimal candidate reference; dry-run an existing-placement CSV and commit within quota, or enter manually.
3. Instantiate a versioned milestone checklist; assign internal tasks and invite one scoped client contact to permitted tasks.
4. Track due/overdue work and exceptions; send the fixed minimal digest. Human agency review marks ready only after mandatory completion/waiver.
5. Confirm actual start independently; preserve original and revised plans. Inspect KPIs and export the same authorized snapshot in three formats.
6. Demonstrate module-off read-only/export, safe stopped jobs and reactivation without deletion/replayed effects.

Build sequencing recommendation for a future authorized coding phase: first tenant/auth/policy/entitlement/audit foundation, then placement model and validated import, then tasks/participant boundaries/reminders, then reporting/export and integrated hardening. Each stage has a verified vertical slice. No delivery dates are promised: team capacity, stack, existing infrastructure and integrations are unknown.

## Proposed limits and success criteria

Use the plan table in MODULE_CATALOG.md and technical envelope in REQ-P008, not a second independent set of caps. Correctness, privacy, quota safety, recovery and complete workflow tests are binary launch gates. Business targets such as reduced chasing or improved starts need observed baselines and preventable-cause analysis before target values are chosen; KPI availability alone does not prove customer value.

## Release requirements and gates

<a id="req-l001"></a>
### REQ-L001 — R1 explicit scope

**Requirement:** Ship only the R1 feature IDs and bounded platform/reporting contracts listed below; label every unimplemented/later module unavailable rather than exposing a nonfunctional purchased feature.

**Story:** US-L001 — As the product owner, I want a bounded release so that the product delivers one coherent agency workflow.

<a id="des-l001"></a>
**Design DES-L001:** Release manifest r1.agency_start.v1 is an allowlist of feature/KPI/module IDs and supported operations; server release gate is independent from plan grants.

<a id="imp-l001"></a>
**Implementation IMP-L001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-L001](ACCEPTANCE_CRITERIA.md#test-l001). **Release:** R1.

<a id="req-l002"></a>
### REQ-L002 — Discovery and commercial gate

**Requirement:** Before public/commercial launch, corroborate the agency problem and incumbent gap, obtain named buyer commitments and confirm lawful data/participant access; lack of evidence does not block drafting requirements but blocks a product–market-fit claim.

**Story:** US-L002 — As the founder, I want evidence before a commercial launch so that a provisional research hypothesis is not mistaken for demand.

<a id="des-l002"></a>
**Design DES-L002:** Gate record links customer evidence and alternative tests from Phase 0; proposed threshold remains five independent recurring cases, three artifacts and two specific paid-evaluation commitments, followed by actual payment before claiming willingness to pay.

<a id="imp-l002"></a>
**Implementation IMP-L002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-L002](ACCEPTANCE_CRITERIA.md#test-l002). **Release:** R1.

<a id="req-l003"></a>
### REQ-L003 — Security, retention and recovery gate

**Requirement:** Before production require tenant-isolation/permission tests, independent security review, approved retention/data terms, verified notification handling, restore exercise and reviewed critical findings.

**Story:** US-L003 — As a release owner, I want demonstrated production controls so that customer data is safe before activation.

<a id="des-l003"></a>
**Design DES-L003:** Gate artifact records environment, test version, fixture counts, performance/recovery results, defects and approver; no S3 document-file collection is supported in R1.

<a id="imp-l003"></a>
**Implementation IMP-L003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-L003](ACCEPTANCE_CRITERIA.md#test-l003). **Release:** R1.

<a id="req-l004"></a>
### REQ-L004 — End-to-end workflow gate

**Requirement:** Validate CSV dry-run/atomic import, client invitation, owned tasks, exception resolution, readiness approval, actual start, KPI reconciliation, all export formats and module deactivation/reactivation in one isolated tenant fixture.

**Story:** US-L004 — As an agency operator, I want one complete operational scenario so that individual feature checks do not hide broken handoffs.

<a id="des-l004"></a>
**Design DES-L004:** Use two tenants, two clients, internal recruiter/manager, scoped client participant and removed member. Include expired invite, incomplete task, duplicate import, quota conflict, stale session and failed email delivery.

<a id="imp-l004"></a>
**Implementation IMP-L004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-L004](ACCEPTANCE_CRITERIA.md#test-l004). **Release:** R1.

<a id="req-l005"></a>
### REQ-L005 — Capacity and observability gate

**Requirement:** Validate the R1 load envelope, quota races, import/export bounds, monitoring, audit integrity and failure recovery; publish known limitations with no unsupported SLA claims.

**Story:** US-L005 — As an engineering release owner, I want load and operational signals so that the first release has realistic limits.

<a id="des-l005"></a>
**Design DES-L005:** Record p95 and error rate under proposed envelope, queue lag/dedup tests and operational runbooks; release requires tested safe limits, not simply a successful build.

<a id="imp-l005"></a>
**Implementation IMP-L005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-L005](ACCEPTANCE_CRITERIA.md#test-l005). **Release:** R1.

<a id="req-l006"></a>
### REQ-L006 — Traceability and change control gate

**Requirement:** Maintain unique stable requirement/story/design/implementation/test IDs; changes update affected dependency, entitlement, KPI and release records. Mark planned work and specified tests honestly until code/evidence exists.

**Story:** US-L006 — As the product owner, I want maintained requirement links so that implementation and verification remain reviewable.

<a id="des-l006"></a>
**Design DES-L006:** USER_STORIES.md is the traceability registry. Each planned IMP record must gain an actual file/PR/commit when built; each TEST record gains runner/case/result evidence without recycling IDs. Retired records retain their identity/history.

<a id="imp-l006"></a>
**Implementation IMP-L006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-L006](ACCEPTANCE_CRITERIA.md#test-l006). **Release:** R1.


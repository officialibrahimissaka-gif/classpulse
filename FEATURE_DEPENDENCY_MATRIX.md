# Feature and module dependency matrix

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Canonical dependency interpretation

This matrix is a design view of REQ-E004 and the module/feature contracts, not an additional undocumented set of requirements. Hard dependencies are activation prerequisites and form a directed acyclic graph. Soft edges activate a connector/action only when both endpoints are entitled and authorized; losing a soft edge pauses that workflow and exposes an exception, without disabling the source module. All modules except platform.core implicitly depend on platform.core.

Payroll inputs can use manual/provider data without time/leave modules. The country framework depends on HR records, not payroll, so payroll.engine → compliance.country → hr.records is acyclic. payroll.inputs does not hard-depend on compliance.uae: a reviewed provider-specific non-calculation export can be configured separately; UAE-regulated outputs require the relevant reviewed pack before support is claimed. The fixed R1 reminder worker is bundled with agency.starts and does not require the optional automation builder.

| Module | Hard prerequisites beyond core | Optional/soft relationships | Failure/disable behavior | Module requirement |
|---|---|---|---|---|
| platform.core | None | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M001](MODULE_CATALOG.md#req-m001) |
| agency.starts | crm.accounts | talent.ats accepted-offer event; platform.integrations CSV/API; platform.analytics views | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M002](MODULE_CATALOG.md#req-m002) |
| hr.records | None | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M003](MODULE_CATALOG.md#req-m003) |
| hr.leave | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M004](MODULE_CATALOG.md#req-m004) |
| hr.lifecycle | hr.records | platform.integrations access-revocation connector; payroll.engine settlement | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M005](MODULE_CATALOG.md#req-m005) |
| hr.benefits | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M006](MODULE_CATALOG.md#req-m006) |
| talent.ats | crm.accounts | agency.starts accepted-offer handoff; hr.lifecycle explicit hire conversion | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M007](MODULE_CATALOG.md#req-m007) |
| payroll.inputs | hr.records | workforce.time, hr.leave, provider connectors, reviewed compliance.uae adapter if applicable | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M008](MODULE_CATALOG.md#req-m008) |
| payroll.engine | payroll.inputs, compliance.country | compliance.uae reviewed instance where applicable; experience.portal statement delivery | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M009](MODULE_CATALOG.md#req-m009) |
| workforce.time | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M010](MODULE_CATALOG.md#req-m010) |
| workforce.schedule | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M011](MODULE_CATALOG.md#req-m011) |
| experience.portal | hr.records | hr.leave, payroll.engine, hr.lifecycle source features | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M012](MODULE_CATALOG.md#req-m012) |
| experience.engagement | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M013](MODULE_CATALOG.md#req-m013) |
| talent.performance | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M014](MODULE_CATALOG.md#req-m014) |
| talent.learning | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M015](MODULE_CATALOG.md#req-m015) |
| talent.compensation | hr.records | payroll.inputs approved effective-dated change | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M016](MODULE_CATALOG.md#req-m016) |
| talent.succession | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M017](MODULE_CATALOG.md#req-m017) |
| crm.accounts | None | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M018](MODULE_CATALOG.md#req-m018) |
| crm.sales | crm.accounts | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M019](MODULE_CATALOG.md#req-m019) |
| crm.success | crm.accounts | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M020](MODULE_CATALOG.md#req-m020) |
| crm.support | crm.accounts | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M021](MODULE_CATALOG.md#req-m021) |
| platform.automation | None | Each configured rule trigger/action source module | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M022](MODULE_CATALOG.md#req-m022) |
| platform.analytics | None | Any registered active/read-only source module; no wildcard permission grant | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M023](MODULE_CATALOG.md#req-m023) |
| platform.integrations | None | Each connector/import source/target module; API package | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M024](MODULE_CATALOG.md#req-m024) |
| compliance.country | hr.records | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M025](MODULE_CATALOG.md#req-m025) |
| compliance.uae | compliance.country | Only explicitly configured integrations; none implied | Block new commands; preserve scoped archive/export; active hard dependents require approved atomic read_only transition | [REQ-M026](MODULE_CATALOG.md#req-m026) |

## Feature dependencies and release mapping

All feature rows additionally inherit core security, their parent module, REQ-E001–REQ-E014 and relevant reporting/retention contracts. Dependency on a restricted data field requires its separate permission even if the linked record is visible.

| Feature requirement | Parent module | Submodule | Additional cross-feature relationship | Release |
|---|---|---|---|---|
| REQ-F001 | agency.starts | Placement registry | talent.ats accepted-offer event; platform.integrations CSV/API; platform.analytics views | R1 |
| REQ-F002 | agency.starts | Milestones and tasks | talent.ats accepted-offer event; platform.integrations CSV/API; platform.analytics views | R1 |
| REQ-F003 | agency.starts | Readiness and collaboration | talent.ats accepted-offer event; platform.integrations CSV/API; platform.analytics views | R1 |
| REQ-F004 | hr.records | Employment master | Parent module contracts and record-scoped permissions; no further hard feature edge | R2 |
| REQ-F005 | hr.records | Documents | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F006 | hr.leave | Policies and requests | Parent module contracts and record-scoped permissions; no further hard feature edge | R2 |
| REQ-F007 | hr.leave | Absence corrections | Parent module contracts and record-scoped permissions; no further hard feature edge | R2 |
| REQ-F008 | hr.lifecycle | Joiner and mover | platform.integrations access-revocation connector; payroll.engine settlement | R2 |
| REQ-F009 | hr.lifecycle | Leaver | platform.integrations access-revocation connector; payroll.engine settlement | R2 |
| REQ-F010 | hr.benefits | Enrollment and reimbursement | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F011 | talent.ats | Requisition and pipeline | agency.starts accepted-offer handoff; hr.lifecycle explicit hire conversion | Later |
| REQ-F012 | talent.ats | Interview and offer | agency.starts accepted-offer handoff; hr.lifecycle explicit hire conversion | Later |
| REQ-F013 | payroll.inputs | Input collection | workforce.time, hr.leave, provider connectors, reviewed compliance.uae adapter if applicable | R2 |
| REQ-F014 | payroll.inputs | Provider handoff | workforce.time, hr.leave, provider connectors, reviewed compliance.uae adapter if applicable | R2 |
| REQ-F015 | payroll.engine | Calculation and approval | compliance.uae reviewed instance where applicable; experience.portal statement delivery | Later |
| REQ-F016 | payroll.engine | Statements and settlement | compliance.uae reviewed instance where applicable; experience.portal statement delivery | Later |
| REQ-F017 | workforce.time | Collection | Parent module contracts and record-scoped permissions; no further hard feature edge | R2 |
| REQ-F018 | workforce.time | Approval and handoff | Parent module contracts and record-scoped permissions; no further hard feature edge | R2 |
| REQ-F019 | workforce.schedule | Planning | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F020 | workforce.schedule | Changes | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F021 | experience.portal | Self-service | hr.leave, payroll.engine, hr.lifecycle source features | R2 |
| REQ-F022 | experience.portal | Notifications | hr.leave, payroll.engine, hr.lifecycle source features | R2 |
| REQ-F023 | experience.engagement | Feedback and employee relations | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F024 | talent.performance | Goals and reviews | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F025 | talent.performance | Calibration | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F026 | talent.learning | Assignments and credentials | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F027 | talent.compensation | Budget and approvals | payroll.inputs approved effective-dated change | Later |
| REQ-F028 | talent.succession | Skills and succession | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F029 | crm.accounts | Client references | Parent module contracts and record-scoped permissions; no further hard feature edge | R1 |
| REQ-F030 | crm.accounts | Commercial relationships | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F031 | crm.sales | Opportunities | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F032 | crm.sales | Quotes and forecasting | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F033 | crm.success | Customer plans | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F034 | crm.success | Health and renewals | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F035 | crm.support | Tickets and queues | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F036 | crm.support | Knowledge and service quality | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F037 | platform.automation | Rules and approvals | Each configured rule trigger/action source module | Later |
| REQ-F038 | agency.starts | Notifications | talent.ats accepted-offer event; platform.integrations CSV/API; platform.analytics views | R1 bundled only |
| REQ-F039 | platform.analytics | Views and snapshots | Any registered active/read-only source module; no wildcard permission grant | R1 limited |
| REQ-F040 | platform.integrations | Imports | Each connector/import source/target module; API package | R1 |
| REQ-F041 | platform.integrations | APIs and connectors | Each connector/import source/target module; API package | Later |
| REQ-F042 | compliance.country | Rule governance | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F043 | compliance.uae | UAE regimes and provider formats | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F044 | talent.ats | Sourcing and careers | agency.starts accepted-offer handoff; hr.lifecycle explicit hire conversion | Later |
| REQ-F045 | talent.ats | Candidate experience | agency.starts accepted-offer handoff; hr.lifecycle explicit hire conversion | Later |
| REQ-F046 | hr.records | Organization and positions | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F047 | hr.lifecycle | Assets and access | platform.integrations access-revocation connector; payroll.engine settlement | Later |
| REQ-F048 | workforce.time | Assignments and client time | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F049 | talent.learning | Content and programs | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |
| REQ-F050 | experience.portal | Communication and directory | hr.leave, payroll.engine, hr.lifecycle source features | Later |
| REQ-F051 | crm.sales | Revenue handoff | Parent module contracts and record-scoped permissions; no further hard feature edge | Later |

## Representative activation decisions

These examples exercise TEST-E004, TEST-E006 and TEST-E014. Enabling agency.starts can offer crm.accounts in the same reviewed subscription change but cannot silently purchase it. Turning off crm.accounts while agency.starts is active is refused until the explicit dependent transition is approved. Turning off payroll.inputs pauses its time handoff, not attendance collection. Turning off a source module invalidates active write/report jobs; retained report access follows REQ-E005 and source permissions. Unreviewed country packs remain unavailable regardless of a plan override. A dependency graph cycle is a catalog validation failure that blocks publication of the affected catalog version.

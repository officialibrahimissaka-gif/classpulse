# Module catalog and commercial packaging

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Module registry

Identifiers are stable and never reused for another purpose. Dependencies refer to registered modules; aliases and display-name translations do not change identity. Each module contract inherits REQ-E001–REQ-E014 in ENTITLEMENT_MODEL.md. Module descriptions state intended business value, not measured outcomes. All prices and limits are proposed strategy; no numeric price has been validated.

Module permission rows list primary controls; the complete required-action set is their union with the feature-specific permissions in FEATURE_CATALOG.md, scoped per endpoint rather than requiring all listed permissions for every action.

All modules use server-side entitlements on every endpoint, including exports, reports, service accounts and background jobs. API tokens have no broader rights than their tenant principal. R1 uses only internal application APIs and CSV; public API packages are later. Global retention, holds and deletion override module defaults. An add-on never bypasses dependencies or country-review gates.

<a id="req-m001"></a>
### REQ-M001 — platform.core

**Requirement:** Provide platform.core only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M001 — As a tenant administrator, I want to configure core platform so that access matches our purchased workflow.

<a id="des-m001"></a>
**Design DES-M001:** Activation is a versioned tenant-module record for platform.core; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m001"></a>
**Implementation IMP-M001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M001](ACCEPTANCE_CRITERIA.md#test-m001). **Release:** R1.

| Contract field | platform.core |
|---|---|
| Domain / business value | Platform: Company identity, governance, commercial access and audit |
| Hard dependencies | None; always provisioned while tenant exists |
| Entitlements | module.platform.core.read; module.platform.core.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | tenant.manage, roles.manage, billing.manage, audit.read; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-AUDIT plus record-specific schedules; holds/subject requests/global backup expiry apply |
| Pricing strategy | Included platform base; no per-security-control surcharge |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R1; activation unavailable before supported release and validation |

**Core exception (REQ-M001 / REQ-E003):** core is automatically provisioned with tenant setup and cannot be independently disabled. Its deactivation/read-only rows apply only to whole-tenant closure and the authorized exit window; individual operational modules use the ordinary lifecycle. Billing/tenant-security recovery survives commercial cancellation through a separately verified control path.

<a id="req-m002"></a>
### REQ-M002 — agency.starts

**Requirement:** Provide agency.starts only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M002 — As a tenant administrator, I want to configure placement-to-start so that access matches our purchased workflow.

<a id="des-m002"></a>
**Design DES-M002:** Activation is a versioned tenant-module record for agency.starts; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m002"></a>
**Implementation IMP-M002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M002](ACCEPTANCE_CRITERIA.md#test-m002). **Release:** R1.

| Contract field | agency.starts |
|---|---|
| Domain / business value | Recruitment operations: Coordinate accepted placements with clients and owners |
| Hard dependencies | platform.core, crm.accounts |
| Entitlements | module.agency.starts.read; module.agency.starts.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | placements.read, placements.write, placements.decide, participants.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S2; T-OPS / T-PERSON; holds/subject requests/global backup expiry apply |
| Pricing strategy | Organization base plus active-placement capacity |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R1; activation unavailable before supported release and validation |

<a id="req-m003"></a>
### REQ-M003 — hr.records

**Requirement:** Provide hr.records only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M003 — As a tenant administrator, I want to configure employee master so that access matches our purchased workflow.

<a id="des-m003"></a>
**Design DES-M003:** Activation is a versioned tenant-module record for hr.records; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m003"></a>
**Implementation IMP-M003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M003](ACCEPTANCE_CRITERIA.md#test-m003). **Release:** R2.

| Contract field | hr.records |
|---|---|
| Domain / business value | HRMS: Maintain entity-scoped employment records |
| Hard dependencies | platform.core |
| Entitlements | module.hr.records.read; module.hr.records.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | employees.read, employees.write, employees.restricted.read; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR; holds/subject requests/global backup expiry apply |
| Pricing strategy | Active employee bands |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R2; activation unavailable before supported release and validation |

<a id="req-m004"></a>
### REQ-M004 — hr.leave

**Requirement:** Provide hr.leave only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M004 — As a tenant administrator, I want to configure leave and absence so that access matches our purchased workflow.

<a id="des-m004"></a>
**Design DES-M004:** Activation is a versioned tenant-module record for hr.leave; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m004"></a>
**Implementation IMP-M004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M004](ACCEPTANCE_CRITERIA.md#test-m004). **Release:** R2.

| Contract field | hr.leave |
|---|---|
| Domain / business value | HRMS: Track requests, balances and approved absence |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.hr.leave.read; module.hr.leave.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | leave.request, leave.approve, leave.policy.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR; holds/subject requests/global backup expiry apply |
| Pricing strategy | Active employees; policy complexity is not an automatic surcharge |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R2; activation unavailable before supported release and validation |

<a id="req-m005"></a>
### REQ-M005 — hr.lifecycle

**Requirement:** Provide hr.lifecycle only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M005 — As a tenant administrator, I want to configure employee lifecycle so that access matches our purchased workflow.

<a id="des-m005"></a>
**Design DES-M005:** Activation is a versioned tenant-module record for hr.lifecycle; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m005"></a>
**Implementation IMP-M005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M005](ACCEPTANCE_CRITERIA.md#test-m005). **Release:** R2.

| Contract field | hr.lifecycle |
|---|---|
| Domain / business value | HRMS: Coordinate onboarding, transfers and offboarding |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.hr.lifecycle.read; module.hr.lifecycle.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | lifecycle.manage, lifecycle.complete, employees.write; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR; holds/subject requests/global backup expiry apply |
| Pricing strategy | Employee bands and optional workflow add-on |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R2; activation unavailable before supported release and validation |

<a id="req-m006"></a>
### REQ-M006 — hr.benefits

**Requirement:** Provide hr.benefits only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M006 — As a tenant administrator, I want to configure benefits and expenses so that access matches our purchased workflow.

<a id="des-m006"></a>
**Design DES-M006:** Activation is a versioned tenant-module record for hr.benefits; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m006"></a>
**Implementation IMP-M006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M006](ACCEPTANCE_CRITERIA.md#test-m006). **Release:** Later.

| Contract field | hr.benefits |
|---|---|
| Domain / business value | HRMS: Administer benefit enrollment and reimbursement requests |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.hr.benefits.read; module.hr.benefits.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | benefits.manage, expenses.request, expenses.approve; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR; claims use approved finance schedule; holds/subject requests/global backup expiry apply |
| Pricing strategy | Eligible employees; provider services quoted separately |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m007"></a>
### REQ-M007 — talent.ats

**Requirement:** Provide talent.ats only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M007 — As a tenant administrator, I want to configure ats so that access matches our purchased workflow.

<a id="des-m007"></a>
**Design DES-M007:** Activation is a versioned tenant-module record for talent.ats; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m007"></a>
**Implementation IMP-M007:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M007](ACCEPTANCE_CRITERIA.md#test-m007). **Release:** Later.

| Contract field | talent.ats |
|---|---|
| Domain / business value | Talent acquisition: Manage requisitions, applications, interviews and offers |
| Hard dependencies | platform.core, crm.accounts |
| Entitlements | module.talent.ats.read; module.talent.ats.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | requisitions.manage, applications.read, applications.decide; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-PERSON; holds/subject requests/global backup expiry apply |
| Pricing strategy | Internal recruiter seats; external candidates not paid seats |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m008"></a>
### REQ-M008 — payroll.inputs

**Requirement:** Provide payroll.inputs only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M008 — As a tenant administrator, I want to configure payroll input control so that access matches our purchased workflow.

<a id="des-m008"></a>
**Design DES-M008:** Activation is a versioned tenant-module record for payroll.inputs; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m008"></a>
**Implementation IMP-M008:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M008](ACCEPTANCE_CRITERIA.md#test-m008). **Release:** R2.

| Contract field | payroll.inputs |
|---|---|
| Domain / business value | Payroll: Resolve approved payroll inputs before provider handoff |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.payroll.inputs.read; module.payroll.inputs.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | payroll.inputs.read, payroll.inputs.prepare, payroll.inputs.approve; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-PAY; holds/subject requests/global backup expiry apply |
| Pricing strategy | Active workers per pay period plus entity scope |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R2; activation unavailable before supported release and validation |

<a id="req-m009"></a>
### REQ-M009 — payroll.engine

**Requirement:** Provide payroll.engine only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M009 — As a tenant administrator, I want to configure payroll calculation so that access matches our purchased workflow.

<a id="des-m009"></a>
**Design DES-M009:** Activation is a versioned tenant-module record for payroll.engine; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m009"></a>
**Implementation IMP-M009:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M009](ACCEPTANCE_CRITERIA.md#test-m009). **Release:** Later.

| Contract field | payroll.engine |
|---|---|
| Domain / business value | Payroll: Calculate versioned payroll and settlements under reviewed rules |
| Hard dependencies | platform.core, payroll.inputs, compliance.country |
| Entitlements | module.payroll.engine.read; module.payroll.engine.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | payroll.calculate, payroll.approve, payroll.release; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-PAY; holds/subject requests/global backup expiry apply |
| Pricing strategy | Workers, pay cycles and country pack; no payment service implied |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m010"></a>
### REQ-M010 — workforce.time

**Requirement:** Provide workforce.time only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M010 — As a tenant administrator, I want to configure time and attendance so that access matches our purchased workflow.

<a id="des-m010"></a>
**Design DES-M010:** Activation is a versioned tenant-module record for workforce.time; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m010"></a>
**Implementation IMP-M010:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M010](ACCEPTANCE_CRITERIA.md#test-m010). **Release:** R2.

| Contract field | workforce.time |
|---|---|
| Domain / business value | Workforce: Collect time entries and reconcile exceptions |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.workforce.time.read; module.workforce.time.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | time.submit, time.approve, time.policy.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR; approved entity schedule for wage records; holds/subject requests/global backup expiry apply |
| Pricing strategy | Active workers; device/connector fees separately |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R2; activation unavailable before supported release and validation |

<a id="req-m011"></a>
### REQ-M011 — workforce.schedule

**Requirement:** Provide workforce.schedule only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M011 — As a tenant administrator, I want to configure scheduling so that access matches our purchased workflow.

<a id="des-m011"></a>
**Design DES-M011:** Activation is a versioned tenant-module record for workforce.schedule; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m011"></a>
**Implementation IMP-M011:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M011](ACCEPTANCE_CRITERIA.md#test-m011). **Release:** Later.

| Contract field | workforce.schedule |
|---|---|
| Domain / business value | Workforce: Plan shifts and approve changes across sites |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.workforce.schedule.read; module.workforce.schedule.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | schedule.read, schedule.manage, schedule.swap.approve; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S2; T-OPS with employment-linked schedule; holds/subject requests/global backup expiry apply |
| Pricing strategy | Scheduled active workers |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m012"></a>
### REQ-M012 — experience.portal

**Requirement:** Provide experience.portal only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M012 — As a tenant administrator, I want to configure employee self-service so that access matches our purchased workflow.

<a id="des-m012"></a>
**Design DES-M012:** Activation is a versioned tenant-module record for experience.portal; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m012"></a>
**Implementation IMP-M012:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M012](ACCEPTANCE_CRITERIA.md#test-m012). **Release:** R2.

| Contract field | experience.portal |
|---|---|
| Domain / business value | Employee experience: Give employees scoped access to their own requests and records |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.experience.portal.read; module.experience.portal.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | self.profile.read, self.requests.write, self.payslip.read; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; Underlying record schedule; no duplicate archive; holds/subject requests/global backup expiry apply |
| Pricing strategy | Included with relevant HR module; optional communication add-ons |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R2; activation unavailable before supported release and validation |

<a id="req-m013"></a>
### REQ-M013 — experience.engagement

**Requirement:** Provide experience.engagement only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M013 — As a tenant administrator, I want to configure engagement and cases so that access matches our purchased workflow.

<a id="des-m013"></a>
**Design DES-M013:** Activation is a versioned tenant-module record for experience.engagement; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m013"></a>
**Implementation IMP-M013:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M013](ACCEPTANCE_CRITERIA.md#test-m013). **Release:** Later.

| Contract field | experience.engagement |
|---|---|
| Domain / business value | Employee experience: Gather feedback and route sensitive employee cases |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.experience.engagement.read; module.experience.engagement.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | engagement.manage, cases.confidential.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; Purpose-specific consent/retention schedule before activation; holds/subject requests/global backup expiry apply |
| Pricing strategy | Active employees; no charge for submitting a protected concern |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m014"></a>
### REQ-M014 — talent.performance

**Requirement:** Provide talent.performance only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M014 — As a tenant administrator, I want to configure performance and goals so that access matches our purchased workflow.

<a id="des-m014"></a>
**Design DES-M014:** Activation is a versioned tenant-module record for talent.performance; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m014"></a>
**Implementation IMP-M014:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M014](ACCEPTANCE_CRITERIA.md#test-m014). **Release:** Later.

| Contract field | talent.performance |
|---|---|
| Domain / business value | HCM: Manage goals, review cycles and calibration |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.talent.performance.read; module.talent.performance.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | performance.self, performance.review, performance.calibrate; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR with assessment-specific restriction; holds/subject requests/global backup expiry apply |
| Pricing strategy | Eligible employees per cycle |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m015"></a>
### REQ-M015 — talent.learning

**Requirement:** Provide talent.learning only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M015 — As a tenant administrator, I want to configure learning so that access matches our purchased workflow.

<a id="des-m015"></a>
**Design DES-M015:** Activation is a versioned tenant-module record for talent.learning; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m015"></a>
**Implementation IMP-M015:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M015](ACCEPTANCE_CRITERIA.md#test-m015). **Release:** Later.

| Contract field | talent.learning |
|---|---|
| Domain / business value | HCM: Assign learning and track completion and renewals |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.talent.learning.read; module.talent.learning.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | learning.assign, learning.complete, learning.admin; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S2; T-HR; credential proofs per purpose; holds/subject requests/global backup expiry apply |
| Pricing strategy | Active learners; external content fees separately |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m016"></a>
### REQ-M016 — talent.compensation

**Requirement:** Provide talent.compensation only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M016 — As a tenant administrator, I want to configure compensation planning so that access matches our purchased workflow.

<a id="des-m016"></a>
**Design DES-M016:** Activation is a versioned tenant-module record for talent.compensation; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m016"></a>
**Implementation IMP-M016:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M016](ACCEPTANCE_CRITERIA.md#test-m016). **Release:** Later.

| Contract field | talent.compensation |
|---|---|
| Domain / business value | HCM: Plan pay changes within authorized budgets |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.talent.compensation.read; module.talent.compensation.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | compensation.plan, compensation.approve; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR and approved finance schedule; holds/subject requests/global backup expiry apply |
| Pricing strategy | Eligible employees; planning-cycle add-on |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m017"></a>
### REQ-M017 — talent.succession

**Requirement:** Provide talent.succession only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M017 — As a tenant administrator, I want to configure succession and skills so that access matches our purchased workflow.

<a id="des-m017"></a>
**Design DES-M017:** Activation is a versioned tenant-module record for talent.succession; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m017"></a>
**Implementation IMP-M017:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M017](ACCEPTANCE_CRITERIA.md#test-m017). **Release:** Later.

| Contract field | talent.succession |
|---|---|
| Domain / business value | HCM: Maintain skills and restricted succession plans |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.talent.succession.read; module.talent.succession.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | skills.self, succession.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-HR with review-specific expiry; holds/subject requests/global backup expiry apply |
| Pricing strategy | Eligible employees; restricted planning add-on |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m018"></a>
### REQ-M018 — crm.accounts

**Requirement:** Provide crm.accounts only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M018 — As a tenant administrator, I want to configure accounts and contacts so that access matches our purchased workflow.

<a id="des-m018"></a>
**Design DES-M018:** Activation is a versioned tenant-module record for crm.accounts; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m018"></a>
**Implementation IMP-M018:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M018](ACCEPTANCE_CRITERIA.md#test-m018). **Release:** R1.

| Contract field | crm.accounts |
|---|---|
| Domain / business value | CRM: Maintain agency client references and scoped relationships |
| Hard dependencies | platform.core |
| Entitlements | module.crm.accounts.read; module.crm.accounts.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | accounts.read, accounts.write, contacts.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S2; T-PERSON / T-OPS; holds/subject requests/global backup expiry apply |
| Pricing strategy | Included minimal reference records in R1; advanced CRM optional |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R1; activation unavailable before supported release and validation |

<a id="req-m019"></a>
### REQ-M019 — crm.sales

**Requirement:** Provide crm.sales only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M019 — As a tenant administrator, I want to configure sales pipeline so that access matches our purchased workflow.

<a id="des-m019"></a>
**Design DES-M019:** Activation is a versioned tenant-module record for crm.sales; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m019"></a>
**Implementation IMP-M019:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M019](ACCEPTANCE_CRITERIA.md#test-m019). **Release:** Later.

| Contract field | crm.sales |
|---|---|
| Domain / business value | Sales: Manage opportunities, activities, quotes and sales forecasts |
| Hard dependencies | platform.core, crm.accounts |
| Entitlements | module.crm.sales.read; module.crm.sales.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | opportunities.manage, quotes.approve, sales.forecast.read; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S2; T-OPS; contract records use approved schedule; holds/subject requests/global backup expiry apply |
| Pricing strategy | Internal sales seats; optional quote add-on |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m020"></a>
### REQ-M020 — crm.success

**Requirement:** Provide crm.success only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M020 — As a tenant administrator, I want to configure customer lifecycle so that access matches our purchased workflow.

<a id="des-m020"></a>
**Design DES-M020:** Activation is a versioned tenant-module record for crm.success; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m020"></a>
**Implementation IMP-M020:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M020](ACCEPTANCE_CRITERIA.md#test-m020). **Release:** Later.

| Contract field | crm.success |
|---|---|
| Domain / business value | Customer success: Track customer onboarding, health, renewals and success plans |
| Hard dependencies | platform.core, crm.accounts |
| Entitlements | module.crm.success.read; module.crm.success.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | success.manage, health.read, renewals.manage; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S2; T-OPS; product telemetry follows its own purpose; holds/subject requests/global backup expiry apply |
| Pricing strategy | CS seats plus account/telemetry bands |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m021"></a>
### REQ-M021 — crm.support

**Requirement:** Provide crm.support only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M021 — As a tenant administrator, I want to configure customer service so that access matches our purchased workflow.

<a id="des-m021"></a>
**Design DES-M021:** Activation is a versioned tenant-module record for crm.support; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m021"></a>
**Implementation IMP-M021:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M021](ACCEPTANCE_CRITERIA.md#test-m021). **Release:** Later.

| Contract field | crm.support |
|---|---|
| Domain / business value | Support: Manage tenant-owned support tickets, queues, knowledge and SLAs |
| Hard dependencies | platform.core, crm.accounts |
| Entitlements | module.crm.support.read; module.crm.support.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | tickets.manage, tickets.restricted.read, knowledge.publish; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-OPS; sensitive ticket schedule overrides; holds/subject requests/global backup expiry apply |
| Pricing strategy | Agent seats; external requesters not paid seats |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m022"></a>
### REQ-M022 — platform.automation

**Requirement:** Provide platform.automation only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M022 — As a tenant administrator, I want to configure workflow automation so that access matches our purchased workflow.

<a id="des-m022"></a>
**Design DES-M022:** Activation is a versioned tenant-module record for platform.automation; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m022"></a>
**Implementation IMP-M022:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M022](ACCEPTANCE_CRITERIA.md#test-m022). **Release:** Later.

| Contract field | platform.automation |
|---|---|
| Domain / business value | Automation: Run governed rules and approvals across enabled modules |
| Hard dependencies | platform.core |
| Entitlements | module.platform.automation.read; module.platform.automation.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | automation.manage, automation.execute; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; Rule metadata T-OPS; run logs T-AUDIT; holds/subject requests/global backup expiry apply |
| Pricing strategy | Included bounded rules; execution capacity add-ons |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m023"></a>
### REQ-M023 — platform.analytics

**Requirement:** Provide platform.analytics only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M023 — As a tenant administrator, I want to configure analytics so that access matches our purchased workflow.

<a id="des-m023"></a>
**Design DES-M023:** Activation is a versioned tenant-module record for platform.analytics; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m023"></a>
**Implementation IMP-M023:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M023](ACCEPTANCE_CRITERIA.md#test-m023). **Release:** R1 limited.

| Contract field | platform.analytics |
|---|---|
| Domain / business value | Reporting: Permission-aware dashboards, saved views and snapshots |
| Hard dependencies | platform.core |
| Entitlements | module.platform.analytics.read; module.platform.analytics.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | reports.read, reports.export, reports.schedule; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-REPORT; saved definitions T-OPS; holds/subject requests/global backup expiry apply |
| Pricing strategy | R1 fixed views included; advanced analytics/scheduling add-ons |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R1 limited; activation unavailable before supported release and validation |

<a id="req-m024"></a>
### REQ-M024 — platform.integrations

**Requirement:** Provide platform.integrations only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M024 — As a tenant administrator, I want to configure integration gateway so that access matches our purchased workflow.

<a id="des-m024"></a>
**Design DES-M024:** Activation is a versioned tenant-module record for platform.integrations; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m024"></a>
**Implementation IMP-M024:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M024](ACCEPTANCE_CRITERIA.md#test-m024). **Release:** R1 CSV only.

| Contract field | platform.integrations |
|---|---|
| Domain / business value | Integrations: Connect authorized external systems with controlled imports and APIs |
| Hard dependencies | platform.core |
| Entitlements | module.platform.integrations.read; module.platform.integrations.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | integrations.manage, imports.run, api.invoke; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; T-SECRET; import errors 30 days; source data inherits record schedule; holds/subject requests/global backup expiry apply |
| Pricing strategy | R1 CSV included; API/connector packages and usage bands later |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | R1 CSV only; activation unavailable before supported release and validation |

<a id="req-m025"></a>
### REQ-M025 — compliance.country

**Requirement:** Provide compliance.country only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M025 — As a tenant administrator, I want to configure country pack framework so that access matches our purchased workflow.

<a id="des-m025"></a>
**Design DES-M025:** Activation is a versioned tenant-module record for compliance.country; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m025"></a>
**Implementation IMP-M025:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M025](ACCEPTANCE_CRITERIA.md#test-m025). **Release:** Later.

| Contract field | compliance.country |
|---|---|
| Domain / business value | Compliance: Apply reviewed jurisdiction/entity rule versions |
| Hard dependencies | platform.core, hr.records |
| Entitlements | module.compliance.country.read; module.compliance.country.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | compliance.configure, compliance.review; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; Applicable record schedule; rule/audit evidence T-AUDIT; holds/subject requests/global backup expiry apply |
| Pricing strategy | Per country/jurisdiction/entity pack; counsel services separate |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

<a id="req-m026"></a>
### REQ-M026 — compliance.uae

**Requirement:** Provide compliance.uae only under its dependency, entitlement, permission, retention and lifecycle contract below; enforce changes server-side.

**Story:** US-M026 — As a tenant administrator, I want to configure uae jurisdiction packs so that access matches our purchased workflow.

<a id="des-m026"></a>
**Design DES-M026:** Activation is a versioned tenant-module record for compliance.uae; dependency validation and entitlement recomputation are transactional. Read/export and retained data follow the common lifecycle, not navigation visibility.

<a id="imp-m026"></a>
**Implementation IMP-M026:** Planned work item implementing this contract; no code exists. **Test:** [TEST-M026](ACCEPTANCE_CRITERIA.md#test-m026). **Release:** Later.

| Contract field | compliance.uae |
|---|---|
| Domain / business value | Compliance: Provide separately reviewed UAE regime-specific validations and provider formats |
| Hard dependencies | platform.core, compliance.country |
| Entitlements | module.compliance.uae.read; module.compliance.uae.write; feature-specific grants in FEATURE_CATALOG.md; commercial entitlement is not data permission |
| Permissions | compliance.configure, compliance.review, payroll.inputs.approve; explicit field/record scope; owner role is not automatic S3 access |
| Navigation | Active: entitled permitted sections visible; read_only/suspended: authorized archive badge; inactive never-activated: admin catalog only; no unauthorized badge/count leakage |
| API access | Same policy as UI; read_only permits scoped reads/exports, no business mutation; tokens and jobs rechecked at execution |
| Sensitivity / retention | S3; Approved applicable entity schedule; no generic legal default; holds/subject requests/global backup expiry apply |
| Pricing strategy | Distinct reviewed packs; not a universal compliance guarantee |
| Activation | Owner or subscription admin requests; validate subscription, hard dependencies, retention and country applicability where relevant; preview charges/limits and initialize empty configuration, never fabricate records |
| Deactivation | Preview dependents, queued work and data; atomically enter read_only, stop writes/new jobs and preserve audit; no silent dependency cascade or deletion |
| Reactivation | Recheck contract/dependencies, restore retained records after migration preview; do not resurrect deleted data or replay side effects automatically |
| Release | Later; activation unavailable before supported release and validation |

## Add-ons, services and integration packages

These packaging records are part of REQ-E002 and REQ-E012; they are not new modules or a bypass of source-module permissions.

| Stable package ID | Eligibility / proposed pricing basis | Additional controls |
|---|---|---|
| addon.sso | Paid plan plus core; organization fee; later | SAML/OIDC configuration and recovery controls; MFA/security basics remain included |
| addon.storage | Active document-capable module; GB-month capacity; later | Retention is unchanged; cannot sell indefinite storage as compliance |
| addon.analytics | Active analytics plus source modules; organization/author seats; later | Custom analysis never accesses unlicensed/unauthorized source data |
| addon.scheduled_reports | Active analytics and export permissions; schedule/run bands; later | Recipients and permissions rechecked on every run/download |
| addon.automation_runs | Active automation; committed execution units; later | No autonomous privileged action or arbitrary unreviewed code |
| addon.messaging | Explicit approved channel/provider; delivered-message units; later | Consent, minimum content, channel and regional restrictions; no channel assumed integrated |
| addon.api | Active integration gateway; request and rate bands; later | Credentials scoped to purchased source modules and permissions |
| connector.ats / connector.accounting / connector.payroll_provider / connector.messaging | Per supported provider connection/entity plus API capacity; later | Provider, version, data contract, fees, permissions, test and support owner declared before activation |
| service.migration | Agreed source, volume, deliverables and fixed/time-based quote | Human-delivered engagement; never grants data access automatically; approve temporary access explicitly |
| service.implementation | Workflow setup, mapping, training; scoped statement of work | Customer acceptance and handover; no legal advice or regulatory certification implied |
| service.training | Session/cohort-based fee | Non-production examples and accessibility requirements |
| service.compliance_review | Separately qualified adviser and jurisdiction-specific scope | Software provider does not acquire adviser authority; deliverable review is required before pack activation |

Country packs are versioned compliance.pack.<country>.<regime> products beneath the compliance.country framework. Only reviewed instances can be sold as supported. UAE instances in the feature catalog are proposed identifiers, not verified legal coverage. Payroll calculation requires a compatible reviewed instance; HR records do not depend on buying a compliance pack.

## Proposed plans and limits (planning assumptions)

Limits are commercial test configurations, not validated pricing or market demand. No AED/USD list price is assigned. Paid-plan fees require buyer testing. R1 subscription/invoice records are administrator-provisioned against an accepted contract; self-service card collection and proration are later. A test or operator grant has reason, approver and expiry and is never silently converted to a charge.

| Plan ID | Eligibility | Internal seats / active placements | Included R1 scope | Limits and exclusions |
|---|---|---|---|---|
| plan.trial | Verified organization, one per tenant; 14 calendar days | 5 / 25 | Core, minimal CRM, starts, fixed reminders, saved views, snapshot exports and CSV | 1 entity; 1,000-row import and 5,000-row export technical caps; no paid overages, public API or document upload |
| plan.agency_starter | Signed paid contract | 10 / 100 | Same R1 functions with full security and export | 1 entity, 10 saved views/user, 20 export jobs/day/tenant, 20 requests/minute/user on application API |
| plan.agency_growth | Signed paid contract | 30 / 500 | Same R1 functions and higher capacities | 3 entities, 50 saved views/user, 100 export jobs/day/tenant; no unsupported connector implied |
| plan.enterprise | Negotiated and approved entitlement schedule | Explicit, not unlimited | Supported modules named in order; optional SSO/services later | Hard safety caps, retention, rate limits and source permissions remain enforceable |

Trial uses Starter view/export caps. External client participants are not internal paid seats, but invitations are rate-limited and placement-scoped. An active placement is any non-canceled/non-started placement; archived started/canceled placements do not consume active capacity. Changing a started/canceled placement back to active is a metered reopening requiring capacity. Invitation acceptance reserves an internal seat only for internal roles. There is no charge per employee until an applicable employee module is purchased. User accounts across tenants count independently in each tenant contract.

Future HR, workforce and payroll modules are optional subscriptions with the pricing bases in the module registry. R2 is not automatically included in an R1 plan. Adding several source modules does not create unlimited integration, automation or report entitlements.

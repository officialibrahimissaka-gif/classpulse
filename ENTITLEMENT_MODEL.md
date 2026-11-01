# Entitlement, subscription and module-state model

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Effective access contract

This document is the canonical server-enforcement and commercial lifecycle design. Company-selected module state cannot expand purchased rights; purchased rights cannot expand user permissions. Security basics, lawful data access and exit exports are not optional upgrades. No real billing integration, subscription database or policy engine exists yet.

```text
allow = authenticated AND tenant_valid AND supported_release
        AND state_allows(action) AND hard_dependencies_allow(action)
        AND commercial_entitlement_allows(action)
        AND feature_grant_allows(action) AND capacity_available(action)
        AND action_permission AND record_scope AND field_permission
```

Recovery reads/exports for previously activated modules are explicitly defined in REQ-E005; they do not require the module to be active for writes. Security suspension can deny all access except a separately verified recovery process. A technical outage never converts a denial into an allow.

## State/action decision table (REQ-E003–REQ-E007)

All permitted entries still require current identity, source scope and field permissions. Security suspension and lawful holds may narrow access further. The core module has the explicit closure exception in REQ-M001.

| Module state | Business reads | Business writes / new jobs | Retained-data export | Configuration / recovery |
|---|---|---|---|---|
| unavailable | None through unsupported features | Denied | Only separately supported recovery of historic data | Admin sees unsupported status; no purchase override |
| inactive, never activated | No source records | Denied | None to export | Activation preview if supported/eligible |
| provisioning | Previous allowed read-only state only | Denied until atomic activation commit | Previously retained data only | Status and authorized rollback |
| active | Authorized entitled reads | Authorized entitled writes within capacity | Authorized exports | Permitted configuration actions |
| read_only, previously active | Authorized retained records and supported reports | Denied; side effects paused | Available without paid export upgrade during agreed window | Privacy/hold/security and reactivation controls |
| suspended, commercial | Authorized retained reads under exit/contract terms | Denied | Recovery export under agreed terms | Contract/recovery and privacy controls |
| suspended, security | Denied unless explicitly approved recovery scope | Denied | Only separately verified secure recovery | Security investigation, holds and necessary privacy handling |

Stable feature grant keys are feature.f001 through feature.f051, mapped one-to-one to REQ-F001 through REQ-F051. Retiring a feature preserves its key and audit history. Limit keys include limit.internal_seats, limit.active_placements, limit.saved_views_per_user, limit.export_jobs_per_day and limit.import_rows; package keys use the stable IDs in MODULE_CATALOG.md. These names distinguish capacity from permission and technical safety limits from a purchased commercial allowance.

<a id="req-e001"></a>
### REQ-E001 — Entitlement policy conjunction

**Requirement:** Allow an action only if authenticated membership, tenant status, supported release, module/dependency state, product entitlement, feature entitlement, capacity and action/record/field permission all allow it; deny unknown modules/features.

**Story:** US-E001 — As a tenant owner, I want one authoritative eligibility check so that hidden UI controls are not the security boundary.

<a id="des-e001"></a>
**Design DES-E001:** Policy input contains principal, tenant, resource/action, module/version, source scopes and quota cost. Return allow or a safe denial code. Never accept a client-supplied plan, permission or calculated price.

<a id="imp-e001"></a>
**Implementation IMP-E001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E001](ACCEPTANCE_CRITERIA.md#test-e001). **Release:** R1.

<a id="req-e002"></a>
### REQ-E002 — Versioned grants and commercial source

**Requirement:** Compute effective grants from a versioned plan/order, active add-ons, approved time-limited overrides and module selection; preserve grant provenance and exact limits.

**Story:** US-E002 — As a billing admin, I want reconciled subscription grants so that purchases and trials map to explicit access.

<a id="des-e002"></a>
**Design DES-E002:** Subscription and EntitlementGrant have effective_at/expires_at, source, approver and version. Stable keys use module.<id>.read/write, feature.<id>, limit.<resource> and package.<id>. Temporary override never bypasses security/legal gates.

<a id="imp-e002"></a>
**Implementation IMP-E002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E002](ACCEPTANCE_CRITERIA.md#test-e002). **Release:** R1.

<a id="req-e003"></a>
### REQ-E003 — Module state machine

**Requirement:** Use unavailable, inactive, provisioning, active, read_only and suspended module states; permanent data purge is a separate authorized workflow, never an automatic state transition.

**Story:** US-E003 — As a tenant administrator, I want predictable module state so that enabling and pausing are reversible.

<a id="des-e003"></a>
**Design DES-E003:** unavailable means not supported/reviewed; inactive means no operational writes; provisioning commits no user data until successful; active permits eligible commands; read_only preserves authorized views/exports; suspended distinguishes commercial/security reason. Core cannot be disabled independently of tenant closure.

<a id="imp-e003"></a>
**Implementation IMP-E003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E003](ACCEPTANCE_CRITERIA.md#test-e003). **Release:** R1.

<a id="req-e004"></a>
### REQ-E004 — Dependency activation and deactivation

**Requirement:** Validate the acyclic hard-dependency graph on activation. Refuse disabling a prerequisite with active hard dependents unless the admin explicitly approves an atomic read_only transition for the listed dependents.

**Story:** US-E004 — As a tenant administrator, I want dependency-aware changes so that one switch does not break other modules silently.

<a id="des-e004"></a>
**Design DES-E004:** Preview direct/transitive dependents, data counts visible to the actor, jobs and subscription effect; use one entitlement revision for the committed change. Soft integration edges pause only the associated workflow.

<a id="imp-e004"></a>
**Implementation IMP-E004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E004](ACCEPTANCE_CRITERIA.md#test-e004). **Release:** R1.

<a id="req-e005"></a>
### REQ-E005 — Read-only, export and retained access

**Requirement:** For previously activated read_only modules, permit authorized record viewing, existing report snapshots and data export during the agreed retention/exit window without a paid export add-on; block business writes, new imports and new automation.

**Story:** US-E005 — As a tenant admin, I want to retrieve retained data after turning a module off so that exit is possible.

<a id="des-e005"></a>
**Design DES-E005:** Off-state read/export is a narrow recovery entitlement, not full active-module feature access. Removal/erasure requests, legal holds, configuration/contract access and security revocation remain available; supported source reporting can query retained records read-only.

<a id="imp-e005"></a>
**Implementation IMP-E005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E005](ACCEPTANCE_CRITERIA.md#test-e005). **Release:** R1.

<a id="req-e006"></a>
### REQ-E006 — Safe deactivation and queued work

**Requirement:** On deactivation revoke write capabilities, pause schedules/connectors and cancel or safely drain uncommitted jobs; recheck entitlements before external side effects and mutation commit.

**Story:** US-E006 — As an operations manager, I want scheduled work stopped safely so that disabling a module stops side effects.

<a id="des-e006"></a>
**Design DES-E006:** Commands record entitlement revision and serialize side-effect commit against module transition. An external call already committed cannot be recalled: record outcome and surface reconciliation, never report it canceled falsely.

<a id="imp-e006"></a>
**Implementation IMP-E006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E006](ACCEPTANCE_CRITERIA.md#test-e006). **Release:** R1.

<a id="req-e007"></a>
### REQ-E007 — Retention and reactivation

**Requirement:** Continue approved retention clocks, holds and subject requests while inactive; reactivate only surviving data after schema/rule validation and do not auto-replay missed jobs, reminders or charges.

**Story:** US-E007 — As a privacy admin, I want recoverable retained records without endless retention so that a module can resume safely.

<a id="des-e007"></a>
**Design DES-E007:** Preview migrations, stale external permissions, new country rule versions and current capacity. Preserve audit and deletion tombstones; reactivation is idempotent and separately authorized.

<a id="imp-e007"></a>
**Implementation IMP-E007:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E007](ACCEPTANCE_CRITERIA.md#test-e007). **Release:** R1.

<a id="req-e008"></a>
### REQ-E008 — Atomic capacity and usage metering

**Requirement:** Reserve capacity atomically for internal seats and active placements; enforce both single and batch operations at commit. Usage events deduplicate, distinguish reserved/committed/released and preserve meter version.

**Story:** US-E008 — As a billing admin, I want race-safe limits so that imports and concurrent users cannot exceed the contract.

<a id="des-e008"></a>
**Design DES-E008:** A quota reservation uses tenant/resource/period/idempotency key. Release on rollback/cancel. Gauge capacity differs from consumptive export/API counts. Archive/started status releases active placement capacity once; restoration/reopening reserves again.

<a id="imp-e008"></a>
**Implementation IMP-E008:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E008](ACCEPTANCE_CRITERIA.md#test-e008). **Release:** R1.

<a id="req-e009"></a>
### REQ-E009 — Limits, rate limits and no surprise overage

**Requirement:** R1 uses hard commercial caps and rejects excess before work; show near-limit warnings to authorized admins. Overage charging later requires explicit priced opt-in, spend caps, metering reconciliation and order acceptance.

**Story:** US-E009 — As a billing admin, I want a clear cap so that exceeding usage does not create unapproved charges.

<a id="des-e009"></a>
**Design DES-E009:** Distinguish commercial 403 feature denial, 409 state/capacity conflict, 422 validation and 429 rate-limit retry. Exact codes disclose no sensitive resource existence. Technical safety limits remain even on enterprise plans.

<a id="imp-e009"></a>
**Implementation IMP-E009:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E009](ACCEPTANCE_CRITERIA.md#test-e009). **Release:** R1.

<a id="req-e010"></a>
### REQ-E010 — Trial lifecycle

**Requirement:** Start a 14-day trial only after verified organization setup and explicit terms; show exact expiry UTC/local time, send minimal reminders, and enter read_only at expiry without automatic charging.

**Story:** US-E010 — As a tenant owner, I want an explicit trial end so that evaluation cannot silently create a bill.

<a id="des-e010"></a>
**Design DES-E010:** Trial state: eligible → active → converted or expired. Expired trial has 30-day read/export window followed by agreed retention/deletion; conversion requires accepted order. Prevent repeated free-trial resets under the same tenant.

<a id="imp-e010"></a>
**Implementation IMP-E010:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E010](ACCEPTANCE_CRITERIA.md#test-e010). **Release:** R1.

<a id="req-e011"></a>
### REQ-E011 — Upgrade, downgrade and cancellation

**Requirement:** Preview entitlements, limits, dependent modules, effective date and any price before accepted changes. R1 upgrades require an approved order; downgrade defaults to renewal date and cancellation provides the agreed exit window.

**Story:** US-E011 — As a billing admin, I want previewed subscription changes so that commercial changes match access.

<a id="des-e011"></a>
**Design DES-E011:** If retained data exceeds a new gauge cap, permit reads/exports and reductions but block new allocations; never delete excess records. Preserve accepted change version. Refund/proration rules require explicit order terms and are not inferred.

<a id="imp-e011"></a>
**Implementation IMP-E011:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E011](ACCEPTANCE_CRITERIA.md#test-e011). **Release:** R1.

<a id="req-e012"></a>
### REQ-E012 — Add-ons, services and compliance packs

**Requirement:** Treat add-ons/integration packages as scoped grants dependent on active supported modules, country packs as reviewed versioned instances, and professional services as accepted deliverables with independently granted access.

**Story:** US-E012 — As a tenant owner, I want separately authorized extras so that a service purchase does not open employee data.

<a id="des-e012"></a>
**Design DES-E012:** Package registry in MODULE_CATALOG.md specifies entitlement and pricing unit. Missing jurisdiction approval blocks only affected regulated outputs. Service staff receive expiring explicit scopes, not tenant owner by default.

<a id="imp-e012"></a>
**Implementation IMP-E012:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E012](ACCEPTANCE_CRITERIA.md#test-e012). **Release:** R1.

<a id="req-e013"></a>
### REQ-E013 — Billing events and reconciliation

**Requirement:** R1 records manual approved order changes with audit; later automated billing verifies signed provider events, deduplicates and reconciles status without trusting callback order.

**Story:** US-E013 — As a billing administrator, I want trustworthy commercial updates so that replayed callbacks do not alter access twice.

<a id="des-e013"></a>
**Design DES-E013:** Commercial status and entitlement effective time are separate. Do not expose card/bank credentials in application storage. Failed payment grace is an explicit contract value; default is no invented grace or automatic data deletion.

<a id="imp-e013"></a>
**Implementation IMP-E013:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E013](ACCEPTANCE_CRITERIA.md#test-e013). **Release:** R1.

<a id="req-e014"></a>
### REQ-E014 — Cache invalidation and execution enforcement

**Requirement:** Version entitlements and membership, invalidate policy caches on changes, and fail closed for writes when current eligibility cannot be established; re-evaluate downloads, jobs, scheduled reports, webhooks and automation.

**Story:** US-E014 — As a security admin, I want access changes reflected immediately so that cached plans do not preserve removed privileges.

<a id="des-e014"></a>
**Design DES-E014:** Use short-lived policy caches keyed by tenant/principal/revision; revision check at authorization/commit is authoritative. Availability fallback never permits unauthorized data, while a safely authenticated read may use an explicitly valid snapshot.

<a id="imp-e014"></a>
**Implementation IMP-E014:** Planned work item implementing this contract; no code exists. **Test:** [TEST-E014](ACCEPTANCE_CRITERIA.md#test-e014). **Release:** R1.


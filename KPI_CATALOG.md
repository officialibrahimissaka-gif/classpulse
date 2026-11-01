# KPI catalog

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Shared metric conventions

Every KPI is a separately traceable requirement. Formula intervals are half-open [start,end) in the selected named business timezone, with UTC event storage. A zero denominator is N/A; missing sources are unknown; suppressed results are not zero. Distinct IDs prevent one-to-many join inflation. Source permissions apply before aggregation, and all KPI consumers require reports.read plus every named source entitlement. Field-sensitive permissions are additional requirements, not substitutes.

All metrics support chart/table inspection, authorized drill-down and PDF/CSV/XLSX snapshot exports with reports.export. Exporting is unavailable to viewers without that separate permission. Saved views apply only approved dimensions. R1 has fixed agency KPIs K001–K004; proposed outcome improvements are not guaranteed. Refresh frequencies are target maximum cache age under healthy sources, not measured production SLAs.

<a id="req-k001"></a>
### REQ-K001 — Confirmed starts

**Requirement:** Publish Confirmed starts only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K001 — As an authorized dashboard viewer, I want confirmed starts with transparent calculation so that I can inspect its meaning.

<a id="des-k001"></a>
**Design DES-K001:** Metric key kpi.001 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k001"></a>
**Implementation IMP-K001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K001](ACCEPTANCE_CRITERIA.md#test-k001). **Release:** R1.

| KPI field | Contract |
|---|---|
| Business meaning | Placements actually starting in a selected period |
| Formula | Count distinct placement_id with confirmed actual_start_date in [start,end); canceled placements excluded |
| Data source | Placement.actual_start_date, status, confirmed_by |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Entity, team, recruiter, client; actual-start date; default tenant and actor scope always applied |
| Permissions | reports.read + placements.read; source modules and field permissions; exports also require reports.export |
| Visualization | KPI card + time bar; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Executives, Recruiters |
| Release | R1 |

<a id="req-k002"></a>
### REQ-K002 — On-time start rate

**Requirement:** Publish On-time start rate only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K002 — As an authorized dashboard viewer, I want on-time start rate with transparent calculation so that I can inspect its meaning.

<a id="des-k002"></a>
**Design DES-K002:** Metric key kpi.002 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k002"></a>
**Implementation IMP-K002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K002](ACCEPTANCE_CRITERIA.md#test-k002). **Release:** R1.

| KPI field | Contract |
|---|---|
| Business meaning | Started placements that met the original agreed date |
| Formula | Started placements in original planned-date cohort with actual_start_date <= original_planned_date / all started placements in that cohort × 100; canceled/unresolved reported separately |
| Data source | Placement original_planned_date, actual_start_date, terminal status |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Original planned-date cohort, client, owner, entity; timezone explicit; default tenant and actor scope always applied |
| Permissions | reports.read + placements.read; source modules and field permissions; exports also require reports.export |
| Visualization | Percent card + cohort table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Executives, Recruiters |
| Release | R1 |

<a id="req-k003"></a>
### REQ-K003 — Overdue mandatory tasks

**Requirement:** Publish Overdue mandatory tasks only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K003 — As an authorized dashboard viewer, I want overdue mandatory tasks with transparent calculation so that I can inspect its meaning.

<a id="des-k003"></a>
**Design DES-K003:** Metric key kpi.003 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k003"></a>
**Implementation IMP-K003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K003](ACCEPTANCE_CRITERIA.md#test-k003). **Release:** R1.

| KPI field | Contract |
|---|---|
| Business meaning | Required unfinished tasks past their due time |
| Formula | Count distinct required task_id where due_at < as_of and status not completed/waived and placement not canceled/started |
| Data source | Task.required, due_at, status; Placement.status |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Owner, client, milestone, entity, due-date range; default tenant and actor scope always applied |
| Permissions | reports.read + placements.read; source modules and field permissions; exports also require reports.export |
| Visualization | Aging bar + drill-down table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Executives, Recruiters |
| Release | R1 |

<a id="req-k004"></a>
### REQ-K004 — Start slippage

**Requirement:** Publish Start slippage only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K004 — As an authorized dashboard viewer, I want start slippage with transparent calculation so that I can inspect its meaning.

<a id="des-k004"></a>
**Design DES-K004:** Metric key kpi.004 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k004"></a>
**Implementation IMP-K004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K004](ACCEPTANCE_CRITERIA.md#test-k004). **Release:** R1.

| KPI field | Contract |
|---|---|
| Business meaning | Delay against the original plan for completed starts |
| Formula | Median max(0, actual_start_date − original_planned_date) in calendar days for started placements in original-date cohort; show early/on-time share separately |
| Data source | Placement original_planned_date, actual_start_date |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Client, recruiter, entity, cohort; default tenant and actor scope always applied |
| Permissions | reports.read + placements.read; source modules and field permissions; exports also require reports.export |
| Visualization | Median card + distribution later; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Executives, Recruiters |
| Release | R1 |

<a id="req-k005"></a>
### REQ-K005 — Active headcount

**Requirement:** Publish Active headcount only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K005 — As an authorized dashboard viewer, I want active headcount with transparent calculation so that I can inspect its meaning.

<a id="des-k005"></a>
**Design DES-K005:** Metric key kpi.005 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k005"></a>
**Implementation IMP-K005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K005](ACCEPTANCE_CRITERIA.md#test-k005). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Current active employments within authorized scope |
| Formula | Count distinct employment_id effective on as_of with active employment status; show distinct-person count separately; exclude candidates/contractors unless explicitly scoped |
| Data source | Employment effective dates, status, entity |
| Refresh | Daily and after approved employment change; display as-of and failed/lagging source state |
| Filters and dimensions | Entity, location, team, employment type, as-of date; default tenant and actor scope always applied |
| Permissions | reports.read + employees.read; source modules and field permissions; exports also require reports.export |
| Visualization | KPI card + trend; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Executives, HR leadership |
| Release | R2 |

<a id="req-k006"></a>
### REQ-K006 — Employee turnover

**Requirement:** Publish Employee turnover only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K006 — As an authorized dashboard viewer, I want employee turnover with transparent calculation so that I can inspect its meaning.

<a id="des-k006"></a>
**Design DES-K006:** Metric key kpi.006 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k006"></a>
**Implementation IMP-K006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K006](ACCEPTANCE_CRITERIA.md#test-k006). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Exits relative to average workforce in a period |
| Formula | Terminated employments effective in period / mean of daily active headcount in period × 100; disclose voluntary/involuntary and excluded records |
| Data source | Employment start/end effective dates, approved exit type |
| Refresh | Daily; display as-of and failed/lagging source state |
| Filters and dimensions | Entity, team, employment type, calendar period; default tenant and actor scope always applied |
| Permissions | reports.read + employees.read; restricted exit reason separately; source modules and field permissions; exports also require reports.export |
| Visualization | Trend line + cohort table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | HR leadership |
| Release | R2 |

<a id="req-k007"></a>
### REQ-K007 — HR lifecycle completion

**Requirement:** Publish HR lifecycle completion only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K007 — As an authorized dashboard viewer, I want hr lifecycle completion with transparent calculation so that I can inspect its meaning.

<a id="des-k007"></a>
**Design DES-K007:** Metric key kpi.007 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k007"></a>
**Implementation IMP-K007:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K007](ACCEPTANCE_CRITERIA.md#test-k007). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Employee lifecycle cases completed by their planned due date |
| Formula | Cases completed by original due date / all closed cases with original due date in period × 100; canceled and still-open shown separately |
| Data source | LifecycleCase due_at, completed_at, status |
| Refresh | 15 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Joiner/mover/leaver, entity, owner, due-date cohort; default tenant and actor scope always applied |
| Permissions | reports.read + lifecycle.manage; source modules and field permissions; exports also require reports.export |
| Visualization | Percent card + status bar; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | HR leadership, HR operations |
| Release | R2 |

<a id="req-k008"></a>
### REQ-K008 — HR request backlog

**Requirement:** Publish HR request backlog only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K008 — As an authorized dashboard viewer, I want hr request backlog with transparent calculation so that I can inspect its meaning.

<a id="des-k008"></a>
**Design DES-K008:** Metric key kpi.008 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k008"></a>
**Implementation IMP-K008:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K008](ACCEPTANCE_CRITERIA.md#test-k008). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Unresolved authorized employee administration requests |
| Formula | Count distinct request_id not completed/canceled as_of; age = as_of − created_at in calendar days |
| Data source | EmployeeRequest status, created_at, owner |
| Refresh | 15 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Request type, team, owner, age band; default tenant and actor scope always applied |
| Permissions | reports.read + self.requests.write for self; lifecycle.manage for scoped aggregate; source modules and field permissions; exports also require reports.export |
| Visualization | Aging bar + detail table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | HR operations |
| Release | R2 |

<a id="req-k009"></a>
### REQ-K009 — Payroll input completeness

**Requirement:** Publish Payroll input completeness only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K009 — As an authorized dashboard viewer, I want payroll input completeness with transparent calculation so that I can inspect its meaning.

<a id="des-k009"></a>
**Design DES-K009:** Metric key kpi.009 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k009"></a>
**Implementation IMP-K009:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K009](ACCEPTANCE_CRITERIA.md#test-k009). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Workers with all required approved inputs for the selected pay period |
| Formula | Distinct in-scope workers with all configured required inputs approved / all payroll-eligible workers in the selected batch × 100; show excluded workers and requirements version |
| Data source | PayrollInputBatch membership, requirement version, validation and approval |
| Refresh | After batch change; within 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Entity, pay period, provider, input type; default tenant and actor scope always applied |
| Permissions | reports.read + payroll.inputs.read; source modules and field permissions; exports also require reports.export |
| Visualization | Progress card + exception table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Payroll teams |
| Release | R2 |

<a id="req-k010"></a>
### REQ-K010 — Payroll unresolved exceptions

**Requirement:** Publish Payroll unresolved exceptions only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K010 — As an authorized dashboard viewer, I want payroll unresolved exceptions with transparent calculation so that I can inspect its meaning.

<a id="des-k010"></a>
**Design DES-K010:** Metric key kpi.010 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k010"></a>
**Implementation IMP-K010:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K010](ACCEPTANCE_CRITERIA.md#test-k010). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Required payroll discrepancies awaiting resolution |
| Formula | Count distinct unresolved required exception_id in selected input batch, as_of |
| Data source | PayrollInputException status, required, batch_id |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Entity, period, owner, severity/type; default tenant and actor scope always applied |
| Permissions | reports.read + payroll.inputs.read; source modules and field permissions; exports also require reports.export |
| Visualization | Severity bar + detail table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Payroll teams |
| Release | R2 |

<a id="req-k011"></a>
### REQ-K011 — Approved net payroll

**Requirement:** Publish Approved net payroll only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K011 — As an authorized dashboard viewer, I want approved net payroll with transparent calculation so that I can inspect its meaning.

<a id="des-k011"></a>
**Design DES-K011:** Metric key kpi.011 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k011"></a>
**Implementation IMP-K011:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K011](ACCEPTANCE_CRITERIA.md#test-k011). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Approved net pay, not evidence of payment |
| Formula | Sum approved net_amount in finalized pay run, grouped by currency; exclude superseded drafts, show adjustments explicitly and never sum mixed currencies |
| Data source | PayRun finalized version and CalculationLine.net_amount/currency |
| Refresh | On finalization or adjustment; display as-of and failed/lagging source state |
| Filters and dimensions | Entity, pay period, currency, worker category; default tenant and actor scope always applied |
| Permissions | reports.read + payroll.approve plus salary fields; source modules and field permissions; exports also require reports.export |
| Visualization | Currency-separated card + reconciliation table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Executives, Payroll teams |
| Release | Later |

<a id="req-k012"></a>
### REQ-K012 — Shift coverage

**Requirement:** Publish Shift coverage only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K012 — As an authorized dashboard viewer, I want shift coverage with transparent calculation so that I can inspect its meaning.

<a id="des-k012"></a>
**Design DES-K012:** Metric key kpi.012 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k012"></a>
**Implementation IMP-K012:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K012](ACCEPTANCE_CRITERIA.md#test-k012). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Filled published shift hours relative to required published hours |
| Formula | Sum staffed published shift hours / sum required published shift hours × 100, counting approved assignments once and capped per shift at requirement; identify overstaffing separately |
| Data source | Shift required hours, published version, Assignment |
| Refresh | 15 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Site, team, role, local schedule dates; default tenant and actor scope always applied |
| Permissions | reports.read + schedule.read; source modules and field permissions; exports also require reports.export |
| Visualization | Coverage bar + roster table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Line managers |
| Release | Later |

<a id="req-k013"></a>
### REQ-K013 — Pending team approvals

**Requirement:** Publish Pending team approvals only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K013 — As an authorized dashboard viewer, I want pending team approvals with transparent calculation so that I can inspect its meaning.

<a id="des-k013"></a>
**Design DES-K013:** Metric key kpi.013 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k013"></a>
**Implementation IMP-K013:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K013](ACCEPTANCE_CRITERIA.md#test-k013). **Release:** R2 limited.

| KPI field | Contract |
|---|---|
| Business meaning | Tasks awaiting this manager’s authorized action |
| Formula | Count distinct pending approval_id assigned to actor or current delegated scope; separate leave/time/schedule types |
| Data source | ApprovalRequest status, actor/delegation, source module |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Source type, team, age, due date; default tenant and actor scope always applied |
| Permissions | reports.read + Respective leave.approve/time.approve/schedule.swap.approve; source modules and field permissions; exports also require reports.export |
| Visualization | KPI card + actionable table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Line managers |
| Release | R2 limited |

<a id="req-k014"></a>
### REQ-K014 — Leave balance

**Requirement:** Publish Leave balance only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K014 — As an authorized dashboard viewer, I want leave balance with transparent calculation so that I can inspect its meaning.

<a id="des-k014"></a>
**Design DES-K014:** Metric key kpi.014 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k014"></a>
**Implementation IMP-K014:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K014](ACCEPTANCE_CRITERIA.md#test-k014). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Employee’s approved ledger balance at a stated date |
| Formula | Sum posted grants and adjustments − posted consumption; show pending reserved units separately, by leave type/unit |
| Data source | LeaveLedger effective dates, units, status |
| Refresh | On ledger change; within 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Self, leave type, policy year, unit; default tenant and actor scope always applied |
| Permissions | reports.read + self.profile.read and own leave access; source modules and field permissions; exports also require reports.export |
| Visualization | Balance card + ledger table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Employees |
| Release | R2 |

<a id="req-k015"></a>
### REQ-K015 — Employee request status

**Requirement:** Publish Employee request status only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K015 — As an authorized dashboard viewer, I want employee request status with transparent calculation so that I can inspect its meaning.

<a id="des-k015"></a>
**Design DES-K015:** Metric key kpi.015 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k015"></a>
**Implementation IMP-K015:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K015](ACCEPTANCE_CRITERIA.md#test-k015). **Release:** R2.

| KPI field | Contract |
|---|---|
| Business meaning | Progress of the employee’s own submitted requests |
| Formula | Count own requests grouped by pending/approved/completed/rejected/canceled; preserve distinct domain meanings in drill-down |
| Data source | EmployeeRequest and source-domain states |
| Refresh | 5 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Self, source type, submitted date; default tenant and actor scope always applied |
| Permissions | reports.read + self.requests.write; own records only; source modules and field permissions; exports also require reports.export |
| Visualization | Status bar + own detail table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Employees |
| Release | R2 |

<a id="req-k016"></a>
### REQ-K016 — Sales pipeline value

**Requirement:** Publish Sales pipeline value only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K016 — As an authorized dashboard viewer, I want sales pipeline value with transparent calculation so that I can inspect its meaning.

<a id="des-k016"></a>
**Design DES-K016:** Metric key kpi.016 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k016"></a>
**Implementation IMP-K016:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K016](ACCEPTANCE_CRITERIA.md#test-k016). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Open opportunity amount by stage, not recognized revenue |
| Formula | Sum open opportunity amount grouped by stage and currency as_of; excludes won/lost and unpriced opportunities shown separately |
| Data source | Opportunity amount/currency/stage |
| Refresh | 15 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Owner, team, account, close period, currency; default tenant and actor scope always applied |
| Permissions | reports.read + sales.forecast.read; source modules and field permissions; exports also require reports.export |
| Visualization | Stage bar + opportunity table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Sales teams |
| Release | Later |

<a id="req-k017"></a>
### REQ-K017 — Sales win rate

**Requirement:** Publish Sales win rate only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K017 — As an authorized dashboard viewer, I want sales win rate with transparent calculation so that I can inspect its meaning.

<a id="des-k017"></a>
**Design DES-K017:** Metric key kpi.017 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k017"></a>
**Implementation IMP-K017:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K017](ACCEPTANCE_CRITERIA.md#test-k017). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Won decisions among decided opportunities |
| Formula | Count opportunities moved to won in period / count opportunities moved to won or lost in period × 100; reopened outcomes use latest terminal decision as_of |
| Data source | Opportunity stage history, terminal decision time |
| Refresh | Daily; display as-of and failed/lagging source state |
| Filters and dimensions | Owner, source, segment, entity, decision period; default tenant and actor scope always applied |
| Permissions | reports.read + sales.forecast.read; source modules and field permissions; exports also require reports.export |
| Visualization | Percent card + cohort table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Sales teams |
| Release | Later |

<a id="req-k018"></a>
### REQ-K018 — Renewal rate

**Requirement:** Publish Renewal rate only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K018 — As an authorized dashboard viewer, I want renewal rate with transparent calculation so that I can inspect its meaning.

<a id="des-k018"></a>
**Design DES-K018:** Metric key kpi.018 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k018"></a>
**Implementation IMP-K018:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K018](ACCEPTANCE_CRITERIA.md#test-k018). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Due contracts renewed in the selected due-date cohort |
| Formula | Contracts due in period with confirmed renewal / all renewable contracts due in period × 100; pending/canceled/nonrenewable shown explicitly; no revenue-weighted inference |
| Data source | Renewal due_date, status, confirmed_at, contract_id |
| Refresh | Daily; display as-of and failed/lagging source state |
| Filters and dimensions | Account owner, due-date cohort, segment, entity; default tenant and actor scope always applied |
| Permissions | reports.read + renewals.manage; source modules and field permissions; exports also require reports.export |
| Visualization | Cohort table + percent card; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Customer success |
| Release | Later |

<a id="req-k019"></a>
### REQ-K019 — Customer health coverage

**Requirement:** Publish Customer health coverage only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K019 — As an authorized dashboard viewer, I want customer health coverage with transparent calculation so that I can inspect its meaning.

<a id="des-k019"></a>
**Design DES-K019:** Metric key kpi.019 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k019"></a>
**Implementation IMP-K019:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K019](ACCEPTANCE_CRITERIA.md#test-k019). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Accounts with a current explainable health assessment |
| Formula | Managed active accounts with valid non-stale health snapshot / all managed active accounts × 100; show score distribution separately |
| Data source | Account status, SuccessAssignment, HealthSnapshot version/freshness |
| Refresh | Daily; display as-of and failed/lagging source state |
| Filters and dimensions | CS owner, segment, entity, health model version; default tenant and actor scope always applied |
| Permissions | reports.read + health.read; source modules and field permissions; exports also require reports.export |
| Visualization | Coverage card + scored/unknown table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Customer success |
| Release | Later |

<a id="req-k020"></a>
### REQ-K020 — First human response time

**Requirement:** Publish First human response time only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K020 — As an authorized dashboard viewer, I want first human response time with transparent calculation so that I can inspect its meaning.

<a id="des-k020"></a>
**Design DES-K020:** Metric key kpi.020 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k020"></a>
**Implementation IMP-K020:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K020](ACCEPTANCE_CRITERIA.md#test-k020). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Time to a first qualifying support response |
| Formula | Median business minutes from ticket created_at to first public human agent reply using captured SLA calendar; unreplied tickets shown separately |
| Data source | Ticket, Reply.is_human/public, SLA policy/calendar version |
| Refresh | 15 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Queue, priority, agent/team, created-date cohort; default tenant and actor scope always applied |
| Permissions | reports.read + tickets.manage; restricted case scope; source modules and field permissions; exports also require reports.export |
| Visualization | Median card + distribution; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Support teams |
| Release | Later |

<a id="req-k021"></a>
### REQ-K021 — Resolution SLA attainment

**Requirement:** Publish Resolution SLA attainment only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K021 — As an authorized dashboard viewer, I want resolution sla attainment with transparent calculation so that I can inspect its meaning.

<a id="des-k021"></a>
**Design DES-K021:** Metric key kpi.021 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k021"></a>
**Implementation IMP-K021:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K021](ACCEPTANCE_CRITERIA.md#test-k021). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Eligible resolved tickets meeting their configured SLA |
| Formula | Eligible tickets resolved within captured SLA budget / all eligible tickets resolved in period × 100; clock pauses and exclusions use policy version; pending shown separately |
| Data source | Ticket resolution events, SLA clock events, policy version |
| Refresh | 15 minutes; display as-of and failed/lagging source state |
| Filters and dimensions | Queue, priority, policy, resolved period; default tenant and actor scope always applied |
| Permissions | reports.read + tickets.manage; source modules and field permissions; exports also require reports.export |
| Visualization | Percent card + breach table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Support teams |
| Release | Later |

<a id="req-k022"></a>
### REQ-K022 — Customer satisfaction

**Requirement:** Publish Customer satisfaction only under the formula, source, refresh, dimensional and permission contract below; use common reporting semantics.

**Story:** US-K022 — As an authorized dashboard viewer, I want customer satisfaction with transparent calculation so that I can inspect its meaning.

<a id="des-k022"></a>
**Design DES-K022:** Metric key kpi.022 v1 evaluates over an authorized snapshot and registered source joins; persist definition version, scope, as-of and freshness. Reconcile to source fixtures before release.

<a id="imp-k022"></a>
**Implementation IMP-K022:** Planned work item implementing this contract; no code exists. **Test:** [TEST-K022](ACCEPTANCE_CRITERIA.md#test-k022). **Release:** Later.

| KPI field | Contract |
|---|---|
| Business meaning | Positive support survey share among valid responses |
| Formula | Valid positive ratings (4 or 5 on versioned 1–5 scale) / all valid deduplicated responses × 100; show response count and response rate, suppress cohorts below 5 |
| Data source | CSATResponse survey version, rating, invitation_id |
| Refresh | Daily; display as-of and failed/lagging source state |
| Filters and dimensions | Queue, time period, survey version; no identity-revealing tiny cohort; default tenant and actor scope always applied |
| Permissions | reports.read + tickets.manage and CSAT reporting scope; source modules and field permissions; exports also require reports.export |
| Visualization | Percent card + response table; accessible table and authorized drill-down |
| Export options | PDF, CSV, XLSX; same authorized snapshot and filters; no raw restricted fields unless separately permitted |
| Persona dashboards | Support teams |
| Release | Later |


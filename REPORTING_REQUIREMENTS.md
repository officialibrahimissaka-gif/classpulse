# Dashboards and reporting requirements

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Coverage and release split

The ten persona dashboard contracts below define the full vision. R1 includes agency executive/recruiter operational reporting only; HR, payroll, workforce, employee and CRM sales/service dashboards require later source modules. A dashboard never makes those modules implicitly available. All KPI definitions are in [KPI_CATALOG.md](KPI_CATALOG.md); all report exports support PDF, CSV and XLSX when their source report is available.

<a id="req-r001"></a>
### REQ-R001 — Permission-preserving query and drill-down

**Requirement:** Apply tenant, module, record and field controls before aggregation, pagination, counts, charts, drill-down and export; reject unauthorized metric definitions and join paths.

**Story:** US-R001 — As a report viewer, I want reports to match my authorized records so that aggregates do not leak excluded data.

<a id="des-r001"></a>
**Design DES-R001:** A registered metric query specifies source modules, measures and allowed dimensions. Drill-down uses the same definition/version/as-of and authorizes each row; no arbitrary SQL from users.

<a id="imp-r001"></a>
**Implementation IMP-R001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R001](ACCEPTANCE_CRITERIA.md#test-r001). **Release:** R1.

<a id="req-r002"></a>
### REQ-R002 — Metric semantics and snapshot consistency

**Requirement:** Use the KPI catalog definition/version, explicit denominator, cohort, date field, currency and timezone; show as-of/freshness and distinguish zero, no data, unknown and suppressed.

**Story:** US-R002 — As an analyst, I want stable metric definitions so that chart and file totals reconcile.

<a id="des-r002"></a>
**Design DES-R002:** Snapshot includes tenant, actor scope fingerprint, entitlement revision, filters, metric version, data watermark and currency policy; late corrections create a new snapshot rather than rewriting an exported result.

<a id="imp-r002"></a>
**Implementation IMP-R002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R002](ACCEPTANCE_CRITERIA.md#test-r002). **Release:** R1.

<a id="req-r003"></a>
### REQ-R003 — Visuals and accessible interaction

**Requirement:** Support appropriate KPI cards, line/bar charts, distributions, funnel/stage tables and sortable paginated detail tables with accessible labels and non-color status; include a data-table alternative.

**Story:** US-R003 — As a dashboard viewer, I want understandable charts and tables so that I can inspect the operational result.

<a id="des-r003"></a>
**Design DES-R003:** Catalog chooses visualization by metric; chart interaction changes explicit filters visible in the table. R1 includes cards, bar chart and table only, with other types later.

<a id="imp-r003"></a>
**Implementation IMP-R003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R003](ACCEPTANCE_CRITERIA.md#test-r003). **Release:** R1.

<a id="req-r004"></a>
### REQ-R004 — Filters and saved views

**Requirement:** Persist versioned named views with owner, private/team sharing and explicit date/timezone/filter definitions; saving a view never persists broader record access.

**Story:** US-R004 — As a recruiter, I want saved authorized filters so that I can return to a useful operational view.

<a id="des-r004"></a>
**Design DES-R004:** Reauthorize and remap allowed dimensions on each open; relative dates are evaluated in the saved timezone and shown as resolved dates. R1 permits private/team views, not public links.

<a id="imp-r004"></a>
**Implementation IMP-R004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R004](ACCEPTANCE_CRITERIA.md#test-r004). **Release:** R1.

<a id="req-r005"></a>
### REQ-R005 — Protected multi-format exports

**Requirement:** Support PDF, CSV and XLSX for each entitled report with the same snapshot/allowed fields; export generation and every download require current authorization and record scope.

**Story:** US-R005 — As an authorized exporter, I want faithful PDF, CSV and XLSX outputs so that review does not bypass security.

<a id="des-r005"></a>
**Design DES-R005:** Generate private artifacts with tenant and snapshot metadata, sensitivity watermark, locale/currency/timezone, filters and as-of. Files inherit maximum source classification. Expire artifacts in 7 days and download grants in 15 minutes; no public buckets or unauthenticated sharing.

<a id="imp-r005"></a>
**Implementation IMP-R005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R005](ACCEPTANCE_CRITERIA.md#test-r005). **Release:** R1.

<a id="req-r006"></a>
### REQ-R006 — Export content safety and size

**Requirement:** Neutralize CSV/XLSX formula injection and sanitize PDF/HTML rendering; disclose row limits before generation and never silently truncate. R1 cap is 5,000 detail rows per file.

**Story:** US-R006 — As a security administrator, I want safe bounded files so that exports do not execute content or truncate silently.

<a id="des-r006"></a>
**Design DES-R006:** Treat cells beginning with formula control sequences as text; preserve Unicode and escaped delimiters. Reject oversized requests with filtering guidance. PDF uses a repeating header, page numbers and readable table layout.

<a id="imp-r006"></a>
**Implementation IMP-R006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R006](ACCEPTANCE_CRITERIA.md#test-r006). **Release:** R1.

<a id="req-r007"></a>
### REQ-R007 — Scheduled report definitions

**Requirement:** Later support named schedules with timezone, cadence, filters, output formats, recipients and expiry; require reports.schedule, source access and addon.scheduled_reports, with no arbitrary external addresses.

**Story:** US-R007 — As a report scheduler, I want explicit schedules and recipients so that reports are delivered under current access.

<a id="des-r007"></a>
**Design DES-R007:** Only active verified tenant members with their own source permissions can receive scheduled report links; external clients use scoped portal views, not scheduled attachments. Schedule ownership is a named principal, not a shared admin account.

<a id="imp-r007"></a>
**Implementation IMP-R007:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R007](ACCEPTANCE_CRITERIA.md#test-r007). **Release:** Later.

<a id="req-r008"></a>
### REQ-R008 — Schedule execution and recipient scope

**Requirement:** At every run reauthorize owner, recipients and source modules; generate per-recipient authorized snapshots or an explicitly computed common scope; send minimal authenticated links, never sensitive email attachments.

**Story:** US-R008 — As a report recipient, I want my own permitted report so that a sender cannot share broader records with me.

<a id="des-r008"></a>
**Design DES-R008:** Deduplicate by schedule/occurrence/recipient; define missed-run skip/catch-up policy and DST behavior. Pausing source modules or deleting owner pauses the schedule; retries cannot duplicate deliveries.

<a id="imp-r008"></a>
**Implementation IMP-R008:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R008](ACCEPTANCE_CRITERIA.md#test-r008). **Release:** Later.

<a id="req-r009"></a>
### REQ-R009 — Freshness and reconciliation

**Requirement:** Expose source watermark and refresh status, flag failed/lagging sources, version recalculations and reconcile aggregate counts against authorized source fixtures.

**Story:** US-R009 — As a dashboard owner, I want visible stale data so that incomplete integrations do not appear current.

<a id="des-r009"></a>
**Design DES-R009:** Operational KPI cache refresh is at most 5 minutes in R1; full catalog specifies refresh by KPI. Imports become visible after atomic commit. Source outages show last successful as-of plus warning, not a false zero.

<a id="imp-r009"></a>
**Implementation IMP-R009:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R009](ACCEPTANCE_CRITERIA.md#test-r009). **Release:** R1.

<a id="req-r010"></a>
### REQ-R010 — Report catalog, limits and audit

**Requirement:** Register report definitions and allowed joins, enforce export/run caps atomically, audit generation/download/schedule changes and retain saved definitions separately from expiring artifacts.

**Story:** US-R010 — As a tenant admin, I want governed report access and quotas so that report generation remains controlled.

<a id="des-r010"></a>
**Design DES-R010:** R1 plan limits apply per tenant/day in UTC with displayed reset time; read-only recovery exports are rate/safety limited but not commercially paywalled. Deleting a report definition does not silently delete source records.

<a id="imp-r010"></a>
**Implementation IMP-R010:** Planned work item implementing this contract; no code exists. **Test:** [TEST-R010](ACCEPTANCE_CRITERIA.md#test-r010). **Release:** R1.

## Persona dashboard contracts

<a id="req-d001"></a>
### REQ-D001 — Executives dashboard

**Requirement:** Provide a executives dashboard composed only of entitled, authorized KPIs REQ-K001, REQ-K002, REQ-K003, REQ-K004, REQ-K005, REQ-K011; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D001 — As a executives user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d001"></a>
**Design DES-D001:** Dashboard manifest dashboard.001 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Executive/agency-manager permission bundles with separately scoped source grants; financial amounts require salary permission. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d001"></a>
**Implementation IMP-D001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D001](ACCEPTANCE_CRITERIA.md#test-d001). **Release:** R1 agency KPIs only.

<a id="req-d002"></a>
### REQ-D002 — HR leadership dashboard

**Requirement:** Provide a hr leadership dashboard composed only of entitled, authorized KPIs REQ-K005, REQ-K006, REQ-K007; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D002 — As a hr leadership user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d002"></a>
**Design DES-D002:** Dashboard manifest dashboard.002 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Entity-scoped HR leadership; turnover reasons and assessment fields independently restricted. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d002"></a>
**Implementation IMP-D002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D002](ACCEPTANCE_CRITERIA.md#test-d002). **Release:** R2.

<a id="req-d003"></a>
### REQ-D003 — HR operations dashboard

**Requirement:** Provide a hr operations dashboard composed only of entitled, authorized KPIs REQ-K007, REQ-K008; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D003 — As a hr operations user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d003"></a>
**Design DES-D003:** Dashboard manifest dashboard.003 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: HR operations case scope; sensitive attachments not implied by aggregate access. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d003"></a>
**Implementation IMP-D003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D003](ACCEPTANCE_CRITERIA.md#test-d003). **Release:** R2.

<a id="req-d004"></a>
### REQ-D004 — Recruiters dashboard

**Requirement:** Provide a recruiters dashboard composed only of entitled, authorized KPIs REQ-K001, REQ-K002, REQ-K003, REQ-K004; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D004 — As a recruiters user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d004"></a>
**Design DES-D004:** Dashboard manifest dashboard.004 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Assigned agency team/client placements; recruiter has no salary or broad client-portal authority. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d004"></a>
**Implementation IMP-D004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D004](ACCEPTANCE_CRITERIA.md#test-d004). **Release:** R1.

<a id="req-d005"></a>
### REQ-D005 — Payroll teams dashboard

**Requirement:** Provide a payroll teams dashboard composed only of entitled, authorized KPIs REQ-K009, REQ-K010, REQ-K011; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D005 — As a payroll teams user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d005"></a>
**Design DES-D005:** Dashboard manifest dashboard.005 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Entity/pay-period-scoped payroll rights; preparer/approver separation and amount permissions. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d005"></a>
**Implementation IMP-D005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D005](ACCEPTANCE_CRITERIA.md#test-d005). **Release:** R2 inputs; amounts later.

<a id="req-d006"></a>
### REQ-D006 — Line managers dashboard

**Requirement:** Provide a line managers dashboard composed only of entitled, authorized KPIs REQ-K012, REQ-K013; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D006 — As a line managers user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d006"></a>
**Design DES-D006:** Dashboard manifest dashboard.006 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Current team/site scope and delegated approvals; no employee medical details. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d006"></a>
**Implementation IMP-D006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D006](ACCEPTANCE_CRITERIA.md#test-d006). **Release:** R2 approvals; scheduling later.

<a id="req-d007"></a>
### REQ-D007 — Employees dashboard

**Requirement:** Provide a employees dashboard composed only of entitled, authorized KPIs REQ-K014, REQ-K015; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D007 — As a employees user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d007"></a>
**Design DES-D007:** Dashboard manifest dashboard.007 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Self-only, active source-module self access; no company-wide aggregates. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d007"></a>
**Implementation IMP-D007:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D007](ACCEPTANCE_CRITERIA.md#test-d007). **Release:** R2.

<a id="req-d008"></a>
### REQ-D008 — Sales teams dashboard

**Requirement:** Provide a sales teams dashboard composed only of entitled, authorized KPIs REQ-K016, REQ-K017; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D008 — As a sales teams user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d008"></a>
**Design DES-D008:** Dashboard manifest dashboard.008 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Own/team sales pipeline scope; candidate/employee data excluded. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d008"></a>
**Implementation IMP-D008:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D008](ACCEPTANCE_CRITERIA.md#test-d008). **Release:** Later.

<a id="req-d009"></a>
### REQ-D009 — Customer success dashboard

**Requirement:** Provide a customer success dashboard composed only of entitled, authorized KPIs REQ-K018, REQ-K019; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D009 — As a customer success user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d009"></a>
**Design DES-D009:** Dashboard manifest dashboard.009 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Assigned customer accounts and allowed health inputs; restricted tickets remain restricted. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d009"></a>
**Implementation IMP-D009:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D009](ACCEPTANCE_CRITERIA.md#test-d009). **Release:** Later.

<a id="req-d010"></a>
### REQ-D010 — Support teams dashboard

**Requirement:** Provide a support teams dashboard composed only of entitled, authorized KPIs REQ-K020, REQ-K021, REQ-K022; hide unauthorized widgets without revealing their counts and label unavailable-source widgets only to permitted admins.

**Story:** US-D010 — As a support teams user, I want a role-appropriate dashboard so that I can inspect relevant work without broader data access.

<a id="des-d010"></a>
**Design DES-D010:** Dashboard manifest dashboard.010 references metric versions, scoped filters and view preferences; each widget independently evaluates source access. Scope: Assigned queues/cases and CSAT scope; tenant customer-service role is not SaaS operator access. Card/chart/table choices follow KPI_CATALOG.md.

<a id="imp-d010"></a>
**Implementation IMP-D010:** Planned work item implementing this contract; no code exists. **Test:** [TEST-D010](ACCEPTANCE_CRITERIA.md#test-d010). **Release:** Later.


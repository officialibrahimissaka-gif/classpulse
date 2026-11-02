# Indexes, integrity and PostgreSQL enforcement

Baseline: 1 November 2026. The Prisma schema defines keys, relations and ordinary indexes. [prisma/constraints.sql](prisma/constraints.sql) supplies mandatory PostgreSQL-only behavior. It runs **after** generated base DDL as a migration owner, inside its own transaction. It is a migration fragment, not an idempotent script to rerun on a populated production schema. No production database was changed.

## DB-001 — Keys and tenant boundary

Tenant is the root with UUID primary key, unique non-personal routing slug and forced id-scoped RLS. All 164 other models have required tenantId, composite `(tenantId,id)` primary key and Tenant FK. Every declared domain FK uses `(tenantId,parentId)` → `(tenantId,id)`, Restrict deletion/update. No cascading tenant deletion can silently destroy history. Prisma UUID defaults are client-side: raw SQL/migrations must supply UUIDs or explicitly introduce a reviewed server UUID default.

All tables use ENABLE + FORCE RLS; app_runtime/app_retention are non-owner, non-superuser and NOBYPASSRLS. Policy uses transaction-local app.tenant_id. Missing context reads zero rows and writes fail; malformed context errors safely. A table owner/superuser can bypass defenses and is not the application account. Application compromise can set context: SQL injection prevention, narrow credentials and scoped policy remain required. RLS isolates tenants, not salary columns, entity teams or client task grants. Database policies are not a subscription engine.

App transaction wrapper derives tenant only from a verified integrity-protected regional session/invite context and sets it with parameterized set_config(...,true) on the same transaction connection. The cookie's tenant selector is not accepted before signature/session validation. No session-global pooled SET, arbitrary header switch or root-client query inside repositories. Tenant bootstrap, OIDC callbacks and migrations are separately controlled paths; do not introduce a public BYPASSRLS lookup function to make login convenient.

## DB-002 — Uniqueness and indexes

Primary/natural unique keys are detailed per table in DATA_DICTIONARY.md and the schema. Soft deletion does not release identifiers that are externally meaningful or part of audit/idempotency history. A reused email is not a unique person key. Nullable source/provider keys permit multiple absent values under PostgreSQL semantics; require a real key before any idempotent provider operation.

Ordinary indexes begin with tenantId: creation/id cursor, each domain FK lookup, and operational composites (placement entity/status/date, owner/status, client/status; task owner/state/due; job state/available; audit resource/time). These are a complete initial physical design, not a claim of measured optimality. Some FK prefixes overlap longer natural-key indexes; remove proven-redundant indexes only after migration/query-plan review, keeping correctness constraints. Do not deploy every Later index solely for an R1 workload.

SQL-only partial/covering indexes:

| Index | Purpose / trade-off |
|---|---|
| one_open_asset_assignment | One unreturned, undeleted custody record per tenant/asset; return then reassign atomically |
| one_effective_subscription | At most one trial/active subscription per tenant; future scheduled contracts use distinct inactive state |
| due_jobs | Tenant/state-bounded queue polling for pending/retryable_failed jobs; a cross-tenant dispatcher cannot use an unscoped runtime query |
| pending_outbox | Tenant-ready outbox keyset/lease scans, not an unfiltered global worker privilege |
| overdue_tasks | Required operational owner/due lookups over unfinished tasks; required flag applied by query |
| placement_original_cohort | Original-date KPI cohort with actual date/status/client/owner included; write/storage cost must be measured |
| audit_retention_scan | Bounded tenant/time/id audit/retention traversal |

Worker dispatch across tenants uses a minimal authorized control-plane tenant schedule and one scoped transaction per tenant, not blanket RLS bypass. Test EXPLAIN (ANALYZE,BUFFERS) under runtime policy with realistic skew, large tenants, small tenants, archived rows and pagination. Avoid OFFSET and unstable sort on mutable dates. Add trigram/full-text indexes only after query/language quality tests; no external search copy exists in this design.

## DB-003 — Temporal and historical accuracy

EmploymentLifecycleEvent preserves backdated status/end-date changes as append-only effective/recorded facts. OrganizationAssignment preserves effective reporting-line/team/position history. Current Employment.status/manager/position fields are projections for live operations; never filter historical headcount by today's active status. Historical analytics resolve the event/effective versions at business date and as-known watermark, and termination corrections preserve the prior end date. Employer/employee/start identity changes require explicit new employment or a reviewed correction, not casual reassignment.

Effective rows use inclusive validFrom/exclusive validTo plus recordedAt/supersededAt system time. Current row = supersededAt null, not merely the latest createdAt. A correction marks the old row superseded once and inserts replacement version(s) in the same transaction; it cannot modify the old payload/effective interval. Query by `validFrom <= businessDate < validTo` and `recordedAt <= asKnown < supersededAt`, treating null end as infinity. If splitting a formerly open interval, preserve the old complete interval as the prior known version and insert the resulting new nonoverlapping slices.

GiST exclusion constraints require btree_gist and prevent overlapping current intervals for EmploymentTerm/employment, CalendarVersion/calendar, LeavePolicyVersion/entity+policyKey, BenefitPlanVersion/plan, RuleVersion/pack+coverage and ApplicabilityAssignment/entity+domain+workerCategory. Date-interval checks forbid empty/reversed periods. Other records with different allowed overlap semantics (project assignments/contracts/retention scopes) use explicit service precedence/review and locked writes; do not add a universal employment-overlap ban because concurrent jobs can exist.

Effective versions are inserted only when their publication/approval facts are complete. Mutable legal review happens in RuleProposal; publication inserts RuleVersion. Calendars/terms/policies similarly need a reviewed command/proposal before inserting an effective row; generic configuration UI does not edit published rows. Rule pack state defaults unavailable, and the database cannot certify a law or compiled adapter. Dual legal/engineering approval and reviewed fixtures remain application/release gates.

Placement original date is protected; date revisions/transitions preserve replan and reopen history. Approved payroll input facts and finalized run/child facts are protected from ordinary updates. Append-only ledger, stage, calibration, time approval, audit and result rows reject updates. ReportSnapshot plus immutable ReportMetricBinding/ReportResultRow preserve the actual authorized result for the export window; a reference to a mutable source version alone would not reproduce a result.

## DB-004 — Business and relational checks

The SQL includes positive versions, valid intervals, ISO-shaped country/currency codes, declared lifecycle values, nonnegative counters, valid ranges for probability/CSAT/calendar minutes, row caps, typed approval/payment/activity exactly-one targets and role-scope target consistency. ISO shape is not proof a code is assigned: validate against the approved registry in the service. Enforce IANA zones/locale/units through typed registries, not an unmaintainable database regex.

Supplementary keys constrain a task's milestone to the same placement. Context triggers verify task definition/template alignment, client contact/placement relationship, explicit verified contact/member association, payroll input employment/entity, worker/employment term, claim/line currency and approval-step separation. SQL also checks batch/run preparer vs approver, claim/proposal self-approval, net=gross−deductions and immutable finalized payroll children.

Not every contextual rule is encoded as a database trigger: manager/team cycles, per-provider identifier namespace, worker/run currency, benefit/entity applicability, immutable approved expense lines, contract precedence, notice and legal rule coverage require the registered application transaction. Before implementation, add targeted database checks where valuable and tests for every service invariant; schema parsing alone does not establish them. For custom roles, roles.manage can grant only delegable permissions/scopes, cannot alter compiled built-in bundles or approve self-escalation. Raw app database credentials are never distributed to tenant users.

## DB-005 — Money and atomic operations

Money is numeric(20,4), intermediate monetary rates/results numeric(28,10), non-money quantities with explicit declared scale. Wire values are decimal strings. A supported currency's approved minor-unit exponent must fit storage; reject unsupported precision rather than round during parsing. Arithmetic uses decimal/rational operations and an explicit reviewed rounding mode at the legally specified step. PostgreSQL default round() behavior is not silently the payroll legal policy. Save unrounded/rounded lines and rule version; never combine currencies without a separately attributed conversion.

An active-capacity reservation locks/updates UsageCounter with `WHERE used+reserved+requested <= hard_limit`, increments version once and inserts a unique reservation in the same transaction. A downgraded counter can have used>hardLimit, preserving data; it simply cannot allocate more. On commit convert reserved→used once; on rollback/failure/expiry release once. Transaction retry cannot repeat an external side effect. Consumption and reversal ledgers are append-only with unique operation keys. For leave, lock LeaveAccount before summing/posting ledger entries; two concurrent requests cannot independently spend the same available units.

Use short READ COMMITTED transactions with row locks/conditional updates for ordinary commands; REPEATABLE READ for snapshot capture; SERIALIZABLE only for identified multi-row predicate invariants with bounded whole-command retry. Deferrable checks are introduced only when an explicitly reviewed atomic operation needs them. Lock ordering: tenant entitlement fence → module/dependency keys sorted → quota keys sorted → aggregate/children sorted → ledger/approval → audit/outbox. Never run PDF generation or unbounded provider calls inside a data transaction. Bounded dispatch fencing is the deliberate exception documented in ARCH-005.

## DB-006 — Archival, erasure and role separation

Archived/deleted timestamps are visibility markers, not physical deletion, restored quota changes or legal-erasure evidence. Generic runtime DELETE is denied by trigger; app_retention performs approved tenant-scoped deletions in dependency order, with holds, tombstones and audit. It cannot turn off RLS. Some historical FKs require preserving a minimal pseudonymous actor shell while erasing unnecessary identifying fields; this is still protected pseudonymous data, not automatic anonymization. Approved purpose/legal review decides what must be retained. Secret/file removal includes versions, indexes, snapshots, staging and backups.

Parent/child ownership cannot change via FK reassignment to bypass privacy or entity scope. Primary IDs/tenant/creation timestamps are immutable. Mutable rows require version+1. Table audit/retention paths have separate authority, reviewed functions/jobs and no user API to set maintenance-role state. The migration owner has broader access and is kept out of all web/worker credentials. These companion scripts are necessary controls but do not implement identity, permission, entitlement or legal-review services.

## R1 reusable report summary

Migration `202611020002_report_snapshot_summary` adds only nullable JSONB `report_snapshot.summary` and a basic JSON-object/schema/required-key check. Strict application schema, row-count/provenance and canonical snapshot-hash checks additionally validate reads. The existing append-only snapshot/result-row guards prohibit mutation; existing tenant/requester/snapshot and placement-key indexes support lookup/current-scope checks. No index is added on opaque summary JSON because no unbounded JSON filter query is introduced. Fresh nine-migration replay and existing populated database upgrade are required checks; prior migration files are unchanged.

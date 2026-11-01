# User journeys

Version 0.1 • 1 November 2026 • Journey contracts, not observed customer behavior. Persona IDs are proto-personas in UX_DESIGN_SPECIFICATION.md. Screen IDs refer to WIREFRAME_SPECIFICATIONS.md; existing REQ/TEST IDs retain their source meaning.

## JRN-01 — Discover the product and compare scope

PER-01/04 enters SCR-01 → SCR-02 → request a conversation or registration SCR-03. The user sees agency placement coordination first, a truthful capability comparison, proposed plan limits and a clear separation between available and planned modules. No invented price, discount, customer testimonial, legal certification or guaranteed result appears. A module/feature comparison explains unit definitions and external participant treatment.

Success: user can explain what R1 does and does not include before committing. Failure path: a planned payroll/compliance feature leads to information, not an activation/payment flow. Research task: ask users to identify the cheapest *appropriate scope*, not a fictional price. Trace: REQ-L001/L002, REQ-E002/E012; SCR-01/02/18.

## JRN-02 — Register, verify and set up the tenant

PER-04 follows SCR-03 → verified identity/MFA as required → SCR-04. Steps: company identity and approved home region; legal entity/authority/timezone/currency; access/roles and restricted visibility; supported module/trial/order choice; approved privacy/retention responsibility; review and create. Show progress and exact persistent setup state, with safe resume after session recovery. A legal entity is not inferred from a user's email domain or billing address.

Confirm country/regime selections as factual administrative input, not legal certification. If retention/residency/order approval is not complete, show pending setup rather than pretending production activation succeeded. No card is required in the designed R1 manual-contract/trial path. A started 14-day trial shows the exact expiry and no automatic charge. Failure: wrong region/country requirement is an explicit support/review path, not an instant migration dropdown. Success: an authorized scoped tenant opens the R1 workspace; no fabricated employee records are created. Trace: REQ-P001/P002/P005/P012, REQ-E002/E010; UX-DELTA-04.

## JRN-03 — Import accepted placements

PER-02 opens SCR-22 → SCR-24, downloads the documented minimal CSV template, chooses a file (no drag-only requirement), maps allowed fields, validates, inspects row/column error codes and previews changes/capacity. The primary action changes from “Validate file” to “Commit N placements” only after server validation. Show which records would be created/reused/conflicted and the source profile; do not match people automatically by email.

Failure: one invalid row prevents atomic commit, keeps safe mapping settings and exposes a permitted error file; no partial success or raw personal rows in general logs. At cap, show the limit and a scoped admin route without charging. A retry with the same operation key retrieves the original result. Success: one committed batch produces correctly owned placements/tasks and navigates to its filtered result, with original dates preserved. Trace: REQ-F040, REQ-E008/E009, TEST-F040/L004; SCR-24.

## JRN-04 — Coordinate and confirm a start

PER-02 enters SCR-27 or SCR-22 → SCR-23. Read original/current planned start, status, owner and mandatory task progress. Assign work, resolve exceptions and review the evidence timeline. PER-01 decides readiness only after required tasks are complete/waived; a waiver requires a reason and agency authority. Confirming start is a separate action collecting actual business date and reason/evidence, followed by server-confirmed actor/time.

Replan: show old/new dates and effect on current work without changing the original KPI cohort. Reopen: warn about released/re-reserved active capacity, retained history and renewed review; no old reminders auto-replay. Failure: changed version opens a conflict comparison; missing prerequisite links to the permitted task, not a generic red error. Success: start confirmed with traceable history, correct KPI update/as-of and no employment-eligibility promise. Trace: REQ-F001–F003, REQ-P006/P012, TEST-L004; SCR-23.

## JRN-05 — Complete a client task safely

PER-03 receives minimal email → SCR-26 → SCR-25. Verify identity and a single-use invitation, then see one shared placement context and assigned tasks. No full employee/agency navigation, client-wide list, salary, personal notes or unshared candidate contact fields are shown. Task completion has an explicit label and confirmation; it cannot waive a prerequisite or mark the placement ready/started.

Expired/revoked invitation: safe message and permissioned request for a fresh invitation; do not reveal whether a guessed placement exists. Switching client identities cannot reuse stale cached records. Success: permitted task completion reaches the agency review queue and the participant understands that agency readiness is separate. Trace: REQ-P001–P003, REQ-F003, TEST-F003/P002; responsive priority 390 px.

## JRN-06 — Investigate a metric and export

PER-01 opens SCR-06 → selects date/entity/client/owner → inspects a KPI definition/as-of → drills into permitted records → saves a view or opens SCR-16 → chooses PDF/CSV/XLSX and generates an export. Keep metric version, filters, cohort/date basis, currency and snapshot across all views. Printing is an explicit report snapshot action, not printing a half-loaded dashboard shell.

Failure: a source error labels the last successful result; changed permission prevents an existing download and offers regeneration only if still authorized. Above 5,000 detail rows, explain the bound and request a narrower filter; never truncate silently. Success: all three output formats show the same authorized snapshot, with print metadata and clear download expiry. Trace: REQ-R001–R006/R009/R010, REQ-K001–K004, TEST-R005/R006; UX-DELTA-05.

## JRN-07 — Change module or subscription without losing data

PER-04 opens SCR-18/SCR-19, reviews current contract/usage and requests a supported change. Activation shows dependencies, eligibility and approved commercial effect; R1 upgrades are order-based and cannot silently charge. Deactivation previews dependents, queued work, retained records and read/export window; user explicitly confirms the listed transition. The UI waits for server state/revision rather than faking a successful toggle.

If a dependency is active, block the change until an explicit dependent read_only transition is approved. Trial expiry/downgrade preserves authorized data and exit export; over-cap existing records remain while new allocation is blocked. Reactivation previews retained data and current prerequisites; deleted data is not restored. Security suspension is a different recovery flow. Success: user can locate retained data and explain what stops, what remains and when contractual deletion may apply. Trace: REQ-E003–E014, TEST-E004/E005/E007/E011.

## JRN-08 — HR and manager approval (Later)

PER-05 uses SCR-07/08/09 to review a permitted effective employment history; PER-07 enters SCR-21 or SCR-12 for team approvals. Show applicable entity/calendar/units and source records. A manager sees absence status necessary for the decision, not confidential medical attachments. An employee uses SCR-20 to submit a leave request and inspect pending reservation vs posted balance.

Failure: stale balance/version requires revalidation; no frontend subtraction or optimistic approval. After approval/cancellation the central ledger determines visible state and reversal. Transfers update access and effective history, not an old profile in place. Success: authorized decisions, safe history and understandable units. Trace: REQ-F004/F006–F009/F017/F018/F021, REQ-K005–K015; not R1.

## JRN-09 — Prepare and approve payroll (Later)

PER-06 opens SCR-11, selects entity/pay period/provider/currency, resolves missing/conflicting inputs and submits a complete reviewed batch. A separate approver reviews totals/source versions and approves; reviewed country/provider rules are prerequisites. The status rail distinguishes approved, exported, provider accepted and reconciled/paid evidence.

Failure: unsupported regime/rule/format blocks the affected operation with a review explanation; it does not offer “ignore compliance.” Self-approval is denied. Provider timeout stays confirmation pending, not success; locked results need a corrected run/adjustment. Success: approved facts are explainable and historical outputs remain intact. Trace: REQ-F013–F016/F042/F043, TEST-F013–F016; net payroll is never relabelled employer payroll cost.

## JRN-10 — Review performance and employee experience (Later)

PER-08 uses SCR-20/13 to review goals, submit permitted feedback and inspect published outcomes. PER-05 can access authorized cohorts/calibration with reasoned changes. Draft reviews and restricted succession/compensation/cases remain separately scoped. Success: the employee distinguishes draft, submitted, published and acknowledged without a manager's draft assessment leaking. Trace: REQ-F021–F028/F050; no automated employment decisions or privacy-insensitive ranking.

## JRN-11 — Progress a customer relationship (Later)

PER-09 opens SCR-14 → SCR-15, inspects authorized opportunities and next actions, moves a stage via a named command and obtains required quote/discount approval. Forecast/pipeline uses explicit currency and stage assumptions. Marking won needs accepted commercial evidence; it does not create cash or recognized revenue. Failure: a lost/reopened deal retains history, and user permissions do not expand from an account relation into candidate/employee data. Trace: REQ-F030–F032/F051 and REQ-K016/K017.

## JRN-12 — Customer success and support (Later)

PER-10 uses SCR-28/SCR-29 and SCR-15's licensed tabs. A success plan has owned milestones and explainable current/unknown health factors. A support agent sees assigned cases, first-human-response/SLA history, approved knowledge and a safe reply editor. Restricted replies stay absent from account-health drill-down. Waiting pauses an SLA only under the captured policy; reopening preserves prior events. Renewal and CSAT are not inferred from case closure. Trace: REQ-F033–F036, REQ-K018–K022; no vendor-operator impersonation is available here.

## Journey review and measurement

Use JRN-02–JRN-07 as R1 moderated tasks and acceptance paths, including a keyboard/mobile client and a removed-member negative test. Record observed actions, assistance, failed expectations, safe recovery and clarity of original/current dates. Later journeys are design-research plans; do not claim measured success, conversion, time saved or willingness to pay. Approval checks: core flow understood; no critical privacy/state confusion; required empty/error/conflict/read-only paths designed; accessibility review; UX-DELTA resolutions recorded before affected build. No outreach or user interviews were performed in this task.

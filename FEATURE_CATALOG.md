# Hierarchical feature catalog

Version 0.1 • 1 November 2026 • Proposed product design; no implementation or executed tests.

## Catalog conventions

Each feature block is a canonical requirement with a stable ID, user story, business rule, design record, planned implementation work item and acceptance-test link. Metadata establishes domain → module → submodule → feature hierarchy. All requirements inherit the platform security contracts and the entitlement lifecycle; inheritance does not grant permissions. Permissions listed are conjunctive for the named composite operation; individual endpoints use the smallest relevant action plus scope. Data classification is the maximum possible data handled, not permission to expose every field. Release labels distinguish R1, R2 candidates and later vision.

Feature flags are not subscription entitlements. Country requirements remain subject to current-source/legal review. No feature below is implemented.

## Recruitment operations → agency.starts → Placement registry

**Permissions:** placements.write, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f001"></a>
### REQ-F001 — Accepted-placement entry

**Requirement:** Create a placement only with a tenant client, candidate reference, owner, accepted date, agreed planned-start date and timezone; preserve a minimal candidate reference independently of a full ATS.

**Story:** US-F001 — As a recruiter, I want to record an accepted offer so that its start can be coordinated.

<a id="des-f001"></a>
**Design DES-F001:** Placement states: accepted → coordinating → ready → started; canceled is terminal. Blocked is a separate exception flag. Date edits keep the original plan and a revision history; started requires an actual-start date and actor evidence.

<a id="imp-f001"></a>
**Implementation IMP-F001:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F001](ACCEPTANCE_CRITERIA.md#test-f001). **Release:** R1.

## Recruitment operations → agency.starts → Milestones and tasks

**Permissions:** placements.write, tasks.assign, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f002"></a>
### REQ-F002 — Owned handoffs and exceptions

**Requirement:** Instantiate versioned milestones with required/optional tasks, owner, due date and explicit completion; mark overdue from due date and status, and require a reason for waiving a required task.

**Story:** US-F002 — As an agency operations manager, I want accountable tasks so that pending handoffs are visible.

<a id="des-f002"></a>
**Design DES-F002:** Task has status, owner, due_at, completion/waiver actor and evidence note. Exception has category, opened/closed timestamps and accountable role. R1 allows document-status metadata but rejects document files and unrestricted identity-document fields.

<a id="imp-f002"></a>
**Implementation IMP-F002:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F002](ACCEPTANCE_CRITERIA.md#test-f002). **Release:** R1.

## Recruitment operations → agency.starts → Readiness and collaboration

**Permissions:** participants.manage, placements.decide, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f003"></a>
### REQ-F003 — Scoped client participation and readiness

**Requirement:** Invite a client participant to one placement and explicit fields/tasks; only an agency user with placements.decide may mark ready, waive prerequisites or confirm started.

**Story:** US-F003 — As an agency manager, I want controlled client sign-off so that readiness decisions have an accountable owner.

<a id="des-f003"></a>
**Design DES-F003:** Participation grants bind placement, client contact, allowed fields, actions and expiry. Client completion is a signal for agency review, not employment eligibility. Client views omit candidate contact details unless explicitly shared; candidates do not receive portal access in R1.

<a id="imp-f003"></a>
**Implementation IMP-F003:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F003](ACCEPTANCE_CRITERIA.md#test-f003). **Release:** R1.

## HRMS → hr.records → Employment master

**Permissions:** employees.write, employees.restricted.read, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** platform.core.

<a id="req-f004"></a>
### REQ-F004 — People, entities and contracts

**Requirement:** Separate person, employment and legal entity; require authorized conversion from candidate and preserve multiple employment periods without overwriting history.

**Story:** US-F004 — As an HR administrator, I want effective-dated employment records so that transfers and contracts remain traceable.

<a id="des-f004"></a>
**Design DES-F004:** Effective-dated Employment links Person to entity, location, manager and contract version. Salary, bank and identity fields require independent S3 grants. Duplicate review never merges on email alone.

<a id="imp-f004"></a>
**Implementation IMP-F004:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F004](ACCEPTANCE_CRITERIA.md#test-f004). **Release:** R2.

## HRMS → hr.records → Documents

**Permissions:** documents.manage, documents.restricted.read, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** platform.core.

<a id="req-f005"></a>
### REQ-F005 — Controlled document records

**Requirement:** Permit only configured document types and necessary fields, classify attachments as S3, scan files, record purpose/expiry and restrict upload, view, download and export independently.

**Story:** US-F005 — As an HR administrator, I want restricted document handling so that required records can be maintained safely.

<a id="des-f005"></a>
**Design DES-F005:** Document metadata is separate from encrypted blob. Quarantine until scan passes; signed downloads recheck actor and purpose. Document existence is not authenticity or government verification.

<a id="imp-f005"></a>
**Implementation IMP-F005:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F005](ACCEPTANCE_CRITERIA.md#test-f005). **Release:** Later.

## HRMS → hr.leave → Policies and requests

**Permissions:** leave.request, leave.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f006"></a>
### REQ-F006 — Leave balances and approvals

**Requirement:** Use effective-dated entity policies for accrual, units, working calendars and approval; reserve pending balances atomically and distinguish pending from approved absence.

**Story:** US-F006 — As an employee, I want to request leave against an applicable policy so that approval and balance are clear.

<a id="des-f006"></a>
**Design DES-F006:** LeaveLedger records grants, reservations, consumption and reversals in explicit units. Medical attachments, if enabled, are isolated S3; managers see only needed absence status.

<a id="imp-f006"></a>
**Implementation IMP-F006:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F006](ACCEPTANCE_CRITERIA.md#test-f006). **Release:** R2.

## HRMS → hr.leave → Absence corrections

**Permissions:** leave.policy.manage, leave.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f007"></a>
### REQ-F007 — Leave adjustments and payroll handoff

**Requirement:** Require reason and separate approval for manual adjustments; locked-period changes produce a future adjustment event rather than silently mutating finalized outputs.

**Story:** US-F007 — As an HR administrator, I want approved adjustments so that absence corrections do not rewrite a closed payroll.

<a id="des-f007"></a>
**Design DES-F007:** Adjustment links original ledger entry, approving actor and payroll period; include provisional preview and immutable approval history.

<a id="imp-f007"></a>
**Implementation IMP-F007:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F007](ACCEPTANCE_CRITERIA.md#test-f007). **Release:** R2.

## HRMS → hr.lifecycle → Joiner and mover

**Permissions:** lifecycle.manage, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f008"></a>
### REQ-F008 — Onboarding and transfers

**Requirement:** Apply effective-dated employee lifecycle templates and require explicit responsibility for equipment, records and employment actions; no task completion constitutes permit approval.

**Story:** US-F008 — As an HR operations user, I want a joiner/mover checklist so that ownership follows the employment entity.

<a id="des-f008"></a>
**Design DES-F008:** LifecycleCase is linked to Employment and immutable template version; entity transfers re-evaluate permissions before creating target-entity tasks.

<a id="imp-f008"></a>
**Implementation IMP-F008:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F008](ACCEPTANCE_CRITERIA.md#test-f008). **Release:** R2.

## HRMS → hr.lifecycle → Leaver

**Permissions:** lifecycle.manage, lifecycle.complete, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f009"></a>
### REQ-F009 — Offboarding and access handoff

**Requirement:** Separate planned termination, approved effective date, access revocation and final settlement; require authorized approval before finalizing termination.

**Story:** US-F009 — As an HR administrator, I want controlled offboarding so that access revocation and final actions are tracked.

<a id="des-f009"></a>
**Design DES-F009:** OffboardingCase emits revocation requests through enabled connectors and records provider acknowledgments; failed revocation remains an exception, not a success.

<a id="imp-f009"></a>
**Implementation IMP-F009:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F009](ACCEPTANCE_CRITERIA.md#test-f009). **Release:** R2.

## HRMS → hr.benefits → Enrollment and reimbursement

**Permissions:** benefits.manage, expenses.request, expenses.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f010"></a>
### REQ-F010 — Benefits and expenses

**Requirement:** Use employer-reviewed eligibility, provider acknowledgment and receipt approval; prohibit claim approvers from approving their own claim and separate approved from paid.

**Story:** US-F010 — As an employee, I want controlled enrollment and claims so that eligibility and payment status are explicit.

<a id="des-f010"></a>
**Design DES-F010:** BenefitEnrollment and ExpenseClaim have separate lifecycle, sensitive attachments and retention; payment acknowledgment is an external event, not inferred from approval.

<a id="imp-f010"></a>
**Implementation IMP-F010:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F010](ACCEPTANCE_CRITERIA.md#test-f010). **Release:** Later.

## Talent acquisition → talent.ats → Requisition and pipeline

**Permissions:** requisitions.manage, applications.read, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f011"></a>
### REQ-F011 — Recruiting pipeline

**Requirement:** Require requisition ownership and approved openings; preserve application-stage transitions and rejection reasons with candidate access restricted to the hiring team.

**Story:** US-F011 — As a recruiter, I want approved requisitions and stage history so that hiring decisions are traceable.

<a id="des-f011"></a>
**Design DES-F011:** Candidate is a person reference; Application links candidate to requisition. Client consent/sharing is a separate grant; protected characteristics are not ranking inputs.

<a id="imp-f011"></a>
**Implementation IMP-F011:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F011](ACCEPTANCE_CRITERIA.md#test-f011). **Release:** Later.

## Talent acquisition → talent.ats → Interview and offer

**Permissions:** applications.decide, offers.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f012"></a>
### REQ-F012 — Structured evaluation and accepted-offer handoff

**Requirement:** Restrict evaluation access, version offer approvals and create a placement only after explicit acceptance; do not make autonomous hire/reject decisions.

**Story:** US-F012 — As a hiring manager, I want structured reviews and approved offers so that an accepted offer can hand off safely.

<a id="des-f012"></a>
**Design DES-F012:** InterviewFeedback is scope-restricted; Offer versions link approval and acceptance evidence. A deduplicated accepted-offer event can create one agency placement if that module is active.

<a id="imp-f012"></a>
**Implementation IMP-F012:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F012](ACCEPTANCE_CRITERIA.md#test-f012). **Release:** Later.

## Payroll → payroll.inputs → Input collection

**Permissions:** payroll.inputs.prepare, payroll.inputs.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f013"></a>
### REQ-F013 — Payroll exception workspace

**Requirement:** Reconcile imported time, absence and manual adjustments by worker/period; flag missing source/approval and enforce preparer-approver separation before handoff.

**Story:** US-F013 — As a payroll preparer, I want approved inputs and discrepancies in one place so that handoff is complete.

<a id="des-f013"></a>
**Design DES-F013:** PayrollInputBatch stores source revisions, explicit units/currencies, validation and approvals. Time/leave modules are optional adapters; approved provider files can be imported instead.

<a id="imp-f013"></a>
**Implementation IMP-F013:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F013](ACCEPTANCE_CRITERIA.md#test-f013). **Release:** R2.

## Payroll → payroll.inputs → Provider handoff

**Permissions:** payroll.inputs.approve, payroll.export, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f014"></a>
### REQ-F014 — Versioned payroll exports and reconciliation

**Requirement:** Generate only reviewed provider-format versions for the entity; distinguish created, approved, exported, provider-accepted, rejected and reconciled; never equate a file export with wage payment.

**Story:** US-F014 — As a payroll approver, I want accepted provider outputs distinguished from transmission so that payment is not assumed.

<a id="des-f014"></a>
**Design DES-F014:** ExportManifest includes batch hash, format version, approver, totals and provider reference. Rejections produce corrections/new version; original approved batch remains immutable.

<a id="imp-f014"></a>
**Implementation IMP-F014:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F014](ACCEPTANCE_CRITERIA.md#test-f014). **Release:** R2.

## Payroll → payroll.engine → Calculation and approval

**Permissions:** payroll.calculate, payroll.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** payroll.inputs, compliance.country.

<a id="req-f015"></a>
### REQ-F015 — Versioned pay runs

**Requirement:** Calculate using an approved entity/jurisdiction rule version with explicit rounding, currencies and pay periods; block finalization without separate approval and approved retention schedule.

**Story:** US-F015 — As a payroll approver, I want reviewed calculations so that payroll can be explained and finalized.

<a id="des-f015"></a>
**Design DES-F015:** PayRun snapshots input and rule versions, calculation lines and approval. Recalculations create new drafts; locked runs change only through approved adjustment runs. Payment execution is a distinct future service, not included.

<a id="imp-f015"></a>
**Implementation IMP-F015:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F015](ACCEPTANCE_CRITERIA.md#test-f015). **Release:** Later.

## Payroll → payroll.engine → Statements and settlement

**Permissions:** payroll.release, self.payslip.read, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** payroll.inputs, compliance.country.

<a id="req-f016"></a>
### REQ-F016 — Payslips and final settlement

**Requirement:** Publish statements only for finalized runs, restrict employee access to self and require a reviewed applicable settlement rule; separate settlement approval from payment.

**Story:** US-F016 — As a payroll user, I want immutable statements and reviewed settlements so that employee outputs match an approved run.

<a id="des-f016"></a>
**Design DES-F016:** Payslip snapshots approved calculation and locale/currency; corrections supersede rather than overwrite. FinalSettlement links employment end event, inputs and rule version.

<a id="imp-f016"></a>
**Implementation IMP-F016:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F016](ACCEPTANCE_CRITERIA.md#test-f016). **Release:** Later.

## Workforce → workforce.time → Collection

**Permissions:** time.submit, time.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f017"></a>
### REQ-F017 — Time entry and attendance exceptions

**Requirement:** Support authorized manual/time-device imports with timezone and source provenance; flag duplicates, overlaps and missing records; location/biometric collection is off unless separately reviewed and entitled.

**Story:** US-F017 — As a line manager, I want approved attendance records so that missing or conflicting time is resolved.

<a id="des-f017"></a>
**Design DES-F017:** TimeEntry keeps original events and approved corrections; adapters are optional integrations. No inferred shift absence is finalized without review.

<a id="imp-f017"></a>
**Implementation IMP-F017:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F017](ACCEPTANCE_CRITERIA.md#test-f017). **Release:** R2.

## Workforce → workforce.time → Approval and handoff

**Permissions:** time.approve, payroll.inputs.prepare, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f018"></a>
### REQ-F018 — Approved time handoff

**Requirement:** Freeze approved time for a cutoff, preserve units and create adjustment records for later changes; require explicit mapping before payroll-input handoff.

**Story:** US-F018 — As a payroll preparer, I want locked approved totals so that later corrections are explicit.

<a id="des-f018"></a>
**Design DES-F018:** TimeApprovalSnapshot links entry versions to target period; a retraction produces a visible exception and versioned delta.

<a id="imp-f018"></a>
**Implementation IMP-F018:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F018](ACCEPTANCE_CRITERIA.md#test-f018). **Release:** R2.

## Workforce → workforce.schedule → Planning

**Permissions:** schedule.manage, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f019"></a>
### REQ-F019 — Shift plans and coverage

**Requirement:** Publish versioned shifts by site/team with local timezone; flag configured overlap, availability and skill constraints without claiming legal scheduling compliance.

**Story:** US-F019 — As a line manager, I want conflict-aware rosters so that planned coverage is visible.

<a id="des-f019"></a>
**Design DES-F019:** Shift and Assignment separate planned coverage from actual attendance. Applicable country constraints are reviewed rules, not hard-coded assumptions.

<a id="imp-f019"></a>
**Implementation IMP-F019:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F019](ACCEPTANCE_CRITERIA.md#test-f019). **Release:** Later.

## Workforce → workforce.schedule → Changes

**Permissions:** schedule.swap.approve, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f020"></a>
### REQ-F020 — Shift swap approval

**Requirement:** Require both worker participation and authorized manager approval; recheck availability, permissions and module entitlement at commit.

**Story:** US-F020 — As an employee, I want an approved swap so that responsibility changes without losing coverage.

<a id="des-f020"></a>
**Design DES-F020:** SwapRequest reserves proposed participants but changes assignments atomically only on final approval; expiration releases pending reservations.

<a id="imp-f020"></a>
**Implementation IMP-F020:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F020](ACCEPTANCE_CRITERIA.md#test-f020). **Release:** Later.

## Employee experience → experience.portal → Self-service

**Permissions:** self.profile.read, self.requests.write, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f021"></a>
### REQ-F021 — Employee profile and service requests

**Requirement:** Expose only approved self fields and requests for enabled source modules; sensitive master changes are approval requests, not direct edits.

**Story:** US-F021 — As an employee, I want scoped self-service so that I can see my records and request changes.

<a id="des-f021"></a>
**Design DES-F021:** Portal reads through source-module policies. An approved address change updates the source record with audit; self-service never bypasses an inactive source module.

<a id="imp-f021"></a>
**Implementation IMP-F021:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F021](ACCEPTANCE_CRITERIA.md#test-f021). **Release:** R2.

## Employee experience → experience.portal → Notifications

**Permissions:** self.profile.read, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f022"></a>
### REQ-F022 — Employee inbox and acknowledgments

**Requirement:** Provide authenticated notices and explicit acknowledgments; email contains minimal context and no salary, identity documents or sensitive case content.

**Story:** US-F022 — As an employee, I want understandable notifications so that I can act without receiving sensitive data in messages.

<a id="des-f022"></a>
**Design DES-F022:** Notification stores template version, source permission and delivery/ack states separately. Source entitlement/permission is rechecked when opened.

<a id="imp-f022"></a>
**Implementation IMP-F022:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F022](ACCEPTANCE_CRITERIA.md#test-f022). **Release:** R2.

## Employee experience → experience.engagement → Feedback and employee relations

**Permissions:** engagement.manage, cases.confidential.manage, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f023"></a>
### REQ-F023 — Surveys and confidential employee cases

**Requirement:** Distinguish identified, confidential and anonymous collection; suppress anonymous cohort reporting below five responses and prohibit access that reconstructs identities through filters.

**Story:** US-F023 — As an employee, I want feedback and protected case channels so that my concerns reach the right team.

<a id="des-f023"></a>
**Design DES-F023:** Survey snapshots consent and anonymity settings before launch. EmployeeCase has separate restricted access from line-manager records; no automatic sentiment-based employment decision.

<a id="imp-f023"></a>
**Implementation IMP-F023:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F023](ACCEPTANCE_CRITERIA.md#test-f023). **Release:** Later.

## HCM → talent.performance → Goals and reviews

**Permissions:** performance.self, performance.review, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f024"></a>
### REQ-F024 — Goals and review cycles

**Requirement:** Version goal ownership and review templates; limit feedback visibility by cycle policy and require explicit publication rather than exposing draft reviews.

**Story:** US-F024 — As an employee, I want clear goals and review steps so that expectations and outcomes are recorded.

<a id="des-f024"></a>
**Design DES-F024:** Goal, ReviewCycle and ReviewSubmission retain scoring scales and reviewer relationships effective for that cycle.

<a id="imp-f024"></a>
**Implementation IMP-F024:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F024](ACCEPTANCE_CRITERIA.md#test-f024). **Release:** Later.

## HCM → talent.performance → Calibration

**Permissions:** performance.calibrate, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f025"></a>
### REQ-F025 — Controlled calibration

**Requirement:** Restrict calibration to explicit cohorts and require reason for rating changes; no autonomous ranking or termination recommendations.

**Story:** US-F025 — As an HR leader, I want auditable calibration so that rating adjustments have accountable reasons.

<a id="des-f025"></a>
**Design DES-F025:** CalibrationDecision references original and revised ratings, actor and meeting scope; reports mask restricted assessments.

<a id="imp-f025"></a>
**Implementation IMP-F025:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F025](ACCEPTANCE_CRITERIA.md#test-f025). **Release:** Later.

## HCM → talent.learning → Assignments and credentials

**Permissions:** learning.assign, learning.complete, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f026"></a>
### REQ-F026 — Learning and renewal tracking

**Requirement:** Separate enrollment, provider-reported completion and credential review/expiry; prevent a completion checkbox from being presented as professional-license verification.

**Story:** US-F026 — As a learning administrator, I want assignments and evidence of completion so that learning needs can be followed up.

<a id="des-f026"></a>
**Design DES-F026:** LearningAssignment links content version and due date; provider event IDs deduplicate completions; credential metadata has reviewer/provenance.

<a id="imp-f026"></a>
**Implementation IMP-F026:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F026](ACCEPTANCE_CRITERIA.md#test-f026). **Release:** Later.

## HCM → talent.compensation → Budget and approvals

**Permissions:** compensation.plan, compensation.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f027"></a>
### REQ-F027 — Compensation planning cycles

**Requirement:** Restrict salary access, validate budget/currency and require separate approval; an approved proposal does not alter payroll until an explicit effective-dated handoff.

**Story:** US-F027 — As a compensation manager, I want restricted budgeted pay proposals so that approved changes can hand off deliberately.

<a id="des-f027"></a>
**Design DES-F027:** CompensationCycle stores budget versions and proposal/approval history; FX assumptions, if any, have source/date and are not silently converted.

<a id="imp-f027"></a>
**Implementation IMP-F027:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F027](ACCEPTANCE_CRITERIA.md#test-f027). **Release:** Later.

## HCM → talent.succession → Skills and succession

**Permissions:** skills.self, succession.manage, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f028"></a>
### REQ-F028 — Skills profiles and succession plans

**Requirement:** Separate employee-visible skills from restricted readiness/bench assessments and require human review of proposed successors.

**Story:** US-F028 — As an HR leader, I want restricted succession plans so that sensitive assessments are not shared as ordinary profiles.

<a id="des-f028"></a>
**Design DES-F028:** SkillEvidence includes source and verification status; SuccessionPlan has independent named access and review expiry. No protected-trait scoring.

<a id="imp-f028"></a>
**Implementation IMP-F028:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F028](ACCEPTANCE_CRITERIA.md#test-f028). **Release:** Later.

## CRM → crm.accounts → Client references

**Permissions:** accounts.write, contacts.manage, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** platform.core.

<a id="req-f029"></a>
### REQ-F029 — Client accounts and contacts

**Requirement:** Create tenant-scoped account/contact records with owner and explicit client links; client contact access never grants visibility to all placements for that account.

**Story:** US-F029 — As a recruiter, I want client references so that placement ownership and contacts are unambiguous.

<a id="des-f029"></a>
**Design DES-F029:** R1 includes name, work contact, relationship owner and placement linkage only; pipeline, contract/quote automation and client tenant federation remain later scope.

<a id="imp-f029"></a>
**Implementation IMP-F029:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F029](ACCEPTANCE_CRITERIA.md#test-f029). **Release:** R1.

## CRM → crm.accounts → Commercial relationships

**Permissions:** accounts.write, contracts.read, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** platform.core.

<a id="req-f030"></a>
### REQ-F030 — Contracts and account relationships

**Requirement:** Version account hierarchies and contract references; permissions for commercial terms are independent from candidate/employee records.

**Story:** US-F030 — As an account manager, I want reviewed contract versions so that commercial obligations remain traceable.

<a id="des-f030"></a>
**Design DES-F030:** AccountRelationship and ContractVersion reference legal entity, dates, currency and approver; e-signature requires a separate provider integration.

<a id="imp-f030"></a>
**Implementation IMP-F030:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F030](ACCEPTANCE_CRITERIA.md#test-f030). **Release:** Later.

## Sales → crm.sales → Opportunities

**Permissions:** opportunities.manage, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f031"></a>
### REQ-F031 — Sales activities and pipeline

**Requirement:** Track account-scoped opportunity stages, owner, amount/currency, close date and activities; record stage history and prevent cross-tenant contact sharing.

**Story:** US-F031 — As a sales agent, I want opportunities and next actions so that commercial work can be tracked.

<a id="des-f031"></a>
**Design DES-F031:** Opportunity separates expected value from booked revenue; activity visibility follows account/team scope.

<a id="imp-f031"></a>
**Implementation IMP-F031:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F031](ACCEPTANCE_CRITERIA.md#test-f031). **Release:** Later.

## Sales → crm.sales → Quotes and forecasting

**Permissions:** quotes.approve, sales.forecast.read, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f032"></a>
### REQ-F032 — Quote approval and weighted forecast

**Requirement:** Require configured approval for discounts/terms; publish forecast using explicit stage probabilities and currency assumptions, not inferred revenue recognition.

**Story:** US-F032 — As a sales manager, I want approved quotes and explicit forecast assumptions so that pipeline is not confused with revenue.

<a id="des-f032"></a>
**Design DES-F032:** QuoteVersion has approver and immutable issued state; ForecastSnapshot records included opportunities, probabilities and FX source/date.

<a id="imp-f032"></a>
**Implementation IMP-F032:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F032](ACCEPTANCE_CRITERIA.md#test-f032). **Release:** Later.

## Customer success → crm.success → Customer plans

**Permissions:** success.manage, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f033"></a>
### REQ-F033 — Customer onboarding and success plans

**Requirement:** Track customer onboarding and success milestones separately from employee onboarding; respect account ownership and linked support permissions.

**Story:** US-F033 — As a customer-success manager, I want owned account milestones so that customer commitments are visible.

<a id="des-f033"></a>
**Design DES-F033:** SuccessPlan belongs to a client account and authorized CS team; SaaS vendor onboarding for its own tenants is a separate operator system.

<a id="imp-f033"></a>
**Implementation IMP-F033:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F033](ACCEPTANCE_CRITERIA.md#test-f033). **Release:** Later.

## Customer success → crm.success → Health and renewals

**Permissions:** health.read, renewals.manage, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f034"></a>
### REQ-F034 — Explainable health and renewal tracking

**Requirement:** Version health factors and expose missing/stale inputs; do not treat health score as a renewal prediction or recognized revenue.

**Story:** US-F034 — As a customer-success leader, I want explainable health and renewal signals so that account actions are based on visible inputs.

<a id="des-f034"></a>
**Design DES-F034:** HealthSnapshot stores score components, time window and source freshness; Renewal links contract/version and stage with explicit currency.

<a id="imp-f034"></a>
**Implementation IMP-F034:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F034](ACCEPTANCE_CRITERIA.md#test-f034). **Release:** Later.

## Support → crm.support → Tickets and queues

**Permissions:** tickets.manage, tickets.restricted.read, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f035"></a>
### REQ-F035 — Customer service ticketing

**Requirement:** Manage ticket state, queue, priority and SLA clocks under versioned business calendars; restrict sensitive attachments and requester visibility.

**Story:** US-F035 — As a support agent, I want scoped tickets and escalation so that customer issues have accountable handling.

<a id="des-f035"></a>
**Design DES-F035:** Ticket lifecycle: open, in_progress, waiting, resolved, closed; reopen preserves prior SLA events. Waiting-clock policies are explicit, not inferred from status alone.

<a id="imp-f035"></a>
**Implementation IMP-F035:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F035](ACCEPTANCE_CRITERIA.md#test-f035). **Release:** Later.

## Support → crm.support → Knowledge and service quality

**Permissions:** knowledge.publish, tickets.manage, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f036"></a>
### REQ-F036 — Knowledge, SLA and CSAT

**Requirement:** Require review before public knowledge publication, sanitize content, define first-response/resolution policies and deduplicate satisfaction invitations.

**Story:** US-F036 — As a support manager, I want reviewed knowledge and service metrics so that responses and reporting are consistent.

<a id="des-f036"></a>
**Design DES-F036:** KnowledgeArticle has internal/public versions; SLAEvent uses immutable policy/calendar; CSATResponse is linked to a single authorized survey event.

<a id="imp-f036"></a>
**Implementation IMP-F036:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F036](ACCEPTANCE_CRITERIA.md#test-f036). **Release:** Later.

## Automation → platform.automation → Rules and approvals

**Permissions:** automation.manage, automation.execute, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** platform.core.

<a id="req-f037"></a>
### REQ-F037 — Governed cross-module rules

**Requirement:** Permit only registered triggers/actions, version rules, require a named service principal and validate module, field and record permission at execution.

**Story:** US-F037 — As a tenant administrator, I want bounded automation so that enabled workflows can act without bypassing policy.

<a id="des-f037"></a>
**Design DES-F037:** Rule versions use allowlisted conditions/actions, no arbitrary code in R1/later initial automation. Dry-run and loop-depth/execution budgets precede activation. Cross-module targets are soft dependencies unless needed for the rule.

<a id="imp-f037"></a>
**Implementation IMP-F037:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F037](ACCEPTANCE_CRITERIA.md#test-f037). **Release:** Later.

## Recruitment operations → agency.starts → Notifications

**Permissions:** placements.read, tenant and record scope. **Sensitivity:** S2. **Subscription:** Fixed reminder entitlement bundled with agency.starts. **Hard dependencies:** crm.accounts.

<a id="req-f038"></a>
### REQ-F038 — Reliable reminders and delivery

**Requirement:** R1 includes a fixed daily due/overdue task digest to authorized internal owners and client participants; arbitrary rule building, SMS and WhatsApp are excluded.

**Story:** US-F038 — As an agency manager, I want minimal, deduplicated reminders so that owners receive useful follow-ups.

<a id="des-f038"></a>
**Design DES-F038:** Fixed reminder worker is included with agency.starts, not dependent on purchasing automation. Reauthorize source objects at send time; record sent/failed, retry safely and offer nonessential preference controls without hiding mandatory in-app work.

<a id="imp-f038"></a>
**Implementation IMP-F038:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F038](ACCEPTANCE_CRITERIA.md#test-f038). **Release:** R1 bundled only.

## Reporting → platform.analytics → Views and snapshots

**Permissions:** reports.read, reports.export, tenant and record scope. **Sensitivity:** S3. **Subscription:** Source module and reporting feature both entitled. **Hard dependencies:** platform.core.

<a id="req-f039"></a>
### REQ-F039 — Permission-aware operational reporting

**Requirement:** Provide only entitled dashboard/KPI definitions over authorized source records; retain the same filter and metric definition across chart, table, drill-down and export.

**Story:** US-F039 — As an agency manager, I want reconciled views and exports so that operational status matches the source records.

<a id="des-f039"></a>
**Design DES-F039:** R1 includes agency executive/recruiter operational views, saved views and PDF/CSV/XLSX exports; all ten persona dashboards are roadmap definitions. See reporting and KPI contracts for snapshot semantics.

<a id="imp-f039"></a>
**Implementation IMP-F039:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F039](ACCEPTANCE_CRITERIA.md#test-f039). **Release:** R1 limited.

## Integrations → platform.integrations → Imports

**Permissions:** imports.run, placements.write, accounts.write, tenant and record scope. **Sensitivity:** S2. **Subscription:** CSV import included; source modules active. **Hard dependencies:** platform.core.

<a id="req-f040"></a>
### REQ-F040 — Validated CSV placement imports

**Requirement:** R1 accepts only the documented minimal placement/account/contact schema with maximum 1,000 rows per batch; validate all rows before commit, reject formula cells and forbidden sensitive fields, and support dry-run/error download.

**Story:** US-F040 — As a recruiter, I want a previewed import so that existing accepted placements can be brought in without duplication.

<a id="des-f040"></a>
**Design DES-F040:** ImportBatch has tenant, profile, source IDs, hash, idempotency key, row errors and atomic commit. Preflight capacity for the entire batch; no partial silent success. Importing clients requires accounts.write, not placements.write alone.

<a id="imp-f040"></a>
**Implementation IMP-F040:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F040](ACCEPTANCE_CRITERIA.md#test-f040). **Release:** R1.

## Integrations → platform.integrations → APIs and connectors

**Permissions:** integrations.manage, api.invoke, tenant and record scope. **Sensitivity:** S3. **Subscription:** API/connector package plus active source modules. **Hard dependencies:** platform.core.

<a id="req-f041"></a>
### REQ-F041 — Scoped APIs, webhooks and connector packages

**Requirement:** Issue tenant/module-scoped API credentials with explicit actions, per-package limits and revocation; sign webhooks, prevent replay, validate outbound destinations and reauthorize queued deliveries.

**Story:** US-F041 — As an integration administrator, I want scoped integrations so that external systems cannot bypass module policy.

<a id="des-f041"></a>
**Design DES-F041:** Connector package IDs: connector.ats, connector.accounting, connector.payroll_provider, connector.messaging. Individual provider/version support is declared before sale; no provider is currently certified. APIs use versioned contracts and idempotent upserts.

<a id="imp-f041"></a>
**Implementation IMP-F041:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F041](ACCEPTANCE_CRITERIA.md#test-f041). **Release:** Later.

## Compliance → compliance.country → Rule governance

**Permissions:** compliance.configure, compliance.review, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f042"></a>
### REQ-F042 — Jurisdiction pack lifecycle

**Requirement:** Require country, jurisdiction/regime, entity applicability, official source, effective dates, reviewer, tested fixtures and retention policy before a pack can be activated; no pack is production-ready by default.

**Story:** US-F042 — As a compliance administrator, I want reviewed country rules so that a generic framework does not invent legal requirements.

<a id="des-f042"></a>
**Design DES-F042:** Pack identity uses compliance.pack.<country>.<regime> and immutable semantic version. Rule evaluation records version; missing/expired coverage fails closed for affected calculations, not unrelated core workflows.

<a id="imp-f042"></a>
**Implementation IMP-F042:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F042](ACCEPTANCE_CRITERIA.md#test-f042). **Release:** Later.

## Compliance → compliance.uae → UAE regimes and provider formats

**Permissions:** compliance.configure, payroll.inputs.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Approved UAE pack instance plus relevant source modules. **Hard dependencies:** compliance.country.

<a id="req-f043"></a>
### REQ-F043 — Reviewed UAE employment/payroll adapters

**Requirement:** Treat proposed compliance.pack.ae.mainland, compliance.pack.ae.difc and compliance.pack.ae.adgm as separate review scopes; verify actual coverage/authority and current rules before offering any. WPS/provider outputs require provider acceptance testing and do not execute payment.

**Story:** US-F043 — As a payroll administrator, I want explicit UAE regime/provider coverage so that an export is not misrepresented as universal compliance.

<a id="des-f043"></a>
**Design DES-F043:** Each adapter declares supported entity types, worker cases, rule sources, exclusions, format/provider version and effective dates. Permit, immigration and professional-license decisions stay with authorized parties.

<a id="imp-f043"></a>
**Implementation IMP-F043:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F043](ACCEPTANCE_CRITERIA.md#test-f043). **Release:** Later.

## Talent acquisition → talent.ats → Sourcing and careers

**Permissions:** requisitions.manage, applications.read, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f044"></a>
### REQ-F044 — Career publishing and candidate intake

**Requirement:** Publish only approved requisitions, capture source and applicant notices, deduplicate for human review and separate candidate opt-in from a legal conclusion about processing basis; job-board distribution needs an enabled supported connector.

**Story:** US-F044 — As a recruiter, I want approved vacancies and consent-aware applications so that sourcing has a traceable origin.

<a id="des-f044"></a>
**Design DES-F044:** CareerPosting is a sanitized public projection with version/expiry; ApplicationIntake validates files and fields through restricted-document controls. Resume parsing is reviewable extraction, never an autonomous hiring decision.

<a id="imp-f044"></a>
**Implementation IMP-F044:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F044](ACCEPTANCE_CRITERIA.md#test-f044). **Release:** Later.

## Talent acquisition → talent.ats → Candidate experience

**Permissions:** candidate.self.read, candidate.self.respond, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f045"></a>
### REQ-F045 — Candidate portal and interview coordination

**Requirement:** Permit candidates to access only their own applications and explicitly published messages, interview slots and document requests; hide internal feedback and client commercial terms, and provide an accessible correction/withdrawal channel.

**Story:** US-F045 — As a candidate, I want scoped application progress and interview actions so that I know what to do next.

<a id="des-f045"></a>
**Design DES-F045:** Candidate identity is distinct from employee/client membership. Interview scheduling checks hiring-team calendars through supported connectors; withdrawing an application triggers a reviewed retention/privacy workflow rather than cascading deletion of audit.

<a id="imp-f045"></a>
**Implementation IMP-F045:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F045](ACCEPTANCE_CRITERIA.md#test-f045). **Release:** Later.

## HRMS → hr.records → Organization and positions

**Permissions:** employees.write, organization.manage, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** platform.core.

<a id="req-f046"></a>
### REQ-F046 — Organization directory and position control

**Requirement:** Version departments, positions, reporting relationships and entity assignments; prevent hierarchy cycles and expose only approved work-directory fields to ordinary employees.

**Story:** US-F046 — As an HR leader, I want effective-dated structures and positions so that reporting lines and vacancies are not confused with people.

<a id="des-f046"></a>
**Design DES-F046:** Position may be vacant or have approved occupancy; manager relationships use employment IDs and effective dates. Org-chart access follows field/record policy, not broad tree traversal rights.

<a id="imp-f046"></a>
**Implementation IMP-F046:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F046](ACCEPTANCE_CRITERIA.md#test-f046). **Release:** Later.

## HRMS → hr.lifecycle → Assets and access

**Permissions:** lifecycle.manage, assets.manage, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f047"></a>
### REQ-F047 — Asset assignment and return tracking

**Requirement:** Track company asset custody and access-provisioning requests with authorized owners, due dates and acknowledgments; do not treat a requested revocation as completed or apply automated wage deductions.

**Story:** US-F047 — As an HR operations user, I want assigned assets and access requests linked to joiner/leaver work so that responsibility is clear.

<a id="des-f047"></a>
**Design DES-F047:** AssetAssignment links inventory reference and employment; access requests carry connector acknowledgment or manual evidence. Inventory/accounting valuation remains an optional external integration.

<a id="imp-f047"></a>
**Implementation IMP-F047:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F047](ACCEPTANCE_CRITERIA.md#test-f047). **Release:** Later.

## Workforce → workforce.time → Assignments and client time

**Permissions:** time.approve, assignments.manage, client.time.approve, tenant and record scope. **Sensitivity:** S3. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f048"></a>
### REQ-F048 — Project assignment and client-approved timesheets

**Requirement:** Version worker/client/site assignments, collect scoped client approval of time and distinguish payroll approval from invoice approval; never infer permission to supply labor or become employer from a software subscription.

**Story:** US-F048 — As a staffing operations manager, I want assignment-linked time and client sign-off so that payroll and invoice inputs have clear provenance.

<a id="des-f048"></a>
**Design DES-F048:** Assignment and TimesheetApproval preserve contract/rate references under separate commercial and salary scopes. Accounting/payroll handoffs require their enabled connectors; core time entry works without them.

<a id="imp-f048"></a>
**Implementation IMP-F048:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F048](ACCEPTANCE_CRITERIA.md#test-f048). **Release:** Later.

## HCM → talent.learning → Content and programs

**Permissions:** learning.admin, learning.assign, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f049"></a>
### REQ-F049 — Learning catalog and program administration

**Requirement:** Version course metadata, prerequisites, provider/content licenses, enrollment capacity and completion rules; external content access requires the relevant licensed provider package.

**Story:** US-F049 — As a learning administrator, I want reviewed content and enrollments so that development programs have explicit scope.

<a id="des-f049"></a>
**Design DES-F049:** CourseVersion and LearningProgram reference assignments, instructor sessions and provider capabilities. Completion thresholds remain distinct from professional qualification and performance rating.

<a id="imp-f049"></a>
**Implementation IMP-F049:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F049](ACCEPTANCE_CRITERIA.md#test-f049). **Release:** Later.

## Employee experience → experience.portal → Communication and directory

**Permissions:** communications.publish, self.profile.read, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** hr.records.

<a id="req-f050"></a>
### REQ-F050 — Employee communications and acknowledgments

**Requirement:** Publish reviewed announcements only to selected authorized entity/team audiences, respect notification preferences, and distinguish delivered, read and explicitly acknowledged; recognition content requires appropriate publication consent.

**Story:** US-F050 — As an HR communicator, I want targeted announcements and a safe work directory so that employees receive relevant information.

<a id="des-f050"></a>
**Design DES-F050:** AnnouncementVersion captures publisher, audience rule and expiration. Directory is an allowed-field projection; policy acknowledgments preserve exact version and actor rather than assuming email delivery is consent.

<a id="imp-f050"></a>
**Implementation IMP-F050:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F050](ACCEPTANCE_CRITERIA.md#test-f050). **Release:** Later.

## Sales → crm.sales → Revenue handoff

**Permissions:** orders.manage, quotes.approve, tenant and record scope. **Sensitivity:** S2. **Subscription:** Module active and capacity available. **Hard dependencies:** crm.accounts.

<a id="req-f051"></a>
### REQ-F051 — Approved order and invoice handoff

**Requirement:** Create a versioned accepted order only from authorized commercial approval, and hand invoice/collection work to an enabled finance connector or explicit external owner; do not implement tax determination, accounting recognition or payment custody implicitly.

**Story:** US-F051 — As a sales operations user, I want won deals handed to the finance owner so that bookings are not misrepresented as cash.

<a id="des-f051"></a>
**Design DES-F051:** CommercialOrder snapshots quote/contract terms, currency and acceptance. Provider invoice states remain draft/issued/paid/reconciled from attributable provider events; corrections preserve original references.

<a id="imp-f051"></a>
**Implementation IMP-F051:** Planned work item implementing this contract; no code exists. **Test:** [TEST-F051](ACCEPTANCE_CRITERIA.md#test-f051). **Release:** Later.


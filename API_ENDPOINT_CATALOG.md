# API endpoint catalog

Phase 3 design baseline: 1 November 2026. Proposed contracts; no application implementation or production migration.

## API-001 — Shared wire and policy contract

The machine-readable source is [openapi.yaml](openapi.yaml), OpenAPI 3.0.3 with relative `/api/v1` server. These are designed routes, not deployed APIs. Internal R1 browser APIs do not imply a purchased public API/connector package; third-party clients later require that package plus scoped credentials. A supported release allowlist is checked before subscription eligibility: Later routes return FEATURE_UNAVAILABLE (403) even if an administrator grants the module.

Authenticate verified regional server session and derive tenant from its integrity-protected envelope, then check current membership, scope, field rights, module/dependencies, feature/recovery entitlement and capacity. A tenant header/body is never trusted. OIDC callback/provisioning/recovery routes are security adapters governed by SEC-002, not generic tenant/identity CRUD. Require CSRF/Origin checks for cookie mutations. Webhook endpoints use raw-body signature verification, timestamp and replay protection instead of browser sessions.

Permission column names are exact capability keys. Field visibility is an additional check: the Read schemas describe maximum allowed projections, not a right to expose every field. Unpermitted fields are omitted; protected secrets/blob keys are not in response schemas. Credential/secret/identity-document provisioning, tenant creation, entitlements, audit insertion, ledger posting and approval actors are not generic create/update APIs. Restrict unsupported fields with additionalProperties:false and typed request allowlists.

Pagination: keyset `(createdAt,id)` ascending, default 50/max 100; signed cursor binds tenant, actor scope, filter/order hash, upper as-of creation cutoff and expiry. Cursor rejects mismatched scope/filter or signature. This prevents duplicate stable-key pages but is not a frozen snapshot of updated statuses: use ReportSnapshot for historical point-in-time reporting. Default filters exclude archived/deleted active views; authorized recovery views include retained data explicitly. List query filters are allowlisted entityId and createdBefore; richer operational filters use typed saved/report AST. No arbitrary sort/SQL/include joins. Dates are ISO and decimals/BigInt strings.

Mutations: required Idempotency-Key (16–160 characters), payload hash, actor/tenant/operation namespace, proposed 24-hour ordinary replay minimum and provider-specific longer windows before connector activation. Same key/same payload returns same resource/result reference; same key/different payload →409 IDEMPOTENCY_CONFLICT; concurrent unfinished attempt →409 OPERATION_PENDING. Recheck current read permissions before returning a replay result. No secret-rich full response body is persisted. Status transitions require If-Match strong version ETag; missing→428, stale→412. Re-evaluate policy/record version and quota at transaction commit.

Errors use application/problem+json: 400 invalid syntax/cursor, 401 unauthenticated, 403 capability/module/rule denial, 404 missing or unobservable record, 409 invariant/capacity/idempotency conflict, 412 stale ETag, 422 field/domain validation, 428 missing version precondition, 429 rate/usage-window cap and Retry-After, 503 unavailable dependency/uncertain authoritative access. Return request ID and safe field codes, never SQL/provider secrets or cross-tenant existence details. Error bodies follow Problem schema. Downloads also use problem errors on denial.

Proposed R1 limits retain plan limits from MODULE_CATALOG.md: 20 application requests/minute/internal user baseline, tenant export caps by plan, 1,000-row/10 MiB imports, 5,000-row exports, and internal-seat/active-placement capacity. External participants get a separately bounded 20 requests/minute/identity and 200 requests/minute/tenant safety ceiling initially; these are load-test assumptions, not purchased public-API rates. Enforce edge+application limits and authoritative atomic gauges. Return RateLimit-Limit/Remaining/Reset metadata; a cap cannot create an unapproved charge.

Audit successful mutations and sensitive reads/downloads, failed privilege escalation and configuration changes with existing AuditEvent contract. Success = domain result plus audit/outbox committed; async 202 = durable pending job reference only, not completion/provider payment. Poll owning GET for state; operation cancellation and module-off are reauthorized. Later raw provider responses never become trusted internal state without mapping/verification.

## API-002 — Resource and command catalog

No generic PATCH/DELETE is offered for these financial/history/state resources. Edit through explicitly named commands with version/audit; new commands must add schema, authorization and tests. Data-subject erasure uses approved privacy workflow rather than cascaded API DELETE. Request/response references resolve in OpenAPI; each route inherits all API-001 requirements.

| Method | Path under /api/v1 | Request schema | Response schema | Module | Permission + scope | Release | If-Match |
|---|---|---|---|---|---|---|---|
| GET | `/legal-entities` | — | LegalEntityPage | platform.core | tenant.manage | R1 | No |
| GET | `/legal-entities/{id}` | — | LegalEntityRead | platform.core | tenant.manage | R1 | No |
| POST | `/legal-entities` | LegalEntityCreate | LegalEntityRead | platform.core | tenant.manage | R1 | No |
| GET | `/teams` | — | TeamPage | platform.core | tenant.manage | R1 | No |
| GET | `/teams/{id}` | — | TeamRead | platform.core | tenant.manage | R1 | No |
| POST | `/teams` | TeamCreate | TeamRead | platform.core | tenant.manage | R1 | No |
| GET | `/client-accounts` | — | ClientAccountPage | crm.accounts | accounts.read | R1 | No |
| GET | `/client-accounts/{id}` | — | ClientAccountRead | crm.accounts | accounts.read | R1 | No |
| POST | `/client-accounts` | ClientAccountCreate | ClientAccountRead | crm.accounts | accounts.write | R1 | No |
| GET | `/contacts` | — | ContactPage | crm.accounts | accounts.read | R1 | No |
| GET | `/contacts/{id}` | — | ContactRead | crm.accounts | accounts.read | R1 | No |
| POST | `/contacts` | ContactCreate | ContactRead | crm.accounts | contacts.manage | R1 | No |
| GET | `/candidates` | — | CandidatePage | agency.starts | placements.read | R1 | No |
| GET | `/candidates/{id}` | — | CandidateRead | agency.starts | placements.read | R1 | No |
| POST | `/candidates` | CandidateCreate | CandidateRead | agency.starts | placements.write | R1 | No |
| GET | `/placements` | — | PlacementPage | agency.starts | placements.read | R1 | No |
| GET | `/placements/{id}` | — | PlacementRead | agency.starts | placements.read | R1 | No |
| POST | `/placements` | PlacementCreate | PlacementRead | agency.starts | placements.write | R1 | No |
| GET | `/placement-tasks` | — | PlacementTaskPage | agency.starts | placements.read | R1 | No |
| GET | `/placement-tasks/{id}` | — | PlacementTaskRead | agency.starts | placements.read | R1 | No |
| GET | `/placement-exceptions` | — | PlacementExceptionPage | agency.starts | placements.read | R1 | No |
| GET | `/placement-exceptions/{id}` | — | PlacementExceptionRead | agency.starts | placements.read | R1 | No |
| POST | `/placement-exceptions` | PlacementExceptionCreate | PlacementExceptionRead | agency.starts | placements.write | R1 | No |
| GET | `/participant-grants` | — | ParticipantGrantPage | agency.starts | participants.manage | R1 | No |
| GET | `/participant-grants/{id}` | — | ParticipantGrantRead | agency.starts | participants.manage | R1 | No |
| POST | `/participant-grants` | ParticipantGrantCreate | ParticipantGrantRead | agency.starts | participants.manage | R1 | No |
| GET | `/workflow-templates` | — | WorkflowTemplatePage | platform.core | tenant.manage | R1 | No |
| GET | `/workflow-templates/{id}` | — | WorkflowTemplateRead | platform.core | tenant.manage | R1 | No |
| POST | `/workflow-templates` | WorkflowTemplateCreate | WorkflowTemplateRead | platform.core | tenant.manage | R1 | No |
| GET | `/template-versions` | — | TemplateVersionPage | platform.core | tenant.manage | R1 | No |
| GET | `/template-versions/{id}` | — | TemplateVersionRead | platform.core | tenant.manage | R1 | No |
| POST | `/template-versions` | TemplateVersionCreate | TemplateVersionRead | platform.core | tenant.manage | R1 | No |
| GET | `/task-definitions` | — | TaskDefinitionPage | platform.core | tenant.manage | R1 | No |
| GET | `/task-definitions/{id}` | — | TaskDefinitionRead | platform.core | tenant.manage | R1 | No |
| POST | `/task-definitions` | TaskDefinitionCreate | TaskDefinitionRead | platform.core | tenant.manage | R1 | No |
| GET | `/memberships` | — | MembershipPage | platform.core | roles.manage | R1 | No |
| GET | `/memberships/{id}` | — | MembershipRead | platform.core | roles.manage | R1 | No |
| GET | `/role-grants` | — | RoleGrantPage | platform.core | roles.manage | R1 | No |
| GET | `/role-grants/{id}` | — | RoleGrantRead | platform.core | roles.manage | R1 | No |
| POST | `/role-grants` | RoleGrantCreate | RoleGrantRead | platform.core | roles.manage | R1 | No |
| GET | `/module-activations` | — | ModuleActivationPage | platform.core | billing.manage | R1 | No |
| GET | `/module-activations/{id}` | — | ModuleActivationRead | platform.core | billing.manage | R1 | No |
| GET | `/imports` | — | ImportBatchPage | platform.integrations | imports.run | R1 | No |
| GET | `/imports/{id}` | — | ImportBatchRead | platform.integrations | imports.run | R1 | No |
| GET | `/saved-views` | — | SavedViewPage | platform.analytics | reports.read | R1 | No |
| GET | `/saved-views/{id}` | — | SavedViewRead | platform.analytics | reports.read | R1 | No |
| POST | `/saved-views` | SavedViewCreate | SavedViewRead | platform.analytics | reports.read | R1 | No |
| GET | `/report-snapshots` | — | ReportSnapshotPage | platform.analytics | reports.read | R1 | No |
| GET | `/report-snapshots/{id}` | — | ReportSnapshotRead | platform.analytics | reports.read | R1 | No |
| GET | `/export-artifacts` | — | ExportArtifactPage | platform.analytics | reports.export | R1 | No |
| GET | `/export-artifacts/{id}` | — | ExportArtifactRead | platform.analytics | reports.export | R1 | No |
| GET | `/audit-events` | — | AuditEventPage | platform.core | audit.read | R1 | No |
| GET | `/audit-events/{id}` | — | AuditEventRead | platform.core | audit.read | R1 | No |
| GET | `/privacy-requests` | — | PrivacyRequestPage | platform.core | privacy.manage | R1 | No |
| GET | `/privacy-requests/{id}` | — | PrivacyRequestRead | platform.core | privacy.manage | R1 | No |
| GET | `/employees` | — | EmployeePage | hr.records | employees.read | Later | No |
| GET | `/employees/{id}` | — | EmployeeRead | hr.records | employees.read | Later | No |
| POST | `/employees` | EmployeeCreate | EmployeeRead | hr.records | employees.write | Later | No |
| GET | `/employments` | — | EmploymentPage | hr.records | employees.read | Later | No |
| GET | `/employments/{id}` | — | EmploymentRead | hr.records | employees.read | Later | No |
| POST | `/employments` | EmploymentCreate | EmploymentRead | hr.records | employees.write | Later | No |
| GET | `/employment-terms` | — | EmploymentTermPage | hr.records | employees.restricted.read | Later | No |
| GET | `/employment-terms/{id}` | — | EmploymentTermRead | hr.records | employees.restricted.read | Later | No |
| POST | `/employment-terms` | EmploymentTermCreate | EmploymentTermRead | hr.records | employees.restricted.write | Later | No |
| GET | `/requisitions` | — | RequisitionPage | talent.ats | requisitions.manage | Later | No |
| GET | `/requisitions/{id}` | — | RequisitionRead | talent.ats | requisitions.manage | Later | No |
| POST | `/requisitions` | RequisitionCreate | RequisitionRead | talent.ats | requisitions.manage | Later | No |
| GET | `/applications` | — | ApplicationPage | talent.ats | applications.read | Later | No |
| GET | `/applications/{id}` | — | ApplicationRead | talent.ats | applications.read | Later | No |
| POST | `/applications` | ApplicationCreate | ApplicationRead | talent.ats | applications.read | Later | No |
| GET | `/offers` | — | OfferPage | talent.ats | offers.manage | Later | No |
| GET | `/offers/{id}` | — | OfferRead | talent.ats | offers.manage | Later | No |
| POST | `/offers` | OfferCreate | OfferRead | talent.ats | offers.manage | Later | No |
| GET | `/interviews` | — | InterviewPage | talent.ats | applications.read | Later | No |
| GET | `/interviews/{id}` | — | InterviewRead | talent.ats | applications.read | Later | No |
| POST | `/interviews` | InterviewCreate | InterviewRead | talent.ats | applications.read | Later | No |
| GET | `/lifecycle-cases` | — | LifecycleCasePage | hr.lifecycle | lifecycle.manage | Later | No |
| GET | `/lifecycle-cases/{id}` | — | LifecycleCaseRead | hr.lifecycle | lifecycle.manage | Later | No |
| POST | `/lifecycle-cases` | LifecycleCaseCreate | LifecycleCaseRead | hr.lifecycle | lifecycle.manage | Later | No |
| GET | `/leave-requests` | — | LeaveRequestPage | hr.leave | leave.request | Later | No |
| GET | `/leave-requests/{id}` | — | LeaveRequestRead | hr.leave | leave.request | Later | No |
| POST | `/leave-requests` | LeaveRequestCreate | LeaveRequestRead | hr.leave | leave.request | Later | No |
| GET | `/time-entries` | — | TimeEntryPage | workforce.time | time.submit | Later | No |
| GET | `/time-entries/{id}` | — | TimeEntryRead | workforce.time | time.submit | Later | No |
| POST | `/time-entries` | TimeEntryCreate | TimeEntryRead | workforce.time | time.submit | Later | No |
| GET | `/shifts` | — | ShiftPage | workforce.schedule | schedule.manage | Later | No |
| GET | `/shifts/{id}` | — | ShiftRead | workforce.schedule | schedule.manage | Later | No |
| POST | `/shifts` | ShiftCreate | ShiftRead | workforce.schedule | schedule.manage | Later | No |
| GET | `/payroll-input-batches` | — | PayrollInputBatchPage | payroll.inputs | payroll.inputs.read | Later | No |
| GET | `/payroll-input-batches/{id}` | — | PayrollInputBatchRead | payroll.inputs | payroll.inputs.read | Later | No |
| POST | `/payroll-input-batches` | PayrollInputBatchCreate | PayrollInputBatchRead | payroll.inputs | payroll.inputs.prepare | Later | No |
| GET | `/pay-runs` | — | PayRunPage | payroll.engine | payroll.read | Later | No |
| GET | `/pay-runs/{id}` | — | PayRunRead | payroll.engine | payroll.read | Later | No |
| POST | `/pay-runs` | PayRunCreate | PayRunRead | payroll.engine | payroll.calculate | Later | No |
| GET | `/payslips` | — | PayslipPage | payroll.engine | self.payslip.read | Later | No |
| GET | `/payslips/{id}` | — | PayslipRead | payroll.engine | self.payslip.read | Later | No |
| GET | `/compensation-cycles` | — | CompensationCyclePage | talent.compensation | compensation.plan | Later | No |
| GET | `/compensation-cycles/{id}` | — | CompensationCycleRead | talent.compensation | compensation.plan | Later | No |
| POST | `/compensation-cycles` | CompensationCycleCreate | CompensationCycleRead | talent.compensation | compensation.plan | Later | No |
| GET | `/benefit-enrollments` | — | BenefitEnrollmentPage | hr.benefits | benefits.manage | Later | No |
| GET | `/benefit-enrollments/{id}` | — | BenefitEnrollmentRead | hr.benefits | benefits.manage | Later | No |
| POST | `/benefit-enrollments` | BenefitEnrollmentCreate | BenefitEnrollmentRead | hr.benefits | benefits.manage | Later | No |
| GET | `/review-cycles` | — | ReviewCyclePage | talent.performance | performance.review | Later | No |
| GET | `/review-cycles/{id}` | — | ReviewCycleRead | talent.performance | performance.review | Later | No |
| POST | `/review-cycles` | ReviewCycleCreate | ReviewCycleRead | talent.performance | performance.review | Later | No |
| GET | `/learning-assignments` | — | LearningAssignmentPage | talent.learning | learning.assign | Later | No |
| GET | `/learning-assignments/{id}` | — | LearningAssignmentRead | talent.learning | learning.assign | Later | No |
| POST | `/learning-assignments` | LearningAssignmentCreate | LearningAssignmentRead | talent.learning | learning.assign | Later | No |
| GET | `/succession-plans` | — | SuccessionPlanPage | talent.succession | succession.manage | Later | No |
| GET | `/succession-plans/{id}` | — | SuccessionPlanRead | talent.succession | succession.manage | Later | No |
| POST | `/succession-plans` | SuccessionPlanCreate | SuccessionPlanRead | talent.succession | succession.manage | Later | No |
| GET | `/documents` | — | DocumentPage | hr.records | documents.restricted.read | Later | No |
| GET | `/documents/{id}` | — | DocumentRead | hr.records | documents.restricted.read | Later | No |
| GET | `/assets` | — | AssetPage | hr.lifecycle | assets.manage | Later | No |
| GET | `/assets/{id}` | — | AssetRead | hr.lifecycle | assets.manage | Later | No |
| POST | `/assets` | AssetCreate | AssetRead | hr.lifecycle | assets.manage | Later | No |
| GET | `/expense-claims` | — | ExpenseClaimPage | hr.benefits | expenses.request | Later | No |
| GET | `/expense-claims/{id}` | — | ExpenseClaimRead | hr.benefits | expenses.request | Later | No |
| POST | `/expense-claims` | ExpenseClaimCreate | ExpenseClaimRead | hr.benefits | expenses.request | Later | No |
| GET | `/employee-cases` | — | EmployeeCasePage | experience.engagement | cases.confidential.manage | Later | No |
| GET | `/employee-cases/{id}` | — | EmployeeCaseRead | experience.engagement | cases.confidential.manage | Later | No |
| GET | `/leads` | — | LeadPage | crm.sales | opportunities.manage | Later | No |
| GET | `/leads/{id}` | — | LeadRead | crm.sales | opportunities.manage | Later | No |
| POST | `/leads` | LeadCreate | LeadRead | crm.sales | opportunities.manage | Later | No |
| GET | `/opportunities` | — | OpportunityPage | crm.sales | sales.pipeline.read | Later | No |
| GET | `/opportunities/{id}` | — | OpportunityRead | crm.sales | sales.pipeline.read | Later | No |
| POST | `/opportunities` | OpportunityCreate | OpportunityRead | crm.sales | opportunities.manage | Later | No |
| GET | `/activities` | — | ActivityPage | crm.accounts | activities.manage | Later | No |
| GET | `/activities/{id}` | — | ActivityRead | crm.accounts | activities.manage | Later | No |
| POST | `/activities` | ActivityCreate | ActivityRead | crm.accounts | activities.manage | Later | No |
| GET | `/quotes` | — | QuotePage | crm.sales | quotes.manage | Later | No |
| GET | `/quotes/{id}` | — | QuoteRead | crm.sales | quotes.manage | Later | No |
| POST | `/quotes` | QuoteCreate | QuoteRead | crm.sales | quotes.manage | Later | No |
| GET | `/success-plans` | — | SuccessPlanPage | crm.success | success.manage | Later | No |
| GET | `/success-plans/{id}` | — | SuccessPlanRead | crm.success | success.manage | Later | No |
| POST | `/success-plans` | SuccessPlanCreate | SuccessPlanRead | crm.success | success.manage | Later | No |
| GET | `/renewals` | — | RenewalPage | crm.success | renewals.manage | Later | No |
| GET | `/renewals/{id}` | — | RenewalRead | crm.success | renewals.manage | Later | No |
| POST | `/renewals` | RenewalCreate | RenewalRead | crm.success | renewals.manage | Later | No |
| GET | `/support-tickets` | — | SupportTicketPage | crm.support | tickets.read | Later | No |
| GET | `/support-tickets/{id}` | — | SupportTicketRead | crm.support | tickets.read | Later | No |
| POST | `/support-tickets` | SupportTicketCreate | SupportTicketRead | crm.support | tickets.manage | Later | No |
| GET | `/connectors` | — | ConnectorPage | platform.integrations | integrations.manage | Later | No |
| GET | `/connectors/{id}` | — | ConnectorRead | platform.integrations | integrations.manage | Later | No |
| GET | `/report-schedules` | — | ReportSchedulePage | platform.analytics | reports.schedule | Later | No |
| GET | `/report-schedules/{id}` | — | ReportScheduleRead | platform.analytics | reports.schedule | Later | No |
| POST | `/report-schedules` | ReportScheduleCreate | ReportScheduleRead | platform.analytics | reports.schedule | Later | No |
| GET | `/roles` | — | RolePage | platform.core | roles.manage | R1 | No |
| GET | `/roles/{id}` | — | RoleRead | platform.core | roles.manage | R1 | No |
| POST | `/roles` | RoleCreate | RoleRead | platform.core | roles.manage | R1 | No |
| GET | `/role-permissions` | — | RolePermissionPage | platform.core | roles.manage | R1 | No |
| GET | `/role-permissions/{id}` | — | RolePermissionRead | platform.core | roles.manage | R1 | No |
| POST | `/role-permissions` | RolePermissionCreate | RolePermissionRead | platform.core | roles.manage | R1 | No |
| GET | `/persons` | — | PersonPage | hr.records | employees.read | Later | No |
| GET | `/persons/{id}` | — | PersonRead | hr.records | employees.read | Later | No |
| POST | `/persons` | PersonCreate | PersonRead | hr.records | employees.write | Later | No |
| GET | `/positions` | — | PositionPage | hr.records | organization.manage | Later | No |
| GET | `/positions/{id}` | — | PositionRead | hr.records | organization.manage | Later | No |
| POST | `/positions` | PositionCreate | PositionRead | hr.records | organization.manage | Later | No |
| GET | `/work-calendars` | — | WorkCalendarPage | hr.records | calendar.manage | Later | No |
| GET | `/work-calendars/{id}` | — | WorkCalendarRead | hr.records | calendar.manage | Later | No |
| POST | `/work-calendars` | WorkCalendarCreate | WorkCalendarRead | hr.records | calendar.manage | Later | No |
| GET | `/calendar-versions` | — | CalendarVersionPage | hr.records | calendar.approve | Later | No |
| GET | `/calendar-versions/{id}` | — | CalendarVersionRead | hr.records | calendar.approve | Later | No |
| POST | `/calendar-versions` | CalendarVersionCreate | CalendarVersionRead | hr.records | calendar.approve | Later | No |
| GET | `/calendar-days` | — | CalendarDayPage | hr.records | calendar.manage | Later | No |
| GET | `/calendar-days/{id}` | — | CalendarDayRead | hr.records | calendar.manage | Later | No |
| POST | `/calendar-days` | CalendarDayCreate | CalendarDayRead | hr.records | calendar.manage | Later | No |
| GET | `/candidate-profiles` | — | CandidateProfilePage | talent.ats | applications.manage | Later | No |
| GET | `/candidate-profiles/{id}` | — | CandidateProfileRead | talent.ats | applications.manage | Later | No |
| POST | `/candidate-profiles` | CandidateProfileCreate | CandidateProfileRead | talent.ats | applications.manage | Later | No |
| GET | `/career-postings` | — | CareerPostingPage | talent.ats | requisitions.manage | Later | No |
| GET | `/career-postings/{id}` | — | CareerPostingRead | talent.ats | requisitions.manage | Later | No |
| POST | `/career-postings` | CareerPostingCreate | CareerPostingRead | talent.ats | requisitions.manage | Later | No |
| GET | `/interview-feedback` | — | InterviewFeedbackPage | talent.ats | interviews.review | Later | No |
| GET | `/interview-feedback/{id}` | — | InterviewFeedbackRead | talent.ats | interviews.review | Later | No |
| POST | `/interview-feedback` | InterviewFeedbackCreate | InterviewFeedbackRead | talent.ats | interviews.review | Later | No |
| GET | `/leave-policy-versions` | — | LeavePolicyVersionPage | hr.leave | leave.policy.manage | Later | No |
| GET | `/leave-policy-versions/{id}` | — | LeavePolicyVersionRead | hr.leave | leave.policy.manage | Later | No |
| POST | `/leave-policy-versions` | LeavePolicyVersionCreate | LeavePolicyVersionRead | hr.leave | leave.policy.manage | Later | No |
| GET | `/leave-accounts` | — | LeaveAccountPage | hr.leave | leave.policy.manage | Later | No |
| GET | `/leave-accounts/{id}` | — | LeaveAccountRead | hr.leave | leave.policy.manage | Later | No |
| POST | `/leave-accounts` | LeaveAccountCreate | LeaveAccountRead | hr.leave | leave.policy.manage | Later | No |
| GET | `/work-assignments` | — | WorkAssignmentPage | workforce.time | assignments.manage | Later | No |
| GET | `/work-assignments/{id}` | — | WorkAssignmentRead | workforce.time | assignments.manage | Later | No |
| POST | `/work-assignments` | WorkAssignmentCreate | WorkAssignmentRead | workforce.time | assignments.manage | Later | No |
| GET | `/shift-assignments` | — | ShiftAssignmentPage | workforce.schedule | schedule.manage | Later | No |
| GET | `/shift-assignments/{id}` | — | ShiftAssignmentRead | workforce.schedule | schedule.manage | Later | No |
| POST | `/shift-assignments` | ShiftAssignmentCreate | ShiftAssignmentRead | workforce.schedule | schedule.manage | Later | No |
| GET | `/shift-swaps` | — | ShiftSwapPage | workforce.schedule | schedule.swap.request | Later | No |
| GET | `/shift-swaps/{id}` | — | ShiftSwapRead | workforce.schedule | schedule.swap.request | Later | No |
| POST | `/shift-swaps` | ShiftSwapCreate | ShiftSwapRead | workforce.schedule | schedule.swap.request | Later | No |
| GET | `/pay-periods` | — | PayPeriodPage | payroll.inputs | payroll.inputs.prepare | Later | No |
| GET | `/pay-periods/{id}` | — | PayPeriodRead | payroll.inputs | payroll.inputs.prepare | Later | No |
| POST | `/pay-periods` | PayPeriodCreate | PayPeriodRead | payroll.inputs | payroll.inputs.prepare | Later | No |
| GET | `/payroll-inputs` | — | PayrollInputPage | payroll.inputs | payroll.inputs.prepare | Later | No |
| GET | `/payroll-inputs/{id}` | — | PayrollInputRead | payroll.inputs | payroll.inputs.prepare | Later | No |
| POST | `/payroll-inputs` | PayrollInputCreate | PayrollInputRead | payroll.inputs | payroll.inputs.prepare | Later | No |
| GET | `/compensation-proposals` | — | CompensationProposalPage | talent.compensation | compensation.plan | Later | No |
| GET | `/compensation-proposals/{id}` | — | CompensationProposalRead | talent.compensation | compensation.plan | Later | No |
| POST | `/compensation-proposals` | CompensationProposalCreate | CompensationProposalRead | talent.compensation | compensation.plan | Later | No |
| GET | `/benefit-plans` | — | BenefitPlanPage | hr.benefits | benefits.manage | Later | No |
| GET | `/benefit-plans/{id}` | — | BenefitPlanRead | hr.benefits | benefits.manage | Later | No |
| POST | `/benefit-plans` | BenefitPlanCreate | BenefitPlanRead | hr.benefits | benefits.manage | Later | No |
| GET | `/benefit-plan-versions` | — | BenefitPlanVersionPage | hr.benefits | benefits.manage | Later | No |
| GET | `/benefit-plan-versions/{id}` | — | BenefitPlanVersionRead | hr.benefits | benefits.manage | Later | No |
| POST | `/benefit-plan-versions` | BenefitPlanVersionCreate | BenefitPlanVersionRead | hr.benefits | benefits.manage | Later | No |
| GET | `/goals` | — | GoalPage | talent.performance | performance.self | Later | No |
| GET | `/goals/{id}` | — | GoalRead | talent.performance | performance.self | Later | No |
| POST | `/goals` | GoalCreate | GoalRead | talent.performance | performance.self | Later | No |
| GET | `/review-submissions` | — | ReviewSubmissionPage | talent.performance | performance.review | Later | No |
| GET | `/review-submissions/{id}` | — | ReviewSubmissionRead | talent.performance | performance.review | Later | No |
| POST | `/review-submissions` | ReviewSubmissionCreate | ReviewSubmissionRead | talent.performance | performance.review | Later | No |
| GET | `/learning-courses` | — | LearningCoursePage | talent.learning | learning.admin | Later | No |
| GET | `/learning-courses/{id}` | — | LearningCourseRead | talent.learning | learning.admin | Later | No |
| POST | `/learning-courses` | LearningCourseCreate | LearningCourseRead | talent.learning | learning.admin | Later | No |
| GET | `/course-versions` | — | CourseVersionPage | talent.learning | learning.admin | Later | No |
| GET | `/course-versions/{id}` | — | CourseVersionRead | talent.learning | learning.admin | Later | No |
| POST | `/course-versions` | CourseVersionCreate | CourseVersionRead | talent.learning | learning.admin | Later | No |
| GET | `/skills` | — | SkillPage | talent.succession | skills.manage | Later | No |
| GET | `/skills/{id}` | — | SkillRead | talent.succession | skills.manage | Later | No |
| POST | `/skills` | SkillCreate | SkillRead | talent.succession | skills.manage | Later | No |
| GET | `/skill-evidence` | — | SkillEvidencePage | talent.succession | skills.self | Later | No |
| GET | `/skill-evidence/{id}` | — | SkillEvidenceRead | talent.succession | skills.self | Later | No |
| POST | `/skill-evidence` | SkillEvidenceCreate | SkillEvidenceRead | talent.succession | skills.self | Later | No |
| GET | `/succession-candidates` | — | SuccessionCandidatePage | talent.succession | succession.manage | Later | No |
| GET | `/succession-candidates/{id}` | — | SuccessionCandidateRead | talent.succession | succession.manage | Later | No |
| POST | `/succession-candidates` | SuccessionCandidateCreate | SuccessionCandidateRead | talent.succession | succession.manage | Later | No |
| GET | `/asset-assignments` | — | AssetAssignmentPage | hr.lifecycle | assets.manage | Later | No |
| GET | `/asset-assignments/{id}` | — | AssetAssignmentRead | hr.lifecycle | assets.manage | Later | No |
| POST | `/asset-assignments` | AssetAssignmentCreate | AssetAssignmentRead | hr.lifecycle | assets.manage | Later | No |
| GET | `/expense-lines` | — | ExpenseLinePage | hr.benefits | expenses.request | Later | No |
| GET | `/expense-lines/{id}` | — | ExpenseLineRead | hr.benefits | expenses.request | Later | No |
| POST | `/expense-lines` | ExpenseLineCreate | ExpenseLineRead | hr.benefits | expenses.request | Later | No |
| GET | `/commercial-contracts` | — | CommercialContractPage | crm.accounts | contracts.manage | Later | No |
| GET | `/commercial-contracts/{id}` | — | CommercialContractRead | crm.accounts | contracts.manage | Later | No |
| POST | `/commercial-contracts` | CommercialContractCreate | CommercialContractRead | crm.accounts | contracts.manage | Later | No |
| GET | `/contract-versions` | — | ContractVersionPage | crm.accounts | contracts.approve | Later | No |
| GET | `/contract-versions/{id}` | — | ContractVersionRead | crm.accounts | contracts.approve | Later | No |
| POST | `/contract-versions` | ContractVersionCreate | ContractVersionRead | crm.accounts | contracts.approve | Later | No |
| GET | `/success-milestones` | — | SuccessMilestonePage | crm.success | success.manage | Later | No |
| GET | `/success-milestones/{id}` | — | SuccessMilestoneRead | crm.success | success.manage | Later | No |
| POST | `/success-milestones` | SuccessMilestoneCreate | SuccessMilestoneRead | crm.success | success.manage | Later | No |
| GET | `/health-model-versions` | — | HealthModelVersionPage | crm.success | health.configure | Later | No |
| GET | `/health-model-versions/{id}` | — | HealthModelVersionRead | crm.success | health.configure | Later | No |
| POST | `/health-model-versions` | HealthModelVersionCreate | HealthModelVersionRead | crm.success | health.configure | Later | No |
| GET | `/health-factors` | — | HealthFactorPage | crm.success | health.configure | Later | No |
| GET | `/health-factors/{id}` | — | HealthFactorRead | crm.success | health.configure | Later | No |
| POST | `/health-factors` | HealthFactorCreate | HealthFactorRead | crm.success | health.configure | Later | No |
| GET | `/support-queues` | — | SupportQueuePage | crm.support | tickets.admin | Later | No |
| GET | `/support-queues/{id}` | — | SupportQueueRead | crm.support | tickets.admin | Later | No |
| POST | `/support-queues` | SupportQueueCreate | SupportQueueRead | crm.support | tickets.admin | Later | No |
| GET | `/sla-policy-versions` | — | SlaPolicyVersionPage | crm.support | tickets.admin | Later | No |
| GET | `/sla-policy-versions/{id}` | — | SlaPolicyVersionRead | crm.support | tickets.admin | Later | No |
| POST | `/sla-policy-versions` | SlaPolicyVersionCreate | SlaPolicyVersionRead | crm.support | tickets.admin | Later | No |
| GET | `/knowledge-articles` | — | KnowledgeArticlePage | crm.support | knowledge.publish | Later | No |
| GET | `/knowledge-articles/{id}` | — | KnowledgeArticleRead | crm.support | knowledge.publish | Later | No |
| POST | `/knowledge-articles` | KnowledgeArticleCreate | KnowledgeArticleRead | crm.support | knowledge.publish | Later | No |
| GET | `/jurisdiction-packs` | — | JurisdictionPackPage | compliance.country | compliance.configure | Later | No |
| GET | `/jurisdiction-packs/{id}` | — | JurisdictionPackRead | compliance.country | compliance.configure | Later | No |
| POST | `/jurisdiction-packs` | JurisdictionPackCreate | JurisdictionPackRead | compliance.country | compliance.configure | Later | No |
| GET | `/rule-proposals` | — | RuleProposalPage | compliance.country | compliance.configure | Later | No |
| GET | `/rule-proposals/{id}` | — | RuleProposalRead | compliance.country | compliance.configure | Later | No |
| POST | `/rule-proposals` | RuleProposalCreate | RuleProposalRead | compliance.country | compliance.configure | Later | No |
| GET | `/announcements` | — | AnnouncementPage | experience.portal | communications.publish | Later | No |
| GET | `/announcements/{id}` | — | AnnouncementRead | experience.portal | communications.publish | Later | No |
| POST | `/announcements` | AnnouncementCreate | AnnouncementRead | experience.portal | communications.publish | Later | No |
| GET | `/surveys` | — | SurveyPage | experience.engagement | engagement.manage | Later | No |
| GET | `/surveys/{id}` | — | SurveyRead | experience.engagement | engagement.manage | Later | No |
| POST | `/surveys` | SurveyCreate | SurveyRead | experience.engagement | engagement.manage | Later | No |
| GET | `/approval-requests` | — | ApprovalRequestPage | platform.core | approvals.read | Later | No |
| GET | `/approval-requests/{id}` | — | ApprovalRequestRead | platform.core | approvals.read | Later | No |
| GET | `/leave-ledger` | — | LeaveLedgerEntryPage | hr.leave | leave.ledger.read | Later | No |
| GET | `/leave-ledger/{id}` | — | LeaveLedgerEntryRead | hr.leave | leave.ledger.read | Later | No |
| GET | `/employment-contracts` | — | EmploymentContractPage | hr.records | employees.restricted.read | Later | No |
| GET | `/employment-contracts/{id}` | — | EmploymentContractRead | hr.records | employees.restricted.read | Later | No |
| GET | `/final-settlements` | — | FinalSettlementPage | payroll.engine | payroll.approve | Later | No |
| GET | `/final-settlements/{id}` | — | FinalSettlementRead | payroll.engine | payroll.approve | Later | No |
| GET | `/health-snapshots` | — | HealthSnapshotPage | crm.success | health.read | Later | No |
| GET | `/health-snapshots/{id}` | — | HealthSnapshotRead | crm.success | health.read | Later | No |
| POST | `/placements/{id}/begin` | PlacementBeginRequest | PlacementRead | agency.starts | placements.write | R1 | Required |
| POST | `/placements/{id}/replan` | PlacementReplanRequest | PlacementRead | agency.starts | placements.write | R1 | Required |
| POST | `/placements/{id}/mark-ready` | PlacementMarkReadyRequest | PlacementRead | agency.starts | placements.decide | R1 | Required |
| POST | `/placements/{id}/confirm-start` | PlacementConfirmStartRequest | PlacementRead | agency.starts | placements.decide | R1 | Required |
| POST | `/placements/{id}/cancel` | PlacementCancelRequest | PlacementRead | agency.starts | placements.decide | R1 | Required |
| POST | `/placements/{id}/reopen` | PlacementReopenRequest | PlacementRead | agency.starts | placements.decide | R1 | Required |
| POST | `/placement-tasks/{id}/assign` | PlacementTaskAssignRequest | PlacementTaskRead | agency.starts | tasks.assign | R1 | Required |
| POST | `/placement-tasks/{id}/complete` | PlacementTaskCompleteRequest | PlacementTaskRead | agency.starts | tasks.complete | R1 | Required |
| POST | `/placement-tasks/{id}/waive` | PlacementTaskWaiveRequest | PlacementTaskRead | agency.starts | placements.decide | R1 | Required |
| POST | `/placement-exceptions/{id}/resolve` | PlacementExceptionResolveRequest | PlacementExceptionRead | agency.starts | placements.write | R1 | Required |
| POST | `/participant-grants/{id}/revoke` | ParticipantGrantRevokeRequest | ParticipantGrantRead | agency.starts | participants.manage | R1 | Required |
| POST | `/module-activations/{id}/transition` | ModuleActivationTransitionRequest | ModuleActivationRead | platform.core | billing.manage | R1 | Required |
| POST | `/memberships/{id}/revoke` | MembershipRevokeRequest | MembershipRead | platform.core | roles.manage | R1 | Required |
| POST | `/template-versions/{id}/publish` | TemplateVersionPublishRequest | TemplateVersionRead | platform.core | tenant.manage | R1 | Required |
| POST | `/imports/{id}/validate` | ImportBatchValidateRequest | ImportBatchRead | platform.integrations | imports.run | R1 | Required |
| POST | `/imports/{id}/commit` | ImportBatchCommitRequest | ImportBatchRead | platform.integrations | imports.run | R1 | Required |
| POST | `/applications/{id}/screen` | ApplicationScreenRequest | ApplicationRead | talent.ats | applications.decide | Later | Required |
| POST | `/applications/{id}/schedule-interview` | ApplicationScheduleInterviewRequest | ApplicationRead | talent.ats | applications.decide | Later | Required |
| POST | `/applications/{id}/propose-offer` | ApplicationProposeOfferRequest | ApplicationRead | talent.ats | applications.decide | Later | Required |
| POST | `/applications/{id}/reject` | ApplicationRejectRequest | ApplicationRead | talent.ats | applications.decide | Later | Required |
| POST | `/applications/{id}/withdraw` | ApplicationWithdrawRequest | ApplicationRead | talent.ats | applications.decide | Later | Required |
| POST | `/offers/{id}/submit` | OfferSubmitRequest | OfferRead | talent.ats | offers.approve | Later | Required |
| POST | `/offers/{id}/approve` | OfferApproveRequest | OfferRead | talent.ats | offers.approve | Later | Required |
| POST | `/offers/{id}/issue` | OfferIssueRequest | OfferRead | talent.ats | offers.approve | Later | Required |
| POST | `/offers/{id}/accept` | OfferAcceptRequest | OfferRead | talent.ats | offers.approve | Later | Required |
| POST | `/offers/{id}/decline` | OfferDeclineRequest | OfferRead | talent.ats | offers.approve | Later | Required |
| POST | `/lifecycle-cases/{id}/activate` | LifecycleCaseActivateRequest | LifecycleCaseRead | hr.lifecycle | lifecycle.manage | Later | Required |
| POST | `/lifecycle-cases/{id}/block` | LifecycleCaseBlockRequest | LifecycleCaseRead | hr.lifecycle | lifecycle.manage | Later | Required |
| POST | `/lifecycle-cases/{id}/complete` | LifecycleCaseCompleteRequest | LifecycleCaseRead | hr.lifecycle | lifecycle.manage | Later | Required |
| POST | `/lifecycle-cases/{id}/cancel` | LifecycleCaseCancelRequest | LifecycleCaseRead | hr.lifecycle | lifecycle.manage | Later | Required |
| POST | `/leave-requests/{id}/submit` | LeaveRequestSubmitRequest | LeaveRequestRead | hr.leave | leave.request | Later | Required |
| POST | `/leave-requests/{id}/cancel` | LeaveRequestCancelRequest | LeaveRequestRead | hr.leave | leave.request | Later | Required |
| POST | `/payroll-input-batches/{id}/submit` | PayrollInputBatchSubmitRequest | PayrollInputBatchRead | payroll.inputs | payroll.inputs.prepare | Later | Required |
| POST | `/payroll-input-batches/{id}/export` | PayrollInputBatchExportRequest | PayrollInputBatchRead | payroll.inputs | payroll.inputs.prepare | Later | Required |
| POST | `/pay-runs/{id}/calculate` | PayRunCalculateRequest | PayRunRead | payroll.engine | payroll.calculate | Later | Required |
| POST | `/pay-runs/{id}/submit` | PayRunSubmitRequest | PayRunRead | payroll.engine | payroll.calculate | Later | Required |
| POST | `/expense-claims/{id}/submit` | ExpenseClaimSubmitRequest | ExpenseClaimRead | hr.benefits | expenses.request | Later | Required |
| POST | `/expense-claims/{id}/cancel` | ExpenseClaimCancelRequest | ExpenseClaimRead | hr.benefits | expenses.request | Later | Required |
| POST | `/opportunities/{id}/advance` | OpportunityAdvanceRequest | OpportunityRead | crm.sales | opportunities.manage | Later | Required |
| POST | `/opportunities/{id}/mark-won` | OpportunityMarkWonRequest | OpportunityRead | crm.sales | opportunities.manage | Later | Required |
| POST | `/opportunities/{id}/mark-lost` | OpportunityMarkLostRequest | OpportunityRead | crm.sales | opportunities.manage | Later | Required |
| POST | `/opportunities/{id}/reopen` | OpportunityReopenRequest | OpportunityRead | crm.sales | opportunities.manage | Later | Required |
| POST | `/success-plans/{id}/activate` | SuccessPlanActivateRequest | SuccessPlanRead | crm.success | success.manage | Later | Required |
| POST | `/success-plans/{id}/block` | SuccessPlanBlockRequest | SuccessPlanRead | crm.success | success.manage | Later | Required |
| POST | `/success-plans/{id}/complete` | SuccessPlanCompleteRequest | SuccessPlanRead | crm.success | success.manage | Later | Required |
| POST | `/success-plans/{id}/cancel` | SuccessPlanCancelRequest | SuccessPlanRead | crm.success | success.manage | Later | Required |
| POST | `/support-tickets/{id}/start` | SupportTicketStartRequest | SupportTicketRead | crm.support | tickets.manage | Later | Required |
| POST | `/support-tickets/{id}/wait` | SupportTicketWaitRequest | SupportTicketRead | crm.support | tickets.manage | Later | Required |
| POST | `/support-tickets/{id}/resolve` | SupportTicketResolveRequest | SupportTicketRead | crm.support | tickets.manage | Later | Required |
| POST | `/support-tickets/{id}/close` | SupportTicketCloseRequest | SupportTicketRead | crm.support | tickets.manage | Later | Required |
| POST | `/support-tickets/{id}/reopen` | SupportTicketReopenRequest | SupportTicketRead | crm.support | tickets.manage | Later | Required |
| POST | `/leave-requests/{id}/approve` | LeaveRequestApproveRequest | LeaveRequestRead | hr.leave | leave.approve | Later | Required |
| POST | `/leave-requests/{id}/reject` | LeaveRequestRejectRequest | LeaveRequestRead | hr.leave | leave.approve | Later | Required |
| POST | `/payroll-input-batches/{id}/approve` | PayrollInputBatchApproveRequest | PayrollInputBatchRead | payroll.inputs | payroll.inputs.approve | Later | Required |
| POST | `/payroll-input-batches/{id}/reject` | PayrollInputBatchRejectRequest | PayrollInputBatchRead | payroll.inputs | payroll.inputs.approve | Later | Required |
| POST | `/pay-runs/{id}/approve` | PayRunApproveRequest | PayRunRead | payroll.engine | payroll.approve | Later | Required |
| POST | `/pay-runs/{id}/reject` | PayRunRejectRequest | PayRunRead | payroll.engine | payroll.approve | Later | Required |
| POST | `/expense-claims/{id}/approve` | ExpenseClaimApproveRequest | ExpenseClaimRead | hr.benefits | expenses.approve | Later | Required |
| POST | `/expense-claims/{id}/reject` | ExpenseClaimRejectRequest | ExpenseClaimRead | hr.benefits | expenses.approve | Later | Required |
| POST | `/pay-runs/{id}/finalize` | PayRunFinalizeRequest | PayRunRead | payroll.engine | payroll.release | Later | Required |
| POST | `/expense-claims/{id}/record-reimbursement` | ExpenseClaimRecordReimbursementRequest | ExpenseClaimRead | hr.benefits | expenses.reconcile | Later | Required |
| POST | `/benefit-enrollments/{id}/approve` | BenefitEnrollmentApproveRequest | BenefitEnrollmentRead | hr.benefits | benefits.manage | Later | Required |
| POST | `/benefit-enrollments/{id}/reject` | BenefitEnrollmentRejectRequest | BenefitEnrollmentRead | hr.benefits | benefits.manage | Later | Required |
| POST | `/benefit-enrollments/{id}/end` | BenefitEnrollmentEndRequest | BenefitEnrollmentRead | hr.benefits | benefits.manage | Later | Required |
| POST | `/review-submissions/{id}/submit` | ReviewSubmissionSubmitRequest | ReviewSubmissionRead | talent.performance | performance.review | Later | Required |
| POST | `/review-submissions/{id}/publish` | ReviewSubmissionPublishRequest | ReviewSubmissionRead | talent.performance | performance.review | Later | Required |
| POST | `/learning-assignments/{id}/record-completion` | LearningAssignmentRecordCompletionRequest | LearningAssignmentRead | talent.learning | learning.admin | Later | Required |
| POST | `/shift-swaps/{id}/approve` | ShiftSwapApproveRequest | ShiftSwapRead | workforce.schedule | schedule.swap.approve | Later | Required |
| POST | `/shift-swaps/{id}/reject` | ShiftSwapRejectRequest | ShiftSwapRead | workforce.schedule | schedule.swap.approve | Later | Required |
| POST | `/time-entries/{id}/approve` | TimeEntryApproveRequest | TimeEntryRead | workforce.time | time.approve | Later | Required |
| POST | `/time-entries/{id}/reject` | TimeEntryRejectRequest | TimeEntryRead | workforce.time | time.approve | Later | Required |
| POST | `/quotes/{id}/submit` | QuoteSubmitRequest | QuoteRead | crm.sales | quotes.approve | Later | Required |
| POST | `/quotes/{id}/approve` | QuoteApproveRequest | QuoteRead | crm.sales | quotes.approve | Later | Required |
| POST | `/quotes/{id}/issue` | QuoteIssueRequest | QuoteRead | crm.sales | quotes.approve | Later | Required |
| POST | `/rule-proposals/{id}/approve-legal` | RuleProposalApproveLegalRequest | RuleProposalRead | compliance.country | compliance.review | Later | Required |
| POST | `/rule-proposals/{id}/approve-engineering` | RuleProposalApproveEngineeringRequest | RuleProposalRead | compliance.country | compliance.review | Later | Required |
| POST | `/rule-proposals/{id}/publish` | RuleProposalPublishRequest | RuleProposalRead | compliance.country | compliance.review | Later | Required |
| POST | `/knowledge-articles/{id}/publish` | KnowledgeArticlePublishRequest | KnowledgeArticleRead | crm.support | knowledge.publish | Later | Required |
| POST | `/knowledge-articles/{id}/withdraw` | KnowledgeArticleWithdrawRequest | KnowledgeArticleRead | crm.support | knowledge.publish | Later | Required |
| POST | `/career-postings/{id}/publish` | CareerPostingPublishRequest | CareerPostingRead | talent.ats | requisitions.manage | Later | Required |
| POST | `/career-postings/{id}/withdraw` | CareerPostingWithdrawRequest | CareerPostingRead | talent.ats | requisitions.manage | Later | Required |
| POST | `/support-tickets/{id}/reply` | SupportTicketReplyRequest | SupportTicketRead | crm.support | tickets.manage | Later | Required |
| POST | `/leads/{id}/convert` | LeadConvertRequest | LeadRead | crm.sales | opportunities.manage | Later | Required |
| POST | `/asset-assignments/{id}/record-return` | AssetAssignmentRecordReturnRequest | AssetAssignmentRead | hr.lifecycle | assets.manage | Later | Required |
| POST | `/client-accounts/{id}/update-profile` | ClientAccountUpdateProfileRequest | ClientAccountRead | crm.accounts | accounts.write | R1 | Required |
| POST | `/contacts/{id}/update-profile` | ContactUpdateProfileRequest | ContactRead | crm.accounts | contacts.manage | R1 | Required |
| POST | `/saved-views/{id}/update-profile` | SavedViewUpdateProfileRequest | SavedViewRead | platform.analytics | reports.read | R1 | Required |
| POST | `/invitations` | InvitationCreateRequest | InvitationRead | platform.core | participants.manage or roles.manage according to target scope | R1 | No |
| POST | `/invitations/{id}/accept` | InvitationAcceptRequest | InvitationRead | platform.core | verified OIDC identity + valid single-use invitation, not prior tenant membership | R1 | No |
| POST | `/approval-requests/{id}/decide` | ApprovalRequestDecideRequest | ApprovalRequestRead | platform.core | approvals.decide + exact source-domain approval permission | Later | Required |
| POST | `/employee-cases` | EmployeeCaseOpenRequest | EmployeeCaseRead | experience.engagement | cases.open + own employment or explicit case authority | Later | No |
| POST | `/documents` | DocumentStageRequest | DocumentRead | hr.records | documents.manage | Later | No |
| PUT | `/documents/{id}/content` | bounded allowlisted binary | DocumentRead | hr.records | documents.manage | Later | Required |
| POST | `/imports` | ImportStageRequest | ImportBatchRead | platform.integrations | imports.run | R1 | No |
| PUT | `/imports/{id}/content` | text/csv ≤10 MiB | ImportBatchRead | platform.integrations | imports.run | R1 | Required |
| POST | `/report-snapshots` | RunReportRequest | ReportSnapshotRead | platform.analytics | reports.read | R1 | No |
| GET | `/report-snapshots/{id}/results` | — | ReportResultRowPage | platform.analytics | reports.read | R1 | No |
| POST | `/export-artifacts` | ExportRequest | ExportArtifactRead | platform.analytics | reports.export | R1 | No |
| GET | `/export-artifacts/{id}/download` | — | ExportArtifactRead | platform.analytics | reports.export | R1 | No |
| POST | `/webhooks/{connectorId}/events` | WebhookEvent | WebhookAck | platform.integrations | signature-bound endpoint; no browser cookie | Later | No |

## API-003 — Workflow and event semantics

State transitions and atomic work are in WORKFLOW_STATE_DIAGRAMS.md. Routes never accept approvedBy, requester/actor identity, arbitrary state, tenantId, usage values, calculated net pay or scope hash as authoritative request fields. Creation initializes documented server state: placement accepted/current date from original; task instances from template; owner-approved client references; batch/run/expense/offer draft; lead new; opportunity qualified; success plan draft; ticket open; enrollment requested. Set inferred actor and timestamps server-side.

WebhookEvent is the signed outbound domain-event envelope and the normalized inbound provider contract. An actual vendor-specific receiver adds that provider's raw schema/signature mapper before support is declared; it must not accept arbitrary vendors as if they emit this schema. Tenant/cell comes from configured connector routing, not webhook payload. R1 stores internal outbox events but exposes no public webhook delivery. Later outbound consumers receive minimum references/status, scoped package access and at-least-once delivery; no payroll values or personal documents in generic events. Each receiver deduplicates by consumer/event ID and checks aggregate version. Unknown outcome requires reconciliation, not blind replay.

Trace: API-001 maps REQ-P001/P002/P003/P006/P011 and REQ-E001–REQ-E014; R1 resources map REQ-F001/F002/F003/F029/F038/F039/F040, reports map REQ-R001–REQ-R010 and KPI definitions. Later routes map the same-named feature/module contracts; presence in this catalog does not enable them. Existing IMP/TEST IDs remain planned; add real handler/test evidence during implementation.

## API-004 — Creation and interval semantics

Server-owned creation values are explicit: ClientAccount.status=active; TemplateVersion.state=draft; Requisition.state=draft; Application.state=new/appliedAt=now; Interview.state=scheduled; LifecycleCase.state=draft; LeaveRequest.state=draft; TimeEntry.state=submitted; Shift.state=draft; PayrollInputBatch/PayRun/ExpenseClaim/Quote/ReviewCycle.state=draft; PayrollInput.state=pending; LearningAssignment.state=assigned; Asset.state=available; Lead.state=new; Opportunity.state=qualified; SuccessPlan.state=draft with startedAt=null; SupportTicket.state=open; BenefitEnrollment.state=requested. Case/claim/ticket numbers and creator/reviewer identities are assigned or validated by the owning service, never proof of approval supplied by a client. Codes outside a module's registered lifecycle are rejected even if a schema uses a string.

Creating published effective records (terms, calendar/policy/contract/benefit versions) is a reviewed publication command: require the appropriate approval authority/evidence before inserting the immutable effective row, derive reviewer/recording time server-side, and use a superseding version for corrections. RuleVersion has no generic create API; RuleProposal publication requires separately recorded legal and engineering review, compiled adapter/fixture hashes and current applicability. No paid subscription bypasses these gates.

PayPeriod/ReviewCycle use half-open date intervals [startsOn,endsOn); LeaveRequest uses inclusive startsOn/endsOn with separately calculated explicit quantity/unit; Employment.endDate is the last service date, and historical status/end corrections use EmploymentLifecycleEvent. TimeEntry/Shift/Interview intervals are [start instant,end instant). SuccessPlan starts only on activate; setting it up does not imply customer onboarding began. Relative report dates show resolved timezone/date boundaries.

Invitation acceptance is a narrow verified-identity bootstrap exception to prior membership and ordinary If-Match: hash/token consumption, recipient proof, tenant/cell and delegated role scope are checked atomically before creating membership/contact link. It grants no other tenant reads before that succeeds. Role administrators can grant only delegable actions and scopes; reserved built-in bundles and self-escalation remain protected. Unpublished task definitions may be edited only through reviewed version-building commands; published templates are immutable.

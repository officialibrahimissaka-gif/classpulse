# Entity relationship diagrams

Phase 3 design baseline: 1 November 2026. Proposed contracts; no application implementation or production migration.

## ERD-001 — Full physical relationship graph

The graph shows every declared tenant-domain FK. Each node has the shared composite primary key; attributes and optionality are fully listed in DATA_DICTIONARY.md and Prisma. Tenant→every table is omitted from the drawing only to avoid 164 repetitive ownership edges; the mandatory FKs and RLS remain in the schema/SQL. Dashed optionality is represented by `o|` parent cardinality. No diagram arrow grants authorization. Later modules remain disabled in R1.

```mermaid
erDiagram
    LegalEntity {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Team {
        uuid tenant_id PK,FK
        uuid id PK
    }
    WorkCalendar {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CalendarVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CalendarDay {
        uuid tenant_id PK,FK
        uuid id PK
    }
    JurisdictionPack {
        uuid tenant_id PK,FK
        uuid id PK
    }
    RuleVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ApplicabilityAssignment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    RetentionPolicy {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LegalHold {
        uuid tenant_id PK,FK
        uuid id PK
    }
    HeldRecord {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PrivacyRequest {
        uuid tenant_id PK,FK
        uuid id PK
    }
    DeletionTombstone {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Principal {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Membership {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Role {
        uuid tenant_id PK,FK
        uuid id PK
    }
    RolePermission {
        uuid tenant_id PK,FK
        uuid id PK
    }
    RoleGrant {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Session {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Invitation {
        uuid tenant_id PK,FK
        uuid id PK
    }
    OperatorAccessGrant {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ClientAccount {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Contact {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Candidate {
        uuid tenant_id PK,FK
        uuid id PK
    }
    WorkflowTemplate {
        uuid tenant_id PK,FK
        uuid id PK
    }
    TemplateVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    TaskDefinition {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Placement {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PlacementDateRevision {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Milestone {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PlacementTask {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PlacementException {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ParticipantGrant {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SharedField {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReadinessDecision {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Person {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PersonIdentifier {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Employee {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Position {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Employment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EmploymentTerm {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EmploymentContract {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CandidateConversion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CandidateProfile {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Requisition {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Application {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ApplicationStageEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Interview {
        uuid tenant_id PK,FK
        uuid id PK
    }
    InterviewFeedback {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Offer {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CareerPosting {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LifecycleCase {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LifecycleTask {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LeavePolicyVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LeaveAccount {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LeaveRequest {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LeaveLedgerEntry {
        uuid tenant_id PK,FK
        uuid id PK
    }
    TimeEntry {
        uuid tenant_id PK,FK
        uuid id PK
    }
    TimeApproval {
        uuid tenant_id PK,FK
        uuid id PK
    }
    TimeApprovalItem {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Shift {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ShiftAssignment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ShiftSwap {
        uuid tenant_id PK,FK
        uuid id PK
    }
    WorkAssignment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ClientTimeApproval {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayPeriod {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayrollInputBatch {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayrollInput {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayrollException {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayrollProviderExport {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayRun {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayRunWorker {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PayCalculationLine {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Payslip {
        uuid tenant_id PK,FK
        uuid id PK
    }
    FinalSettlement {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PaymentEvidence {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CompensationCycle {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CompensationProposal {
        uuid tenant_id PK,FK
        uuid id PK
    }
    BenefitPlan {
        uuid tenant_id PK,FK
        uuid id PK
    }
    BenefitPlanVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    BenefitEnrollment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReviewCycle {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Goal {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReviewSubmission {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CalibrationDecision {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LearningCourse {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CourseVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LearningAssignment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Skill {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SkillEvidence {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SuccessionPlan {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SuccessionCandidate {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Document {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EmploymentDocument {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CandidateDocument {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Asset {
        uuid tenant_id PK,FK
        uuid id PK
    }
    AssetAssignment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ExpenseClaim {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ExpenseLine {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReimbursementEvidence {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EmployeeCase {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EmployeeCaseAccess {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Announcement {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Acknowledgment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Survey {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SurveyResponse {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Lead {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Opportunity {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SalesStageEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Activity {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CommercialContract {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ContractVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Quote {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CommercialOrder {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SuccessPlan {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SuccessMilestone {
        uuid tenant_id PK,FK
        uuid id PK
    }
    HealthModelVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    HealthFactor {
        uuid tenant_id PK,FK
        uuid id PK
    }
    HealthSnapshot {
        uuid tenant_id PK,FK
        uuid id PK
    }
    HealthFactorResult {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Renewal {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SupportQueue {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SlaPolicyVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SupportTicket {
        uuid tenant_id PK,FK
        uuid id PK
    }
    TicketReply {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SlaClockEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    KnowledgeArticle {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CsatInvitation {
        uuid tenant_id PK,FK
        uuid id PK
    }
    CsatResponse {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ApprovalRequest {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ApprovalStep {
        uuid tenant_id PK,FK
        uuid id PK
    }
    AutomationRuleVersion {
        uuid tenant_id PK,FK
        uuid id PK
    }
    AutomationRun {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Subscription {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ModuleActivation {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EntitlementGrant {
        uuid tenant_id PK,FK
        uuid id PK
    }
    UsageCounter {
        uuid tenant_id PK,FK
        uuid id PK
    }
    UsageReservation {
        uuid tenant_id PK,FK
        uuid id PK
    }
    UsageEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    MetricDefinition {
        uuid tenant_id PK,FK
        uuid id PK
    }
    SavedView {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReportSnapshot {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ExportArtifact {
        uuid tenant_id PK,FK
        uuid id PK
    }
    DownloadGrant {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReportSchedule {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReportRecipient {
        uuid tenant_id PK,FK
        uuid id PK
    }
    Connector {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ExternalMapping {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ImportBatch {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ImportError {
        uuid tenant_id PK,FK
        uuid id PK
    }
    IdempotencyRecord {
        uuid tenant_id PK,FK
        uuid id PK
    }
    OutboxEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    InboxEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    BackgroundJob {
        uuid tenant_id PK,FK
        uuid id PK
    }
    NotificationDelivery {
        uuid tenant_id PK,FK
        uuid id PK
    }
    AuditEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    RuleProposal {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PlacementTransition {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReportMetricBinding {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ReportResultRow {
        uuid tenant_id PK,FK
        uuid id PK
    }
    PersonMembershipLink {
        uuid tenant_id PK,FK
        uuid id PK
    }
    ContactMembershipLink {
        uuid tenant_id PK,FK
        uuid id PK
    }
    EmploymentLifecycleEvent {
        uuid tenant_id PK,FK
        uuid id PK
    }
    OrganizationAssignment {
        uuid tenant_id PK,FK
        uuid id PK
    }
    LegalEntity ||--o{ Team : "entity"
    Team |o--o{ Team : "parent"
    LegalEntity ||--o{ WorkCalendar : "entity"
    WorkCalendar ||--o{ CalendarVersion : "calendar"
    Membership |o--o{ CalendarVersion : "approvedBy"
    CalendarVersion ||--o{ CalendarDay : "calendarVersion"
    JurisdictionPack ||--o{ RuleVersion : "pack"
    Membership |o--o{ RuleVersion : "legalReviewer"
    Membership |o--o{ RuleVersion : "engineeringReviewer"
    LegalEntity ||--o{ ApplicabilityAssignment : "entity"
    RuleVersion ||--o{ ApplicabilityAssignment : "ruleVersion"
    Membership ||--o{ ApplicabilityAssignment : "reviewer"
    LegalEntity |o--o{ RetentionPolicy : "entity"
    Membership ||--o{ RetentionPolicy : "reviewer"
    Membership ||--o{ LegalHold : "owner"
    LegalHold ||--o{ HeldRecord : "hold"
    Membership ||--o{ PrivacyRequest : "owner"
    Principal ||--o{ Membership : "principal"
    Role ||--o{ RolePermission : "role"
    Membership ||--o{ RoleGrant : "membership"
    Role ||--o{ RoleGrant : "role"
    LegalEntity |o--o{ RoleGrant : "entity"
    Team |o--o{ RoleGrant : "team"
    ClientAccount |o--o{ RoleGrant : "client"
    Placement |o--o{ RoleGrant : "placement"
    Membership ||--o{ Session : "membership"
    Role ||--o{ Invitation : "role"
    Membership ||--o{ Invitation : "inviter"
    Placement |o--o{ Invitation : "placement"
    Contact |o--o{ Invitation : "contact"
    Membership ||--o{ OperatorAccessGrant : "approvedBy"
    LegalEntity ||--o{ ClientAccount : "entity"
    Membership ||--o{ ClientAccount : "owner"
    ClientAccount ||--o{ Contact : "client"
    Membership ||--o{ Contact : "owner"
    Membership ||--o{ Candidate : "owner"
    WorkflowTemplate ||--o{ TemplateVersion : "template"
    Membership |o--o{ TemplateVersion : "publisher"
    TemplateVersion ||--o{ TaskDefinition : "templateVersion"
    LegalEntity ||--o{ Placement : "entity"
    ClientAccount ||--o{ Placement : "client"
    Candidate ||--o{ Placement : "candidate"
    Membership ||--o{ Placement : "owner"
    TemplateVersion ||--o{ Placement : "templateVersion"
    Placement ||--o{ PlacementDateRevision : "placement"
    Membership ||--o{ PlacementDateRevision : "actor"
    Placement ||--o{ Milestone : "placement"
    Placement ||--o{ PlacementTask : "placement"
    Milestone ||--o{ PlacementTask : "milestone"
    TaskDefinition ||--o{ PlacementTask : "definition"
    Membership ||--o{ PlacementTask : "owner"
    Membership |o--o{ PlacementTask : "completedBy"
    Placement ||--o{ PlacementException : "placement"
    Membership ||--o{ PlacementException : "owner"
    Placement ||--o{ ParticipantGrant : "placement"
    Contact ||--o{ ParticipantGrant : "contact"
    Membership ||--o{ ParticipantGrant : "membership"
    Membership ||--o{ ParticipantGrant : "grantedBy"
    ParticipantGrant ||--o{ SharedField : "grant"
    Placement ||--o{ ReadinessDecision : "placement"
    Membership ||--o{ ReadinessDecision : "actor"
    Person ||--o{ PersonIdentifier : "person"
    Person ||--o{ Employee : "person"
    LegalEntity ||--o{ Position : "entity"
    Team |o--o{ Position : "team"
    Employee ||--o{ Employment : "employee"
    LegalEntity ||--o{ Employment : "entity"
    Employment |o--o{ Employment : "manager"
    Position |o--o{ Employment : "position"
    Employment ||--o{ EmploymentTerm : "employment"
    CalendarVersion ||--o{ EmploymentTerm : "calendarVersion"
    Membership ||--o{ EmploymentTerm : "approvedBy"
    Employment ||--o{ EmploymentContract : "employment"
    Document |o--o{ EmploymentContract : "document"
    Candidate ||--o{ CandidateConversion : "candidate"
    Person ||--o{ CandidateConversion : "person"
    Membership ||--o{ CandidateConversion : "actor"
    Candidate ||--o{ CandidateProfile : "candidate"
    LegalEntity ||--o{ Requisition : "entity"
    ClientAccount |o--o{ Requisition : "client"
    Membership ||--o{ Requisition : "owner"
    Candidate ||--o{ Application : "candidate"
    Requisition ||--o{ Application : "requisition"
    Application ||--o{ ApplicationStageEvent : "application"
    Membership ||--o{ ApplicationStageEvent : "actor"
    Application ||--o{ Interview : "application"
    Membership ||--o{ Interview : "interviewer"
    Interview ||--o{ InterviewFeedback : "interview"
    Membership ||--o{ InterviewFeedback : "reviewer"
    Application ||--o{ Offer : "application"
    Membership |o--o{ Offer : "approver"
    Requisition ||--o{ CareerPosting : "requisition"
    Employment ||--o{ LifecycleCase : "employment"
    Membership ||--o{ LifecycleCase : "owner"
    TemplateVersion ||--o{ LifecycleCase : "templateVersion"
    LifecycleCase ||--o{ LifecycleTask : "case"
    Membership ||--o{ LifecycleTask : "owner"
    LegalEntity ||--o{ LeavePolicyVersion : "entity"
    RuleVersion |o--o{ LeavePolicyVersion : "ruleVersion"
    Employment ||--o{ LeaveAccount : "employment"
    LeavePolicyVersion ||--o{ LeaveAccount : "policyVersion"
    LeaveAccount ||--o{ LeaveRequest : "account"
    Membership ||--o{ LeaveRequest : "requester"
    LeaveAccount ||--o{ LeaveLedgerEntry : "account"
    LeaveRequest |o--o{ LeaveLedgerEntry : "request"
    LeaveLedgerEntry |o--o{ LeaveLedgerEntry : "reverses"
    Employment ||--o{ TimeEntry : "employment"
    TimeEntry |o--o{ TimeEntry : "corrects"
    WorkAssignment |o--o{ TimeEntry : "assignment"
    Employment ||--o{ TimeApproval : "employment"
    Membership ||--o{ TimeApproval : "approver"
    TimeApproval ||--o{ TimeApprovalItem : "approval"
    TimeEntry ||--o{ TimeApprovalItem : "entry"
    LegalEntity ||--o{ Shift : "entity"
    Team ||--o{ Shift : "team"
    Shift ||--o{ ShiftAssignment : "shift"
    Employment ||--o{ ShiftAssignment : "employment"
    ShiftAssignment ||--o{ ShiftSwap : "sourceAssignment"
    ShiftAssignment ||--o{ ShiftSwap : "targetAssignment"
    Membership ||--o{ ShiftSwap : "requester"
    Membership |o--o{ ShiftSwap : "approver"
    Employment ||--o{ WorkAssignment : "employment"
    ClientAccount ||--o{ WorkAssignment : "client"
    WorkAssignment ||--o{ ClientTimeApproval : "assignment"
    TimeApproval ||--o{ ClientTimeApproval : "timeApproval"
    Contact ||--o{ ClientTimeApproval : "contact"
    LegalEntity ||--o{ PayPeriod : "entity"
    PayPeriod ||--o{ PayrollInputBatch : "period"
    Membership ||--o{ PayrollInputBatch : "preparer"
    Membership |o--o{ PayrollInputBatch : "approver"
    PayrollInputBatch ||--o{ PayrollInput : "batch"
    Employment ||--o{ PayrollInput : "employment"
    PayrollInputBatch ||--o{ PayrollException : "batch"
    Employment ||--o{ PayrollException : "employment"
    Membership ||--o{ PayrollException : "owner"
    PayrollInputBatch ||--o{ PayrollProviderExport : "batch"
    ExportArtifact ||--o{ PayrollProviderExport : "artifact"
    RuleVersion |o--o{ PayrollProviderExport : "ruleVersion"
    PayrollInputBatch ||--o{ PayRun : "batch"
    RuleVersion ||--o{ PayRun : "ruleVersion"
    Membership ||--o{ PayRun : "preparer"
    Membership |o--o{ PayRun : "approver"
    PayRun |o--o{ PayRun : "adjustsRun"
    PayRun ||--o{ PayRunWorker : "run"
    Employment ||--o{ PayRunWorker : "employment"
    EmploymentTerm ||--o{ PayRunWorker : "term"
    PayRunWorker ||--o{ PayCalculationLine : "worker"
    PayRunWorker ||--o{ Payslip : "worker"
    ExportArtifact ||--o{ Payslip : "artifact"
    Employment ||--o{ FinalSettlement : "employment"
    RuleVersion ||--o{ FinalSettlement : "ruleVersion"
    Membership |o--o{ FinalSettlement : "approver"
    FinalSettlement |o--o{ FinalSettlement : "supersedes"
    FinalSettlement |o--o{ PaymentEvidence : "settlement"
    PayrollProviderExport |o--o{ PaymentEvidence : "providerExport"
    LegalEntity ||--o{ CompensationCycle : "entity"
    Membership ||--o{ CompensationCycle : "owner"
    CompensationCycle ||--o{ CompensationProposal : "cycle"
    Employment ||--o{ CompensationProposal : "employment"
    Membership ||--o{ CompensationProposal : "proposer"
    Membership |o--o{ CompensationProposal : "approver"
    LegalEntity ||--o{ BenefitPlan : "entity"
    BenefitPlan ||--o{ BenefitPlanVersion : "plan"
    BenefitPlanVersion ||--o{ BenefitEnrollment : "planVersion"
    Employment ||--o{ BenefitEnrollment : "employment"
    Membership |o--o{ BenefitEnrollment : "approver"
    LegalEntity ||--o{ ReviewCycle : "entity"
    Membership ||--o{ ReviewCycle : "owner"
    ReviewCycle ||--o{ Goal : "cycle"
    Employment ||--o{ Goal : "employment"
    ReviewCycle ||--o{ ReviewSubmission : "cycle"
    Employment ||--o{ ReviewSubmission : "employment"
    Membership ||--o{ ReviewSubmission : "reviewer"
    ReviewSubmission ||--o{ CalibrationDecision : "submission"
    Membership ||--o{ CalibrationDecision : "actor"
    LearningCourse ||--o{ CourseVersion : "course"
    CourseVersion ||--o{ LearningAssignment : "courseVersion"
    Employment ||--o{ LearningAssignment : "employment"
    Skill ||--o{ SkillEvidence : "skill"
    Employment ||--o{ SkillEvidence : "employment"
    Membership |o--o{ SkillEvidence : "reviewer"
    Position ||--o{ SuccessionPlan : "position"
    Membership ||--o{ SuccessionPlan : "owner"
    SuccessionPlan ||--o{ SuccessionCandidate : "plan"
    Employment ||--o{ SuccessionCandidate : "employment"
    Membership ||--o{ Document : "owner"
    Employment ||--o{ EmploymentDocument : "employment"
    Document ||--o{ EmploymentDocument : "document"
    Candidate ||--o{ CandidateDocument : "candidate"
    Document ||--o{ CandidateDocument : "document"
    LegalEntity ||--o{ Asset : "entity"
    Asset ||--o{ AssetAssignment : "asset"
    Employment ||--o{ AssetAssignment : "employment"
    Membership ||--o{ AssetAssignment : "owner"
    Employment ||--o{ ExpenseClaim : "employment"
    Membership ||--o{ ExpenseClaim : "claimant"
    Membership |o--o{ ExpenseClaim : "approver"
    ExpenseClaim ||--o{ ExpenseLine : "claim"
    Document |o--o{ ExpenseLine : "receipt"
    ExpenseClaim ||--o{ ReimbursementEvidence : "claim"
    Employment ||--o{ EmployeeCase : "employment"
    Membership ||--o{ EmployeeCase : "owner"
    EmployeeCase ||--o{ EmployeeCaseAccess : "case"
    Membership ||--o{ EmployeeCaseAccess : "membership"
    Membership ||--o{ EmployeeCaseAccess : "grantedBy"
    LegalEntity ||--o{ Announcement : "entity"
    Membership ||--o{ Announcement : "publisher"
    Announcement ||--o{ Acknowledgment : "announcement"
    Membership ||--o{ Acknowledgment : "membership"
    LegalEntity ||--o{ Survey : "entity"
    Membership ||--o{ Survey : "owner"
    Survey ||--o{ SurveyResponse : "survey"
    Membership ||--o{ Lead : "owner"
    ClientAccount |o--o{ Lead : "convertedClient"
    ClientAccount ||--o{ Opportunity : "client"
    Membership ||--o{ Opportunity : "owner"
    Opportunity ||--o{ SalesStageEvent : "opportunity"
    Membership ||--o{ SalesStageEvent : "actor"
    Membership ||--o{ Activity : "owner"
    ClientAccount |o--o{ Activity : "client"
    Contact |o--o{ Activity : "contact"
    Lead |o--o{ Activity : "lead"
    Opportunity |o--o{ Activity : "opportunity"
    ClientAccount ||--o{ CommercialContract : "client"
    LegalEntity ||--o{ CommercialContract : "entity"
    CommercialContract ||--o{ ContractVersion : "contract"
    Membership |o--o{ ContractVersion : "approver"
    Opportunity ||--o{ Quote : "opportunity"
    Membership |o--o{ Quote : "approver"
    Quote ||--o{ CommercialOrder : "quote"
    ContractVersion |o--o{ CommercialOrder : "contractVersion"
    ClientAccount ||--o{ SuccessPlan : "client"
    Membership ||--o{ SuccessPlan : "owner"
    SuccessPlan ||--o{ SuccessMilestone : "plan"
    Membership ||--o{ SuccessMilestone : "owner"
    HealthModelVersion ||--o{ HealthFactor : "modelVersion"
    ClientAccount ||--o{ HealthSnapshot : "client"
    HealthModelVersion ||--o{ HealthSnapshot : "modelVersion"
    HealthSnapshot ||--o{ HealthFactorResult : "snapshot"
    HealthFactor ||--o{ HealthFactorResult : "factor"
    ContractVersion ||--o{ Renewal : "contractVersion"
    Membership ||--o{ Renewal : "owner"
    CalendarVersion ||--o{ SlaPolicyVersion : "calendarVersion"
    ClientAccount ||--o{ SupportTicket : "client"
    Contact ||--o{ SupportTicket : "requester"
    SupportQueue ||--o{ SupportTicket : "queue"
    Membership ||--o{ SupportTicket : "owner"
    SlaPolicyVersion ||--o{ SupportTicket : "slaPolicyVersion"
    SupportTicket ||--o{ TicketReply : "ticket"
    Membership ||--o{ TicketReply : "author"
    SupportTicket ||--o{ SlaClockEvent : "ticket"
    Membership |o--o{ KnowledgeArticle : "publisher"
    SupportTicket ||--o{ CsatInvitation : "ticket"
    CsatInvitation ||--o{ CsatResponse : "invitation"
    Membership ||--o{ ApprovalRequest : "requester"
    Placement |o--o{ ApprovalRequest : "placement"
    LeaveRequest |o--o{ ApprovalRequest : "leaveRequest"
    PayrollInputBatch |o--o{ ApprovalRequest : "inputBatch"
    PayRun |o--o{ ApprovalRequest : "payRun"
    ExpenseClaim |o--o{ ApprovalRequest : "expenseClaim"
    Quote |o--o{ ApprovalRequest : "quote"
    LifecycleCase |o--o{ ApprovalRequest : "lifecycleCase"
    Offer |o--o{ ApprovalRequest : "offer"
    ApprovalRequest ||--o{ ApprovalStep : "request"
    Membership ||--o{ ApprovalStep : "approver"
    Membership ||--o{ AutomationRuleVersion : "principal"
    AutomationRuleVersion ||--o{ AutomationRun : "ruleVersion"
    Subscription ||--o{ EntitlementGrant : "subscription"
    Membership |o--o{ EntitlementGrant : "approver"
    UsageCounter ||--o{ UsageReservation : "counter"
    UsageCounter ||--o{ UsageEvent : "counter"
    Membership ||--o{ SavedView : "owner"
    Team |o--o{ SavedView : "team"
    Membership ||--o{ ReportSnapshot : "requester"
    ReportSnapshot ||--o{ ExportArtifact : "snapshot"
    Membership ||--o{ ExportArtifact : "owner"
    ExportArtifact ||--o{ DownloadGrant : "artifact"
    Membership ||--o{ DownloadGrant : "membership"
    SavedView ||--o{ ReportSchedule : "view"
    Membership ||--o{ ReportSchedule : "owner"
    ReportSchedule ||--o{ ReportRecipient : "schedule"
    Membership ||--o{ ReportRecipient : "membership"
    Membership ||--o{ Connector : "principal"
    Connector ||--o{ ExternalMapping : "connector"
    Membership ||--o{ ImportBatch : "requester"
    ImportBatch ||--o{ ImportError : "batch"
    Membership ||--o{ IdempotencyRecord : "actor"
    Membership ||--o{ BackgroundJob : "principal"
    BackgroundJob ||--o{ NotificationDelivery : "job"
    Membership ||--o{ NotificationDelivery : "recipient"
    Membership |o--o{ AuditEvent : "actor"
    JurisdictionPack ||--o{ RuleProposal : "pack"
    Membership |o--o{ RuleProposal : "legalReviewer"
    Membership |o--o{ RuleProposal : "engineeringReviewer"
    Placement ||--o{ PlacementTransition : "placement"
    Membership ||--o{ PlacementTransition : "actor"
    ReportSnapshot ||--o{ ReportMetricBinding : "snapshot"
    MetricDefinition ||--o{ ReportMetricBinding : "metric"
    ReportSnapshot ||--o{ ReportResultRow : "snapshot"
    Person ||--o{ PersonMembershipLink : "person"
    Membership ||--o{ PersonMembershipLink : "membership"
    Membership ||--o{ PersonMembershipLink : "verifiedBy"
    Contact ||--o{ ContactMembershipLink : "contact"
    Membership ||--o{ ContactMembershipLink : "membership"
    Membership ||--o{ ContactMembershipLink : "verifiedBy"
    Employment ||--o{ EmploymentLifecycleEvent : "employment"
    Membership ||--o{ EmploymentLifecycleEvent : "actor"
    Employment ||--o{ OrganizationAssignment : "employment"
    Team |o--o{ OrganizationAssignment : "team"
    Position |o--o{ OrganizationAssignment : "position"
    Employment |o--o{ OrganizationAssignment : "manager"
```

## ERD-002 — Domain reading guide

- **Tenancy:** LegalEntity, Team.
- **Global configuration:** WorkCalendar, CalendarVersion, CalendarDay.
- **Compliance:** JurisdictionPack, RuleVersion, ApplicabilityAssignment, RuleProposal.
- **Privacy:** RetentionPolicy, LegalHold, HeldRecord, PrivacyRequest, DeletionTombstone.
- **Identity:** Principal, Membership, Session, Invitation, PersonMembershipLink, ContactMembershipLink.
- **Access:** Role, RolePermission, RoleGrant, OperatorAccessGrant.
- **CRM:** ClientAccount, Contact, Lead, Activity.
- **Agency:** Candidate, Placement, PlacementDateRevision, Milestone, PlacementTask, PlacementException, ParticipantGrant, SharedField, ReadinessDecision, PlacementTransition.
- **Workflow:** WorkflowTemplate, TemplateVersion, TaskDefinition.
- **HR:** Person, PersonIdentifier, Employee, Position, Employment, EmploymentTerm, EmploymentContract, CandidateConversion, EmploymentLifecycleEvent, OrganizationAssignment.
- **ATS:** CandidateProfile, Requisition, Application, ApplicationStageEvent, Interview, InterviewFeedback, Offer, CareerPosting.
- **HR lifecycle:** LifecycleCase, LifecycleTask.
- **Leave:** LeavePolicyVersion, LeaveAccount, LeaveRequest, LeaveLedgerEntry.
- **Workforce:** TimeEntry, TimeApproval, TimeApprovalItem, Shift, ShiftAssignment, ShiftSwap, WorkAssignment, ClientTimeApproval.
- **Payroll:** PayPeriod, PayrollInputBatch, PayrollInput, PayrollException, PayrollProviderExport, PayRun, PayRunWorker, PayCalculationLine, Payslip, FinalSettlement, PaymentEvidence.
- **Compensation:** CompensationCycle, CompensationProposal.
- **Benefits:** BenefitPlan, BenefitPlanVersion, BenefitEnrollment.
- **Performance:** ReviewCycle, Goal, ReviewSubmission, CalibrationDecision.
- **Learning:** LearningCourse, CourseVersion, LearningAssignment.
- **Talent:** Skill, SkillEvidence, SuccessionPlan, SuccessionCandidate.
- **Documents:** Document, EmploymentDocument, CandidateDocument.
- **Assets:** Asset, AssetAssignment.
- **Expenses:** ExpenseClaim, ExpenseLine, ReimbursementEvidence.
- **Employee experience:** EmployeeCase, EmployeeCaseAccess, Announcement, Acknowledgment, Survey, SurveyResponse.
- **Sales:** Opportunity, SalesStageEvent, CommercialContract, ContractVersion, Quote, CommercialOrder.
- **Customer success:** SuccessPlan, SuccessMilestone, HealthModelVersion, HealthFactor, HealthSnapshot, HealthFactorResult, Renewal.
- **Support:** SupportQueue, SlaPolicyVersion, SupportTicket, TicketReply, SlaClockEvent, KnowledgeArticle, CsatInvitation, CsatResponse.
- **Approvals:** ApprovalRequest, ApprovalStep.
- **Automation:** AutomationRuleVersion, AutomationRun.
- **Commercial:** Subscription, ModuleActivation, EntitlementGrant, UsageCounter, UsageReservation, UsageEvent.
- **Analytics:** MetricDefinition, SavedView, ReportSnapshot, ExportArtifact, DownloadGrant, ReportSchedule, ReportRecipient, ReportMetricBinding, ReportResultRow.
- **Integrations:** Connector, ExternalMapping, ImportBatch, ImportError.
- **Reliability:** IdempotencyRecord, OutboxEvent, InboxEvent, BackgroundJob.
- **Notifications:** NotificationDelivery.
- **Audit:** AuditEvent.

History paths: Candidate→Application→stage events/Offer; Candidate→explicit CandidateConversion→Person→Employee→Employment→EmploymentTerm; PayPeriod→InputBatch→PayRun→PayRunWorker→CalculationLine; requests→typed ApprovalRequest→ApprovalStep; record operation→audit/outbox→durable Job/Inbox. Candidate, client contact and employee identities do not merge automatically. The cross-domain keys are enforced in PostgreSQL, while module application ports remain the only business write boundary.

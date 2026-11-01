-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "tenant" (
    "registration_hash" CHAR(64),
    "registration_payload_hash" CHAR(64),
    "data_revision" INTEGER NOT NULL DEFAULT 1,
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "residency_cell" VARCHAR(80) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "entitlement_revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entity" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "authority_code" VARCHAR(80) NOT NULL,
    "time_zone" VARCHAR(80) NOT NULL,
    "default_currency" CHAR(3) NOT NULL,

    CONSTRAINT "legal_entity_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "entity_id" UUID NOT NULL,
    "parent_id" UUID,

    CONSTRAINT "team_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "retention_policy" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "record_class" VARCHAR(80) NOT NULL,
    "trigger_code" VARCHAR(40) NOT NULL,
    "retention_days" INTEGER NOT NULL,
    "policy_version" INTEGER NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authority_reference" VARCHAR(500) NOT NULL,
    "entity_id" UUID,
    "reviewer_id" UUID NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),

    CONSTRAINT "retention_policy_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "legal_hold" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "reason_code" VARCHAR(60) NOT NULL,
    "authority_reference" VARCHAR(500) NOT NULL,
    "review_due_at" TIMESTAMPTZ(6) NOT NULL,
    "released_at" TIMESTAMPTZ(6),
    "owner_id" UUID NOT NULL,

    CONSTRAINT "legal_hold_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "held_record" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "record_type" VARCHAR(100) NOT NULL,
    "record_id" UUID NOT NULL,
    "hold_id" UUID NOT NULL,

    CONSTRAINT "held_record_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "privacy_request" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "request_type" VARCHAR(30) NOT NULL,
    "subject_reference_hash" CHAR(64) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "owner_id" UUID NOT NULL,

    CONSTRAINT "privacy_request_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "deletion_tombstone" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "record_type" VARCHAR(100) NOT NULL,
    "record_id" UUID NOT NULL,
    "deleted_at_event" TIMESTAMPTZ(6) NOT NULL,
    "reason_code" VARCHAR(60) NOT NULL,

    CONSTRAINT "deletion_tombstone_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "principal" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "issuer" VARCHAR(240) NOT NULL,
    "subject" VARCHAR(240) NOT NULL,
    "state" VARCHAR(30) NOT NULL,

    CONSTRAINT "principal_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "membership" (
    "is_external" BOOLEAN NOT NULL DEFAULT false,
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "status" VARCHAR(30) NOT NULL,
    "membership_revision" INTEGER NOT NULL DEFAULT 1,
    "display_name" VARCHAR(200) NOT NULL,
    "work_email" VARCHAR(320) NOT NULL,
    "principal_id" UUID NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "role_key" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "bundle_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "role_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "permission_key" VARCHAR(120) NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "role_grant" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "scope_type" VARCHAR(30) NOT NULL,
    "valid_from" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "membership_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "entity_id" UUID,
    "team_id" UUID,
    "client_id" UUID,
    "placement_id" UUID,

    CONSTRAINT "role_grant_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "idle_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "last_mfa_at" TIMESTAMPTZ(6),
    "membership_revision" INTEGER NOT NULL,
    "membership_id" UUID NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "recipient_ciphertext" VARCHAR(1200) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "task_ids" JSONB NOT NULL,
    "shared_fields" JSONB NOT NULL,
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "token_hash" CHAR(64) NOT NULL,
    "email_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "scope_type" VARCHAR(30) NOT NULL,
    "role_id" UUID NOT NULL,
    "inviter_id" UUID NOT NULL,
    "placement_id" UUID,
    "contact_id" UUID,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "client_account" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "account_code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "entity_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "client_account_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "display_name" VARCHAR(200) NOT NULL,
    "work_email" VARCHAR(320),
    "work_phone" VARCHAR(40),
    "client_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "candidate" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "source_profile" VARCHAR(80) NOT NULL,
    "source_key" VARCHAR(160) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "work_email" VARCHAR(320),
    "owner_id" UUID NOT NULL,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "workflow_template" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "template_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "module_key" VARCHAR(80) NOT NULL,

    CONSTRAINT "workflow_template_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "template_version" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "revision" INTEGER NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "published_at" TIMESTAMPTZ(6),
    "template_id" UUID NOT NULL,
    "publisher_id" UUID,

    CONSTRAINT "template_version_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "task_definition" (
    "due_time" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "task_key" VARCHAR(80) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "milestone_key" VARCHAR(80) NOT NULL,
    "required" BOOLEAN NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "due_offset_days" INTEGER NOT NULL,
    "template_version_id" UUID NOT NULL,

    CONSTRAINT "task_definition_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "placement" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "status" VARCHAR(30) NOT NULL DEFAULT 'accepted',
    "accepted_on" DATE NOT NULL,
    "original_planned_start" DATE NOT NULL,
    "current_planned_start" DATE NOT NULL,
    "actual_start" DATE,
    "time_zone" VARCHAR(80) NOT NULL,
    "source_profile" VARCHAR(80) NOT NULL,
    "source_key" VARCHAR(160) NOT NULL,
    "entity_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "template_version_id" UUID NOT NULL,

    CONSTRAINT "placement_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "placement_date_revision" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "previous_date" DATE NOT NULL,
    "new_date" DATE NOT NULL,
    "reason_code" VARCHAR(60) NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL,
    "placement_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,

    CONSTRAINT "placement_date_revision_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "milestone" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "milestone_key" VARCHAR(80) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "placement_id" UUID NOT NULL,

    CONSTRAINT "milestone_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "placement_task" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "label" VARCHAR(200) NOT NULL,
    "required" BOOLEAN NOT NULL,
    "state" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "waiver_reason" VARCHAR(300),
    "placement_id" UUID NOT NULL,
    "milestone_id" UUID NOT NULL,
    "definition_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "completed_by_id" UUID,
    "completion_evidence_reference" VARCHAR(500),

    CONSTRAINT "placement_task_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "placement_exception" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "category" VARCHAR(60) NOT NULL,
    "state" VARCHAR(30) NOT NULL DEFAULT 'open',
    "opened_at" TIMESTAMPTZ(6) NOT NULL,
    "closed_at" TIMESTAMPTZ(6),
    "resolution_code" VARCHAR(60),
    "placement_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "placement_exception_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "participant_grant" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "can_complete_assigned_tasks" BOOLEAN NOT NULL DEFAULT false,
    "placement_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "granted_by_id" UUID NOT NULL,

    CONSTRAINT "participant_grant_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "shared_field" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "field_key" VARCHAR(100) NOT NULL,
    "grant_id" UUID NOT NULL,

    CONSTRAINT "shared_field_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "readiness_decision" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "decision" VARCHAR(30) NOT NULL,
    "reason_code" VARCHAR(60) NOT NULL,
    "placement_version" INTEGER NOT NULL,
    "decided_at" TIMESTAMPTZ(6) NOT NULL,
    "placement_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,

    CONSTRAINT "readiness_decision_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "plan_key" VARCHAR(80) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "effective_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "trial_ends_at" TIMESTAMPTZ(6),
    "order_reference" VARCHAR(160) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "module_activation" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "module_key" VARCHAR(80) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "entitlement_revision" INTEGER NOT NULL,
    "ever_activated" BOOLEAN NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "module_activation_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "entitlement_grant" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "grant_key" VARCHAR(160) NOT NULL,
    "grant_type" VARCHAR(30) NOT NULL,
    "limit_value" BIGINT,
    "source_code" VARCHAR(60) NOT NULL,
    "effective_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "subscription_id" UUID NOT NULL,
    "approver_id" UUID,

    CONSTRAINT "entitlement_grant_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "usage_counter" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "resource_key" VARCHAR(80) NOT NULL,
    "period_key" VARCHAR(60) NOT NULL,
    "used" BIGINT NOT NULL DEFAULT 0,
    "reserved" BIGINT NOT NULL DEFAULT 0,
    "hard_limit" BIGINT NOT NULL,

    CONSTRAINT "usage_counter_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "usage_reservation" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "operation_key" VARCHAR(160) NOT NULL,
    "quantity" BIGINT NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "counter_id" UUID NOT NULL,

    CONSTRAINT "usage_reservation_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "usage_event" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "operation_key" VARCHAR(160) NOT NULL,
    "quantity" BIGINT NOT NULL,
    "event_type" VARCHAR(30) NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "counter_id" UUID NOT NULL,

    CONSTRAINT "usage_event_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "metric_definition" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "metric_key" VARCHAR(80) NOT NULL,
    "revision" INTEGER NOT NULL,
    "source_module" VARCHAR(80) NOT NULL,
    "definition_hash" CHAR(64) NOT NULL,
    "state" VARCHAR(30) NOT NULL,

    CONSTRAINT "metric_definition_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "saved_view" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR(160) NOT NULL,
    "visibility" VARCHAR(30) NOT NULL,
    "filter_schema" JSONB NOT NULL,
    "time_zone" VARCHAR(80) NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "owner_id" UUID NOT NULL,
    "team_id" UUID,

    CONSTRAINT "saved_view_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "report_snapshot" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "as_of" TIMESTAMPTZ(6) NOT NULL,
    "source_watermark" TIMESTAMPTZ(6) NOT NULL,
    "scope_hash" CHAR(64) NOT NULL,
    "entitlement_revision" INTEGER NOT NULL,
    "metric_versions" JSONB NOT NULL,
    "filter_schema" JSONB NOT NULL,
    "time_zone" VARCHAR(80) NOT NULL,
    "currency_policy" VARCHAR(80) NOT NULL,
    "snapshot_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "requester_id" UUID NOT NULL,

    CONSTRAINT "report_snapshot_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "export_artifact" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "format" VARCHAR(10) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "object_version" VARCHAR(200) NOT NULL,
    "content_hash" CHAR(64) NOT NULL,
    "row_count" INTEGER NOT NULL,
    "classification" VARCHAR(2) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "export_artifact_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "download_grant" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "scope_hash" CHAR(64) NOT NULL,
    "artifact_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,

    CONSTRAINT "download_grant_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "import_batch" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "source_profile" VARCHAR(80) NOT NULL,
    "source_hash" CHAR(64) NOT NULL,
    "idempotency_key" VARCHAR(160) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "row_count" INTEGER NOT NULL,
    "error_count" INTEGER NOT NULL,
    "staging_object_key" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "requester_id" UUID NOT NULL,

    CONSTRAINT "import_batch_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "import_error" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "row_number" INTEGER NOT NULL,
    "column_key" VARCHAR(100) NOT NULL,
    "error_code" VARCHAR(80) NOT NULL,
    "batch_id" UUID NOT NULL,

    CONSTRAINT "import_error_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "idempotency_record" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "operation_type" VARCHAR(100) NOT NULL,
    "idempotency_key" VARCHAR(160) NOT NULL,
    "payload_hash" CHAR(64) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "resource_type" VARCHAR(80),
    "resource_id" UUID,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "actor_id" UUID NOT NULL,

    CONSTRAINT "idempotency_record_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "outbox_event" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "event_type" VARCHAR(100) NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "aggregate_type" VARCHAR(80) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "aggregate_version" INTEGER NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "correlation_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "dispatched_at" TIMESTAMPTZ(6),

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inbox_event" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "consumer_key" VARCHAR(100) NOT NULL,
    "external_event_key" VARCHAR(200) NOT NULL,
    "payload_hash" CHAR(64) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inbox_event_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "background_job" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "operation_key" VARCHAR(160) NOT NULL,
    "job_type" VARCHAR(100) NOT NULL,
    "module_key" VARCHAR(80) NOT NULL,
    "resource_type" VARCHAR(80) NOT NULL,
    "resource_id" UUID NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMPTZ(6) NOT NULL,
    "lease_expires_at" TIMESTAMPTZ(6),
    "last_error_code" VARCHAR(80),
    "principal_id" UUID NOT NULL,

    CONSTRAINT "background_job_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "notification_delivery" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "operation_key" VARCHAR(160) NOT NULL,
    "channel" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "provider_reference" VARCHAR(200),
    "attempted_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "job_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,

    CONSTRAINT "notification_delivery_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" UUID,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "correlation_id" UUID NOT NULL,
    "membership_revision" INTEGER NOT NULL,
    "entitlement_revision" INTEGER NOT NULL,
    "reason_code" VARCHAR(80),
    "redacted_changes" JSONB NOT NULL,
    "actor_id" UUID,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "placement_transition" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "from_status" VARCHAR(30) NOT NULL,
    "to_status" VARCHAR(30) NOT NULL,
    "from_version" INTEGER NOT NULL,
    "to_version" INTEGER NOT NULL,
    "actual_start" DATE,
    "previous_actual_start" DATE,
    "reason_code" VARCHAR(80) NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "placement_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,

    CONSTRAINT "placement_transition_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "report_metric_binding" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "definition_hash" CHAR(64) NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "metric_id" UUID NOT NULL,

    CONSTRAINT "report_metric_binding_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "report_result_row" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "row_key" VARCHAR(160) NOT NULL,
    "source_type" VARCHAR(100) NOT NULL,
    "source_id" UUID,
    "source_version" INTEGER,
    "projection" JSONB NOT NULL,
    "classification" VARCHAR(2) NOT NULL,
    "snapshot_id" UUID NOT NULL,

    CONSTRAINT "report_result_row_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "contact_membership_link" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "verified_at" TIMESTAMPTZ(6) NOT NULL,
    "contact_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "verified_by_id" UUID NOT NULL,

    CONSTRAINT "contact_membership_link_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "report_run" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "state" VARCHAR(30) NOT NULL,
    "filter_schema" JSONB NOT NULL,
    "result" JSONB,
    "error_code" VARCHAR(80),
    "requester_id" UUID NOT NULL,
    "snapshot_id" UUID,

    CONSTRAINT "report_run_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "invitation_delivery" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "invitation_id" UUID NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "provider_reference" VARCHAR(200),
    "attempted_at" TIMESTAMPTZ(6),

    CONSTRAINT "invitation_delivery_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "commercial_change_request" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "plan_key" VARCHAR(80) NOT NULL,
    "request_type" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "reason" VARCHAR(300) NOT NULL,
    "order_reference" VARCHAR(160),
    "requester_id" UUID NOT NULL,

    CONSTRAINT "commercial_change_request_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registration_hash_key" ON "tenant"("registration_hash");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "legal_entity_tenant_id_created_at_id_idx" ON "legal_entity"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entity_tenant_id_code_key" ON "legal_entity"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "team_tenant_id_created_at_id_idx" ON "team"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "team_tenant_id_entity_id_idx" ON "team"("tenant_id", "entity_id");

-- CreateIndex
CREATE INDEX "team_tenant_id_parent_id_idx" ON "team"("tenant_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_tenant_id_code_key" ON "team"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "retention_policy_tenant_id_created_at_id_idx" ON "retention_policy"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "retention_policy_tenant_id_entity_id_idx" ON "retention_policy"("tenant_id", "entity_id");

-- CreateIndex
CREATE INDEX "retention_policy_tenant_id_reviewer_id_idx" ON "retention_policy"("tenant_id", "reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "retention_policy_tenant_id_record_class_policy_version_key" ON "retention_policy"("tenant_id", "record_class", "policy_version");

-- CreateIndex
CREATE INDEX "legal_hold_tenant_id_created_at_id_idx" ON "legal_hold"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "legal_hold_tenant_id_owner_id_idx" ON "legal_hold"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "held_record_tenant_id_created_at_id_idx" ON "held_record"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "held_record_tenant_id_hold_id_idx" ON "held_record"("tenant_id", "hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "held_record_tenant_id_hold_id_record_type_record_id_key" ON "held_record"("tenant_id", "hold_id", "record_type", "record_id");

-- CreateIndex
CREATE INDEX "privacy_request_tenant_id_created_at_id_idx" ON "privacy_request"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "privacy_request_tenant_id_owner_id_idx" ON "privacy_request"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "deletion_tombstone_tenant_id_created_at_id_idx" ON "deletion_tombstone"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "deletion_tombstone_tenant_id_record_type_record_id_key" ON "deletion_tombstone"("tenant_id", "record_type", "record_id");

-- CreateIndex
CREATE INDEX "principal_tenant_id_created_at_id_idx" ON "principal"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "principal_tenant_id_issuer_subject_key" ON "principal"("tenant_id", "issuer", "subject");

-- CreateIndex
CREATE INDEX "membership_tenant_id_created_at_id_idx" ON "membership"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "membership_tenant_id_principal_id_idx" ON "membership"("tenant_id", "principal_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_tenant_id_principal_id_key" ON "membership"("tenant_id", "principal_id");

-- CreateIndex
CREATE INDEX "role_tenant_id_created_at_id_idx" ON "role"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "role_tenant_id_role_key_key" ON "role"("tenant_id", "role_key");

-- CreateIndex
CREATE INDEX "role_permission_tenant_id_created_at_id_idx" ON "role_permission"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "role_permission_tenant_id_role_id_idx" ON "role_permission"("tenant_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_tenant_id_role_id_permission_key_key" ON "role_permission"("tenant_id", "role_id", "permission_key");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_created_at_id_idx" ON "role_grant"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_membership_id_idx" ON "role_grant"("tenant_id", "membership_id");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_role_id_idx" ON "role_grant"("tenant_id", "role_id");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_entity_id_idx" ON "role_grant"("tenant_id", "entity_id");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_team_id_idx" ON "role_grant"("tenant_id", "team_id");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_client_id_idx" ON "role_grant"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "role_grant_tenant_id_placement_id_idx" ON "role_grant"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "session_tenant_id_created_at_id_idx" ON "session"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "session_tenant_id_membership_id_idx" ON "session"("tenant_id", "membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_tenant_id_token_hash_key" ON "session"("tenant_id", "token_hash");

-- CreateIndex
CREATE INDEX "invitation_tenant_id_created_at_id_idx" ON "invitation"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "invitation_tenant_id_role_id_idx" ON "invitation"("tenant_id", "role_id");

-- CreateIndex
CREATE INDEX "invitation_tenant_id_inviter_id_idx" ON "invitation"("tenant_id", "inviter_id");

-- CreateIndex
CREATE INDEX "invitation_tenant_id_placement_id_idx" ON "invitation"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "invitation_tenant_id_contact_id_idx" ON "invitation"("tenant_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tenant_id_token_hash_key" ON "invitation"("tenant_id", "token_hash");

-- CreateIndex
CREATE INDEX "client_account_tenant_id_created_at_id_idx" ON "client_account"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "client_account_tenant_id_entity_id_idx" ON "client_account"("tenant_id", "entity_id");

-- CreateIndex
CREATE INDEX "client_account_tenant_id_owner_id_idx" ON "client_account"("tenant_id", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_account_tenant_id_account_code_key" ON "client_account"("tenant_id", "account_code");

-- CreateIndex
CREATE INDEX "contact_tenant_id_created_at_id_idx" ON "contact"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "contact_tenant_id_client_id_idx" ON "contact"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "contact_tenant_id_owner_id_idx" ON "contact"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "candidate_tenant_id_created_at_id_idx" ON "candidate"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "candidate_tenant_id_owner_id_idx" ON "candidate"("tenant_id", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_tenant_id_source_profile_source_key_key" ON "candidate"("tenant_id", "source_profile", "source_key");

-- CreateIndex
CREATE INDEX "workflow_template_tenant_id_created_at_id_idx" ON "workflow_template"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_template_tenant_id_template_key_key" ON "workflow_template"("tenant_id", "template_key");

-- CreateIndex
CREATE INDEX "template_version_tenant_id_created_at_id_idx" ON "template_version"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "template_version_tenant_id_template_id_idx" ON "template_version"("tenant_id", "template_id");

-- CreateIndex
CREATE INDEX "template_version_tenant_id_publisher_id_idx" ON "template_version"("tenant_id", "publisher_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_version_tenant_id_template_id_revision_key" ON "template_version"("tenant_id", "template_id", "revision");

-- CreateIndex
CREATE INDEX "task_definition_tenant_id_created_at_id_idx" ON "task_definition"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "task_definition_tenant_id_template_version_id_idx" ON "task_definition"("tenant_id", "template_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_definition_tenant_id_template_version_id_task_key_key" ON "task_definition"("tenant_id", "template_version_id", "task_key");

-- CreateIndex
CREATE INDEX "placement_tenant_id_created_at_id_idx" ON "placement"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_entity_id_status_current_planned_start__idx" ON "placement"("tenant_id", "entity_id", "status", "current_planned_start", "id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_owner_id_status_id_idx" ON "placement"("tenant_id", "owner_id", "status", "id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_client_id_status_id_idx" ON "placement"("tenant_id", "client_id", "status", "id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_entity_id_idx" ON "placement"("tenant_id", "entity_id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_client_id_idx" ON "placement"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_candidate_id_idx" ON "placement"("tenant_id", "candidate_id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_owner_id_idx" ON "placement"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "placement_tenant_id_template_version_id_idx" ON "placement"("tenant_id", "template_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_tenant_id_source_profile_source_key_key" ON "placement"("tenant_id", "source_profile", "source_key");

-- CreateIndex
CREATE INDEX "placement_date_revision_tenant_id_created_at_id_idx" ON "placement_date_revision"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "placement_date_revision_tenant_id_placement_id_idx" ON "placement_date_revision"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "placement_date_revision_tenant_id_actor_id_idx" ON "placement_date_revision"("tenant_id", "actor_id");

-- CreateIndex
CREATE INDEX "milestone_tenant_id_created_at_id_idx" ON "milestone"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "milestone_tenant_id_placement_id_idx" ON "milestone"("tenant_id", "placement_id");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_tenant_id_placement_id_milestone_key_key" ON "milestone"("tenant_id", "placement_id", "milestone_key");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_created_at_id_idx" ON "placement_task"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_owner_id_state_due_at_id_idx" ON "placement_task"("tenant_id", "owner_id", "state", "due_at", "id");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_placement_id_idx" ON "placement_task"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_milestone_id_idx" ON "placement_task"("tenant_id", "milestone_id");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_definition_id_idx" ON "placement_task"("tenant_id", "definition_id");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_owner_id_idx" ON "placement_task"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "placement_task_tenant_id_completed_by_id_idx" ON "placement_task"("tenant_id", "completed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_task_tenant_id_placement_id_definition_id_key" ON "placement_task"("tenant_id", "placement_id", "definition_id");

-- CreateIndex
CREATE INDEX "placement_exception_tenant_id_created_at_id_idx" ON "placement_exception"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "placement_exception_tenant_id_placement_id_idx" ON "placement_exception"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "placement_exception_tenant_id_owner_id_idx" ON "placement_exception"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "participant_grant_tenant_id_created_at_id_idx" ON "participant_grant"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "participant_grant_tenant_id_placement_id_idx" ON "participant_grant"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "participant_grant_tenant_id_contact_id_idx" ON "participant_grant"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "participant_grant_tenant_id_membership_id_idx" ON "participant_grant"("tenant_id", "membership_id");

-- CreateIndex
CREATE INDEX "participant_grant_tenant_id_granted_by_id_idx" ON "participant_grant"("tenant_id", "granted_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "participant_grant_tenant_id_placement_id_membership_id_key" ON "participant_grant"("tenant_id", "placement_id", "membership_id");

-- CreateIndex
CREATE INDEX "shared_field_tenant_id_created_at_id_idx" ON "shared_field"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "shared_field_tenant_id_grant_id_idx" ON "shared_field"("tenant_id", "grant_id");

-- CreateIndex
CREATE UNIQUE INDEX "shared_field_tenant_id_grant_id_field_key_key" ON "shared_field"("tenant_id", "grant_id", "field_key");

-- CreateIndex
CREATE INDEX "readiness_decision_tenant_id_created_at_id_idx" ON "readiness_decision"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "readiness_decision_tenant_id_placement_id_idx" ON "readiness_decision"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "readiness_decision_tenant_id_actor_id_idx" ON "readiness_decision"("tenant_id", "actor_id");

-- CreateIndex
CREATE INDEX "subscription_tenant_id_created_at_id_idx" ON "subscription"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "module_activation_tenant_id_created_at_id_idx" ON "module_activation"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "module_activation_tenant_id_module_key_key" ON "module_activation"("tenant_id", "module_key");

-- CreateIndex
CREATE INDEX "entitlement_grant_tenant_id_created_at_id_idx" ON "entitlement_grant"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "entitlement_grant_tenant_id_subscription_id_idx" ON "entitlement_grant"("tenant_id", "subscription_id");

-- CreateIndex
CREATE INDEX "entitlement_grant_tenant_id_approver_id_idx" ON "entitlement_grant"("tenant_id", "approver_id");

-- CreateIndex
CREATE INDEX "usage_counter_tenant_id_created_at_id_idx" ON "usage_counter"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counter_tenant_id_resource_key_period_key_key" ON "usage_counter"("tenant_id", "resource_key", "period_key");

-- CreateIndex
CREATE INDEX "usage_reservation_tenant_id_created_at_id_idx" ON "usage_reservation"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "usage_reservation_tenant_id_counter_id_idx" ON "usage_reservation"("tenant_id", "counter_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_reservation_tenant_id_counter_id_operation_key_key" ON "usage_reservation"("tenant_id", "counter_id", "operation_key");

-- CreateIndex
CREATE INDEX "usage_event_tenant_id_created_at_id_idx" ON "usage_event"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "usage_event_tenant_id_counter_id_idx" ON "usage_event"("tenant_id", "counter_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_event_tenant_id_counter_id_operation_key_event_type_key" ON "usage_event"("tenant_id", "counter_id", "operation_key", "event_type");

-- CreateIndex
CREATE INDEX "metric_definition_tenant_id_created_at_id_idx" ON "metric_definition"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "metric_definition_tenant_id_metric_key_revision_key" ON "metric_definition"("tenant_id", "metric_key", "revision");

-- CreateIndex
CREATE INDEX "saved_view_tenant_id_created_at_id_idx" ON "saved_view"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "saved_view_tenant_id_owner_id_idx" ON "saved_view"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "saved_view_tenant_id_team_id_idx" ON "saved_view"("tenant_id", "team_id");

-- CreateIndex
CREATE INDEX "report_snapshot_tenant_id_created_at_id_idx" ON "report_snapshot"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "report_snapshot_tenant_id_requester_id_idx" ON "report_snapshot"("tenant_id", "requester_id");

-- CreateIndex
CREATE INDEX "export_artifact_tenant_id_created_at_id_idx" ON "export_artifact"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "export_artifact_tenant_id_snapshot_id_idx" ON "export_artifact"("tenant_id", "snapshot_id");

-- CreateIndex
CREATE INDEX "export_artifact_tenant_id_owner_id_idx" ON "export_artifact"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "download_grant_tenant_id_created_at_id_idx" ON "download_grant"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "download_grant_tenant_id_artifact_id_idx" ON "download_grant"("tenant_id", "artifact_id");

-- CreateIndex
CREATE INDEX "download_grant_tenant_id_membership_id_idx" ON "download_grant"("tenant_id", "membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "download_grant_tenant_id_token_hash_key" ON "download_grant"("tenant_id", "token_hash");

-- CreateIndex
CREATE INDEX "import_batch_tenant_id_created_at_id_idx" ON "import_batch"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "import_batch_tenant_id_requester_id_idx" ON "import_batch"("tenant_id", "requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "import_batch_tenant_id_idempotency_key_key" ON "import_batch"("tenant_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "import_error_tenant_id_created_at_id_idx" ON "import_error"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "import_error_tenant_id_batch_id_idx" ON "import_error"("tenant_id", "batch_id");

-- CreateIndex
CREATE INDEX "idempotency_record_tenant_id_created_at_id_idx" ON "idempotency_record"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "idempotency_record_tenant_id_actor_id_idx" ON "idempotency_record"("tenant_id", "actor_id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_record_tenant_id_actor_id_operation_type_idempo_key" ON "idempotency_record"("tenant_id", "actor_id", "operation_type", "idempotency_key");

-- CreateIndex
CREATE INDEX "outbox_event_tenant_id_created_at_id_idx" ON "outbox_event"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "outbox_event_tenant_id_dispatched_at_created_at_id_idx" ON "outbox_event"("tenant_id", "dispatched_at", "created_at", "id");

-- CreateIndex
CREATE INDEX "inbox_event_tenant_id_created_at_id_idx" ON "inbox_event"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_event_tenant_id_consumer_key_external_event_key_key" ON "inbox_event"("tenant_id", "consumer_key", "external_event_key");

-- CreateIndex
CREATE INDEX "background_job_tenant_id_created_at_id_idx" ON "background_job"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "background_job_tenant_id_state_available_at_id_idx" ON "background_job"("tenant_id", "state", "available_at", "id");

-- CreateIndex
CREATE INDEX "background_job_tenant_id_principal_id_idx" ON "background_job"("tenant_id", "principal_id");

-- CreateIndex
CREATE UNIQUE INDEX "background_job_tenant_id_operation_key_key" ON "background_job"("tenant_id", "operation_key");

-- CreateIndex
CREATE INDEX "notification_delivery_tenant_id_created_at_id_idx" ON "notification_delivery"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "notification_delivery_tenant_id_job_id_idx" ON "notification_delivery"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "notification_delivery_tenant_id_recipient_id_idx" ON "notification_delivery"("tenant_id", "recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_delivery_tenant_id_operation_key_key" ON "notification_delivery"("tenant_id", "operation_key");

-- CreateIndex
CREATE INDEX "audit_event_tenant_id_created_at_id_idx" ON "audit_event"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "audit_event_tenant_id_occurred_at_id_idx" ON "audit_event"("tenant_id", "occurred_at", "id");

-- CreateIndex
CREATE INDEX "audit_event_tenant_id_resource_type_resource_id_occurred_at_idx" ON "audit_event"("tenant_id", "resource_type", "resource_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_event_tenant_id_actor_id_idx" ON "audit_event"("tenant_id", "actor_id");

-- CreateIndex
CREATE INDEX "placement_transition_tenant_id_created_at_id_idx" ON "placement_transition"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "placement_transition_tenant_id_placement_id_idx" ON "placement_transition"("tenant_id", "placement_id");

-- CreateIndex
CREATE INDEX "placement_transition_tenant_id_actor_id_idx" ON "placement_transition"("tenant_id", "actor_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_transition_tenant_id_placement_id_to_version_key" ON "placement_transition"("tenant_id", "placement_id", "to_version");

-- CreateIndex
CREATE INDEX "report_metric_binding_tenant_id_created_at_id_idx" ON "report_metric_binding"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "report_metric_binding_tenant_id_snapshot_id_idx" ON "report_metric_binding"("tenant_id", "snapshot_id");

-- CreateIndex
CREATE INDEX "report_metric_binding_tenant_id_metric_id_idx" ON "report_metric_binding"("tenant_id", "metric_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_metric_binding_tenant_id_snapshot_id_metric_id_key" ON "report_metric_binding"("tenant_id", "snapshot_id", "metric_id");

-- CreateIndex
CREATE INDEX "report_result_row_tenant_id_created_at_id_idx" ON "report_result_row"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "report_result_row_tenant_id_snapshot_id_idx" ON "report_result_row"("tenant_id", "snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_result_row_tenant_id_snapshot_id_row_key_key" ON "report_result_row"("tenant_id", "snapshot_id", "row_key");

-- CreateIndex
CREATE INDEX "contact_membership_link_tenant_id_created_at_id_idx" ON "contact_membership_link"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "contact_membership_link_tenant_id_contact_id_idx" ON "contact_membership_link"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "contact_membership_link_tenant_id_membership_id_idx" ON "contact_membership_link"("tenant_id", "membership_id");

-- CreateIndex
CREATE INDEX "contact_membership_link_tenant_id_verified_by_id_idx" ON "contact_membership_link"("tenant_id", "verified_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_membership_link_tenant_id_contact_id_membership_id_key" ON "contact_membership_link"("tenant_id", "contact_id", "membership_id");

-- CreateIndex
CREATE INDEX "report_run_tenant_id_created_at_id_idx" ON "report_run"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "invitation_delivery_tenant_id_created_at_id_idx" ON "invitation_delivery"("tenant_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_delivery_tenant_id_invitation_id_key" ON "invitation_delivery"("tenant_id", "invitation_id");

-- CreateIndex
CREATE INDEX "commercial_change_request_tenant_id_created_at_id_idx" ON "commercial_change_request"("tenant_id", "created_at", "id");

-- AddForeignKey
ALTER TABLE "legal_entity" ADD CONSTRAINT "legal_entity_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_tenant_id_entity_id_fkey" FOREIGN KEY ("tenant_id", "entity_id") REFERENCES "legal_entity"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_tenant_id_parent_id_fkey" FOREIGN KEY ("tenant_id", "parent_id") REFERENCES "team"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "retention_policy" ADD CONSTRAINT "retention_policy_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "retention_policy" ADD CONSTRAINT "retention_policy_tenant_id_entity_id_fkey" FOREIGN KEY ("tenant_id", "entity_id") REFERENCES "legal_entity"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "retention_policy" ADD CONSTRAINT "retention_policy_tenant_id_reviewer_id_fkey" FOREIGN KEY ("tenant_id", "reviewer_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "legal_hold" ADD CONSTRAINT "legal_hold_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "legal_hold" ADD CONSTRAINT "legal_hold_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "held_record" ADD CONSTRAINT "held_record_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "held_record" ADD CONSTRAINT "held_record_tenant_id_hold_id_fkey" FOREIGN KEY ("tenant_id", "hold_id") REFERENCES "legal_hold"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "privacy_request" ADD CONSTRAINT "privacy_request_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "privacy_request" ADD CONSTRAINT "privacy_request_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "deletion_tombstone" ADD CONSTRAINT "deletion_tombstone_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "principal" ADD CONSTRAINT "principal_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_tenant_id_principal_id_fkey" FOREIGN KEY ("tenant_id", "principal_id") REFERENCES "principal"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_tenant_id_role_id_fkey" FOREIGN KEY ("tenant_id", "role_id") REFERENCES "role"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_role_id_fkey" FOREIGN KEY ("tenant_id", "role_id") REFERENCES "role"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_entity_id_fkey" FOREIGN KEY ("tenant_id", "entity_id") REFERENCES "legal_entity"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_team_id_fkey" FOREIGN KEY ("tenant_id", "team_id") REFERENCES "team"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_client_id_fkey" FOREIGN KEY ("tenant_id", "client_id") REFERENCES "client_account"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_tenant_id_role_id_fkey" FOREIGN KEY ("tenant_id", "role_id") REFERENCES "role"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_tenant_id_inviter_id_fkey" FOREIGN KEY ("tenant_id", "inviter_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_tenant_id_contact_id_fkey" FOREIGN KEY ("tenant_id", "contact_id") REFERENCES "contact"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_tenant_id_entity_id_fkey" FOREIGN KEY ("tenant_id", "entity_id") REFERENCES "legal_entity"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_tenant_id_client_id_fkey" FOREIGN KEY ("tenant_id", "client_id") REFERENCES "client_account"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "workflow_template" ADD CONSTRAINT "workflow_template_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_tenant_id_template_id_fkey" FOREIGN KEY ("tenant_id", "template_id") REFERENCES "workflow_template"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_tenant_id_publisher_id_fkey" FOREIGN KEY ("tenant_id", "publisher_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "task_definition" ADD CONSTRAINT "task_definition_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "task_definition" ADD CONSTRAINT "task_definition_tenant_id_template_version_id_fkey" FOREIGN KEY ("tenant_id", "template_version_id") REFERENCES "template_version"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_tenant_id_entity_id_fkey" FOREIGN KEY ("tenant_id", "entity_id") REFERENCES "legal_entity"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_tenant_id_client_id_fkey" FOREIGN KEY ("tenant_id", "client_id") REFERENCES "client_account"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_tenant_id_candidate_id_fkey" FOREIGN KEY ("tenant_id", "candidate_id") REFERENCES "candidate"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_tenant_id_template_version_id_fkey" FOREIGN KEY ("tenant_id", "template_version_id") REFERENCES "template_version"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_date_revision" ADD CONSTRAINT "placement_date_revision_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_date_revision" ADD CONSTRAINT "placement_date_revision_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_date_revision" ADD CONSTRAINT "placement_date_revision_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_tenant_id_milestone_id_fkey" FOREIGN KEY ("tenant_id", "milestone_id") REFERENCES "milestone"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_tenant_id_definition_id_fkey" FOREIGN KEY ("tenant_id", "definition_id") REFERENCES "task_definition"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_tenant_id_completed_by_id_fkey" FOREIGN KEY ("tenant_id", "completed_by_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_exception" ADD CONSTRAINT "placement_exception_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_exception" ADD CONSTRAINT "placement_exception_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_exception" ADD CONSTRAINT "placement_exception_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "participant_grant" ADD CONSTRAINT "participant_grant_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "participant_grant" ADD CONSTRAINT "participant_grant_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "participant_grant" ADD CONSTRAINT "participant_grant_tenant_id_contact_id_fkey" FOREIGN KEY ("tenant_id", "contact_id") REFERENCES "contact"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "participant_grant" ADD CONSTRAINT "participant_grant_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "participant_grant" ADD CONSTRAINT "participant_grant_tenant_id_granted_by_id_fkey" FOREIGN KEY ("tenant_id", "granted_by_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "shared_field" ADD CONSTRAINT "shared_field_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "shared_field" ADD CONSTRAINT "shared_field_tenant_id_grant_id_fkey" FOREIGN KEY ("tenant_id", "grant_id") REFERENCES "participant_grant"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "readiness_decision" ADD CONSTRAINT "readiness_decision_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "readiness_decision" ADD CONSTRAINT "readiness_decision_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "readiness_decision" ADD CONSTRAINT "readiness_decision_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "module_activation" ADD CONSTRAINT "module_activation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "entitlement_grant" ADD CONSTRAINT "entitlement_grant_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "entitlement_grant" ADD CONSTRAINT "entitlement_grant_tenant_id_subscription_id_fkey" FOREIGN KEY ("tenant_id", "subscription_id") REFERENCES "subscription"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "entitlement_grant" ADD CONSTRAINT "entitlement_grant_tenant_id_approver_id_fkey" FOREIGN KEY ("tenant_id", "approver_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "usage_counter" ADD CONSTRAINT "usage_counter_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "usage_reservation" ADD CONSTRAINT "usage_reservation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "usage_reservation" ADD CONSTRAINT "usage_reservation_tenant_id_counter_id_fkey" FOREIGN KEY ("tenant_id", "counter_id") REFERENCES "usage_counter"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_tenant_id_counter_id_fkey" FOREIGN KEY ("tenant_id", "counter_id") REFERENCES "usage_counter"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "metric_definition" ADD CONSTRAINT "metric_definition_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "saved_view" ADD CONSTRAINT "saved_view_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "saved_view" ADD CONSTRAINT "saved_view_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "saved_view" ADD CONSTRAINT "saved_view_tenant_id_team_id_fkey" FOREIGN KEY ("tenant_id", "team_id") REFERENCES "team"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_snapshot" ADD CONSTRAINT "report_snapshot_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_snapshot" ADD CONSTRAINT "report_snapshot_tenant_id_requester_id_fkey" FOREIGN KEY ("tenant_id", "requester_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "export_artifact" ADD CONSTRAINT "export_artifact_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "export_artifact" ADD CONSTRAINT "export_artifact_tenant_id_snapshot_id_fkey" FOREIGN KEY ("tenant_id", "snapshot_id") REFERENCES "report_snapshot"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "export_artifact" ADD CONSTRAINT "export_artifact_tenant_id_owner_id_fkey" FOREIGN KEY ("tenant_id", "owner_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "download_grant" ADD CONSTRAINT "download_grant_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "download_grant" ADD CONSTRAINT "download_grant_tenant_id_artifact_id_fkey" FOREIGN KEY ("tenant_id", "artifact_id") REFERENCES "export_artifact"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "download_grant" ADD CONSTRAINT "download_grant_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "import_batch" ADD CONSTRAINT "import_batch_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "import_batch" ADD CONSTRAINT "import_batch_tenant_id_requester_id_fkey" FOREIGN KEY ("tenant_id", "requester_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "import_error" ADD CONSTRAINT "import_error_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "import_error" ADD CONSTRAINT "import_error_tenant_id_batch_id_fkey" FOREIGN KEY ("tenant_id", "batch_id") REFERENCES "import_batch"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "idempotency_record" ADD CONSTRAINT "idempotency_record_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "idempotency_record" ADD CONSTRAINT "idempotency_record_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "outbox_event" ADD CONSTRAINT "outbox_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "inbox_event" ADD CONSTRAINT "inbox_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "background_job" ADD CONSTRAINT "background_job_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "background_job" ADD CONSTRAINT "background_job_tenant_id_principal_id_fkey" FOREIGN KEY ("tenant_id", "principal_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_tenant_id_job_id_fkey" FOREIGN KEY ("tenant_id", "job_id") REFERENCES "background_job"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_tenant_id_recipient_id_fkey" FOREIGN KEY ("tenant_id", "recipient_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_transition" ADD CONSTRAINT "placement_transition_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_transition" ADD CONSTRAINT "placement_transition_tenant_id_placement_id_fkey" FOREIGN KEY ("tenant_id", "placement_id") REFERENCES "placement"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "placement_transition" ADD CONSTRAINT "placement_transition_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_metric_binding" ADD CONSTRAINT "report_metric_binding_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_metric_binding" ADD CONSTRAINT "report_metric_binding_tenant_id_snapshot_id_fkey" FOREIGN KEY ("tenant_id", "snapshot_id") REFERENCES "report_snapshot"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_metric_binding" ADD CONSTRAINT "report_metric_binding_tenant_id_metric_id_fkey" FOREIGN KEY ("tenant_id", "metric_id") REFERENCES "metric_definition"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_result_row" ADD CONSTRAINT "report_result_row_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_result_row" ADD CONSTRAINT "report_result_row_tenant_id_snapshot_id_fkey" FOREIGN KEY ("tenant_id", "snapshot_id") REFERENCES "report_snapshot"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact_membership_link" ADD CONSTRAINT "contact_membership_link_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact_membership_link" ADD CONSTRAINT "contact_membership_link_tenant_id_contact_id_fkey" FOREIGN KEY ("tenant_id", "contact_id") REFERENCES "contact"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact_membership_link" ADD CONSTRAINT "contact_membership_link_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contact_membership_link" ADD CONSTRAINT "contact_membership_link_tenant_id_verified_by_id_fkey" FOREIGN KEY ("tenant_id", "verified_by_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_run" ADD CONSTRAINT "report_run_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_run" ADD CONSTRAINT "report_run_tenant_id_requester_id_fkey" FOREIGN KEY ("tenant_id", "requester_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "report_run" ADD CONSTRAINT "report_run_tenant_id_snapshot_id_fkey" FOREIGN KEY ("tenant_id", "snapshot_id") REFERENCES "report_snapshot"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation_delivery" ADD CONSTRAINT "invitation_delivery_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "invitation_delivery" ADD CONSTRAINT "invitation_delivery_tenant_id_invitation_id_fkey" FOREIGN KEY ("tenant_id", "invitation_id") REFERENCES "invitation"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "commercial_change_request" ADD CONSTRAINT "commercial_change_request_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "commercial_change_request" ADD CONSTRAINT "commercial_change_request_tenant_id_requester_id_fkey" FOREIGN KEY ("tenant_id", "requester_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- R1 runtime isolation, immutable history, and control-plane routing.
CREATE SCHEMA IF NOT EXISTS app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
DO $$ BEGIN
 IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='app_runtime') THEN CREATE ROLE app_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF;
 IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='app_retention') THEN CREATE ROLE app_retention NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF;
END $$;
ALTER ROLE app_runtime NOSUPERUSER NOBYPASSRLS;
ALTER ROLE app_retention NOSUPERUSER NOBYPASSRLS;
CREATE OR REPLACE FUNCTION app.tenant_id() RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT NULLIF(current_setting('app.tenant_id', true),'')::uuid $$;
GRANT USAGE ON SCHEMA public, app TO app_runtime, app_retention;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
CREATE OR REPLACE FUNCTION app.guard_record() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN
   IF current_user <> 'app_retention' THEN RAISE EXCEPTION 'physical_delete_requires_retention_role' USING ERRCODE='42501'; END IF;
   RETURN OLD;
 END IF;
 IF NEW.tenant_id <> OLD.tenant_id OR NEW.id <> OLD.id OR NEW.created_at <> OLD.created_at THEN
   RAISE EXCEPTION 'immutable_identity' USING ERRCODE='23514';
 END IF;
 IF TG_ARGV[0]='append' THEN RAISE EXCEPTION 'append_only' USING ERRCODE='23514'; END IF;
 IF TG_ARGV[0]='effective' THEN
   IF OLD.superseded_at IS NOT NULL OR NEW.superseded_at IS NULL OR
      (to_jsonb(NEW)-ARRAY['superseded_at','updated_at','version']) <>
      (to_jsonb(OLD)-ARRAY['superseded_at','updated_at','version']) THEN
      RAISE EXCEPTION 'effective_history_requires_supersession' USING ERRCODE='23514';
   END IF;
 END IF;
 IF NEW.version <> OLD.version+1 THEN RAISE EXCEPTION 'version_must_increment' USING ERRCODE='23514'; END IF;
 NEW.updated_at=clock_timestamp();
 RETURN NEW;
END $$;
ALTER TABLE "tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "tenant" TO app_runtime, app_retention USING (id=app.tenant_id()) WITH CHECK (id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "tenant" TO app_runtime;
ALTER TABLE "legal_entity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "legal_entity" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "legal_entity" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "legal_entity" TO app_runtime;
ALTER TABLE "legal_entity" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "legal_entity" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "team" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "team" TO app_runtime;
ALTER TABLE "team" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "team" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "retention_policy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "retention_policy" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "retention_policy" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "retention_policy" TO app_runtime;
ALTER TABLE "retention_policy" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "retention_policy" FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "legal_hold" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "legal_hold" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "legal_hold" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "legal_hold" TO app_runtime;
ALTER TABLE "legal_hold" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "legal_hold" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "held_record" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "held_record" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "held_record" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "held_record" TO app_runtime;
ALTER TABLE "held_record" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "held_record" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "privacy_request" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "privacy_request" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "privacy_request" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "privacy_request" TO app_runtime;
ALTER TABLE "privacy_request" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "privacy_request" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "deletion_tombstone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deletion_tombstone" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "deletion_tombstone" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "deletion_tombstone" TO app_runtime;
ALTER TABLE "deletion_tombstone" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "deletion_tombstone" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "principal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "principal" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "principal" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "principal" TO app_runtime;
ALTER TABLE "principal" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "principal" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "membership" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "membership" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "membership" TO app_runtime;
ALTER TABLE "membership" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "membership" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "role" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "role" TO app_runtime;
ALTER TABLE "role" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "role" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "role_permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permission" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "role_permission" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "role_permission" TO app_runtime;
ALTER TABLE "role_permission" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "role_permission" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "role_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "role_grant" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "role_grant" TO app_runtime;
ALTER TABLE "role_grant" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "role_grant" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "session" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "session" TO app_runtime;
ALTER TABLE "session" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "session" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "invitation" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "invitation" TO app_runtime;
ALTER TABLE "invitation" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "invitation" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "client_account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_account" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "client_account" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "client_account" TO app_runtime;
ALTER TABLE "client_account" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "client_account" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "contact" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "contact" TO app_runtime;
ALTER TABLE "contact" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "contact" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "candidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "candidate" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "candidate" TO app_runtime;
ALTER TABLE "candidate" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "candidate" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "workflow_template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_template" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "workflow_template" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "workflow_template" TO app_runtime;
ALTER TABLE "workflow_template" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "workflow_template" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "template_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "template_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "template_version" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "template_version" TO app_runtime;
ALTER TABLE "template_version" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "template_version" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "task_definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_definition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "task_definition" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "task_definition" TO app_runtime;
ALTER TABLE "task_definition" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "task_definition" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement" TO app_runtime;
ALTER TABLE "placement" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_date_revision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_date_revision" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_date_revision" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_date_revision" TO app_runtime;
ALTER TABLE "placement_date_revision" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_date_revision" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "milestone" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "milestone" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "milestone" TO app_runtime;
ALTER TABLE "milestone" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "milestone" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_task" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_task" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_task" TO app_runtime;
ALTER TABLE "placement_task" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_task" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_exception" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_exception" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_exception" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_exception" TO app_runtime;
ALTER TABLE "placement_exception" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_exception" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "participant_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participant_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "participant_grant" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "participant_grant" TO app_runtime;
ALTER TABLE "participant_grant" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "participant_grant" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "shared_field" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared_field" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "shared_field" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "shared_field" TO app_runtime;
ALTER TABLE "shared_field" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "shared_field" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "readiness_decision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "readiness_decision" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "readiness_decision" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "readiness_decision" TO app_runtime;
ALTER TABLE "readiness_decision" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "readiness_decision" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "subscription" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "subscription" TO app_runtime;
ALTER TABLE "subscription" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "subscription" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "module_activation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "module_activation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "module_activation" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "module_activation" TO app_runtime;
ALTER TABLE "module_activation" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "module_activation" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "entitlement_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entitlement_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "entitlement_grant" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "entitlement_grant" TO app_runtime;
ALTER TABLE "entitlement_grant" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "entitlement_grant" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "usage_counter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_counter" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "usage_counter" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "usage_counter" TO app_runtime;
ALTER TABLE "usage_counter" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "usage_counter" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "usage_reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_reservation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "usage_reservation" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "usage_reservation" TO app_runtime;
ALTER TABLE "usage_reservation" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "usage_reservation" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "usage_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "usage_event" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "usage_event" TO app_runtime;
ALTER TABLE "usage_event" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "usage_event" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "metric_definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "metric_definition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "metric_definition" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "metric_definition" TO app_runtime;
ALTER TABLE "metric_definition" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "metric_definition" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "saved_view" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_view" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "saved_view" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "saved_view" TO app_runtime;
ALTER TABLE "saved_view" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "saved_view" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "report_snapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_snapshot" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_snapshot" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_snapshot" TO app_runtime;
ALTER TABLE "report_snapshot" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_snapshot" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "export_artifact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "export_artifact" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "export_artifact" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "export_artifact" TO app_runtime;
ALTER TABLE "export_artifact" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "export_artifact" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "download_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "download_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "download_grant" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "download_grant" TO app_runtime;
ALTER TABLE "download_grant" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "download_grant" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "import_batch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_batch" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "import_batch" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "import_batch" TO app_runtime;
ALTER TABLE "import_batch" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "import_batch" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "import_error" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_error" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "import_error" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "import_error" TO app_runtime;
ALTER TABLE "import_error" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "import_error" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "idempotency_record" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "idempotency_record" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "idempotency_record" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "idempotency_record" TO app_runtime;
ALTER TABLE "idempotency_record" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "idempotency_record" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "outbox_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "outbox_event" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "outbox_event" TO app_runtime;
ALTER TABLE "outbox_event" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "outbox_event" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "inbox_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inbox_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "inbox_event" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "inbox_event" TO app_runtime;
ALTER TABLE "inbox_event" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "inbox_event" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "background_job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "background_job" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "background_job" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "background_job" TO app_runtime;
ALTER TABLE "background_job" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "background_job" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "notification_delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_delivery" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "notification_delivery" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "notification_delivery" TO app_runtime;
ALTER TABLE "notification_delivery" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "notification_delivery" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "audit_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "audit_event" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "audit_event" TO app_runtime;
ALTER TABLE "audit_event" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "audit_event" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "placement_transition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_transition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_transition" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_transition" TO app_runtime;
ALTER TABLE "placement_transition" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_transition" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "report_metric_binding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_metric_binding" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_metric_binding" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_metric_binding" TO app_runtime;
ALTER TABLE "report_metric_binding" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_metric_binding" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "report_result_row" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_result_row" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_result_row" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_result_row" TO app_runtime;
ALTER TABLE "report_result_row" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_result_row" FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "contact_membership_link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_membership_link" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "contact_membership_link" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "contact_membership_link" TO app_runtime;
ALTER TABLE "contact_membership_link" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "contact_membership_link" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "report_run" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_run" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_run" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_run" TO app_runtime;
ALTER TABLE "report_run" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_run" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "invitation_delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitation_delivery" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "invitation_delivery" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "invitation_delivery" TO app_runtime;
ALTER TABLE "invitation_delivery" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "invitation_delivery" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "commercial_change_request" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial_change_request" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "commercial_change_request" TO app_runtime, app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "commercial_change_request" TO app_runtime;
ALTER TABLE "commercial_change_request" ADD CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "commercial_change_request" FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');

ALTER TABLE usage_counter ADD CHECK (used>=0 AND reserved>=0 AND hard_limit>=0 AND used+reserved<=hard_limit);
CREATE SCHEMA control;
REVOKE ALL ON SCHEMA control FROM PUBLIC;
DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='app_dispatcher') THEN CREATE ROLE app_dispatcher NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF; END $$;
CREATE TABLE control.directory (tenant_id uuid PRIMARY KEY, slug text UNIQUE NOT NULL, cell text NOT NULL);
GRANT USAGE ON SCHEMA control TO app_dispatcher;
GRANT SELECT ON control.directory TO app_dispatcher;
CREATE FUNCTION app.register_workspace() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN INSERT INTO control.directory VALUES(NEW.id,NEW.slug,NEW.residency_cell); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION app.register_workspace() FROM PUBLIC;
CREATE TRIGGER workspace_directory AFTER INSERT ON tenant FOR EACH ROW EXECUTE FUNCTION app.register_workspace();
CREATE FUNCTION app.resolve_workspace(workspace_slug text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ SELECT tenant_id FROM control.directory WHERE slug=workspace_slug $$;
REVOKE ALL ON FUNCTION app.resolve_workspace(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.resolve_workspace(text) TO app_runtime;
CREATE FUNCTION app.guard_tenant() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.id<>OLD.id OR NEW.slug<>OLD.slug OR NEW.residency_cell<>OLD.residency_cell OR NEW.created_at<>OLD.created_at THEN RAISE EXCEPTION 'immutable_tenant_identity' USING ERRCODE='23514'; END IF; RETURN NEW; END $$;
CREATE TRIGGER tenant_identity BEFORE UPDATE ON tenant FOR EACH ROW EXECUTE FUNCTION app.guard_tenant();
ALTER TABLE placement ADD CHECK (status IN ('accepted','in_progress','ready','started','canceled'));
ALTER TABLE placement_task ADD CHECK (state IN ('pending','in_progress','completed','waived'));
CREATE FUNCTION app.guard_original_date() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.original_planned_start<>OLD.original_planned_start THEN RAISE EXCEPTION 'immutable_original_date' USING ERRCODE='23514'; END IF; RETURN NEW; END $$;
CREATE TRIGGER immutable_original_date BEFORE UPDATE ON placement FOR EACH ROW EXECUTE FUNCTION app.guard_original_date();

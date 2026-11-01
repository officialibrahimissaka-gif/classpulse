-- Mandatory Phase 3 companion to Prisma-generated PostgreSQL DDL.
-- Run after base schema with a migration owner; never install via runtime app role.
-- Roles are NOLOGIN capability roles. Deployment attaches actual workload identities.
BEGIN;
CREATE EXTENSION IF NOT EXISTS btree_gist;
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
ALTER TABLE "legal_entity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "legal_entity" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "legal_entity" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "legal_entity" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "legal_entity" TO app_retention;
ALTER TABLE "legal_entity" ADD CONSTRAINT "legal_entity_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "legal_entity"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "legal_entity" ADD CHECK ("country_code" ~ '^[A-Z]{2}$');
ALTER TABLE "legal_entity" ADD CHECK ("default_currency" IS NULL OR "default_currency" ~ '^[A-Z]{3}$');
ALTER TABLE "team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "team" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "team" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "team" TO app_retention;
ALTER TABLE "team" ADD CONSTRAINT "team_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "team"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "work_calendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_calendar" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "work_calendar" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "work_calendar" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "work_calendar" TO app_retention;
ALTER TABLE "work_calendar" ADD CONSTRAINT "work_calendar_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "work_calendar"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "calendar_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calendar_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "calendar_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "calendar_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "calendar_version" TO app_retention;
ALTER TABLE "calendar_version" ADD CONSTRAINT "calendar_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "calendar_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "calendar_version" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "calendar_day" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calendar_day" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "calendar_day" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "calendar_day" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "calendar_day" TO app_retention;
ALTER TABLE "calendar_day" ADD CONSTRAINT "calendar_day_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "calendar_day"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "jurisdiction_pack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jurisdiction_pack" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "jurisdiction_pack" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "jurisdiction_pack" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "jurisdiction_pack" TO app_retention;
ALTER TABLE "jurisdiction_pack" ADD CONSTRAINT "jurisdiction_pack_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "jurisdiction_pack"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "jurisdiction_pack" ADD CHECK ("country_code" ~ '^[A-Z]{2}$');
ALTER TABLE "rule_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rule_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "rule_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "rule_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "rule_version" TO app_retention;
ALTER TABLE "rule_version" ADD CONSTRAINT "rule_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "rule_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "rule_version" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "applicability_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applicability_assignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "applicability_assignment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "applicability_assignment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "applicability_assignment" TO app_retention;
ALTER TABLE "applicability_assignment" ADD CONSTRAINT "applicability_assignment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "applicability_assignment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "applicability_assignment" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "retention_policy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "retention_policy" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "retention_policy" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "retention_policy" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "retention_policy" TO app_retention;
ALTER TABLE "retention_policy" ADD CONSTRAINT "retention_policy_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "retention_policy"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "retention_policy" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "legal_hold" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "legal_hold" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "legal_hold" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "legal_hold" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "legal_hold" TO app_retention;
ALTER TABLE "legal_hold" ADD CONSTRAINT "legal_hold_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "legal_hold"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "held_record" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "held_record" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "held_record" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "held_record" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "held_record" TO app_retention;
ALTER TABLE "held_record" ADD CONSTRAINT "held_record_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "held_record"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "privacy_request" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "privacy_request" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "privacy_request" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "privacy_request" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "privacy_request" TO app_retention;
ALTER TABLE "privacy_request" ADD CONSTRAINT "privacy_request_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "privacy_request"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "deletion_tombstone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deletion_tombstone" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "deletion_tombstone" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "deletion_tombstone" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "deletion_tombstone" TO app_retention;
ALTER TABLE "deletion_tombstone" ADD CONSTRAINT "deletion_tombstone_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "deletion_tombstone"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "principal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "principal" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "principal" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "principal" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "principal" TO app_retention;
ALTER TABLE "principal" ADD CONSTRAINT "principal_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "principal"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "membership" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "membership" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "membership" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "membership" TO app_retention;
ALTER TABLE "membership" ADD CONSTRAINT "membership_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "membership"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "role" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "role" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "role" TO app_retention;
ALTER TABLE "role" ADD CONSTRAINT "role_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "role"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "role_permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permission" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "role_permission" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "role_permission" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "role_permission" TO app_retention;
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "role_permission"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "role_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "role_grant" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "role_grant" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "role_grant" TO app_retention;
ALTER TABLE "role_grant" ADD CONSTRAINT "role_grant_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "role_grant"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "session" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "session" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "session" TO app_retention;
ALTER TABLE "session" ADD CONSTRAINT "session_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "session"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "invitation" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "invitation" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "invitation" TO app_retention;
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "invitation"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "operator_access_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "operator_access_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "operator_access_grant" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "operator_access_grant" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "operator_access_grant" TO app_retention;
ALTER TABLE "operator_access_grant" ADD CONSTRAINT "operator_access_grant_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "operator_access_grant"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "client_account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_account" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "client_account" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "client_account" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "client_account" TO app_retention;
ALTER TABLE "client_account" ADD CONSTRAINT "client_account_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "client_account"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "contact" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "contact" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "contact" TO app_retention;
ALTER TABLE "contact" ADD CONSTRAINT "contact_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "contact"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "candidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "candidate" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "candidate" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "candidate" TO app_retention;
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "candidate"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "workflow_template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_template" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "workflow_template" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "workflow_template" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "workflow_template" TO app_retention;
ALTER TABLE "workflow_template" ADD CONSTRAINT "workflow_template_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "workflow_template"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "template_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "template_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "template_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "template_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "template_version" TO app_retention;
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "template_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "task_definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_definition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "task_definition" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "task_definition" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "task_definition" TO app_retention;
ALTER TABLE "task_definition" ADD CONSTRAINT "task_definition_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "task_definition"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "placement" TO app_retention;
ALTER TABLE "placement" ADD CONSTRAINT "placement_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement" ADD CHECK (status IN ('accepted','coordinating','ready','started','canceled'));
ALTER TABLE "placement_date_revision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_date_revision" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_date_revision" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_date_revision" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "placement_date_revision" TO app_retention;
ALTER TABLE "placement_date_revision" ADD CONSTRAINT "placement_date_revision_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_date_revision"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "milestone" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "milestone" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "milestone" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "milestone" TO app_retention;
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "milestone"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_task" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_task" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_task" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "placement_task" TO app_retention;
ALTER TABLE "placement_task" ADD CONSTRAINT "placement_task_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_task"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_task" ADD CHECK (state IN ('pending','in_progress','completed','waived'));
ALTER TABLE "placement_exception" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_exception" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_exception" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_exception" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "placement_exception" TO app_retention;
ALTER TABLE "placement_exception" ADD CONSTRAINT "placement_exception_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_exception"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_exception" ADD CHECK (state IN ('open','resolved','dismissed'));
ALTER TABLE "participant_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participant_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "participant_grant" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "participant_grant" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "participant_grant" TO app_retention;
ALTER TABLE "participant_grant" ADD CONSTRAINT "participant_grant_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "participant_grant"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "shared_field" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared_field" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "shared_field" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "shared_field" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "shared_field" TO app_retention;
ALTER TABLE "shared_field" ADD CONSTRAINT "shared_field_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "shared_field"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "readiness_decision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "readiness_decision" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "readiness_decision" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "readiness_decision" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "readiness_decision" TO app_retention;
ALTER TABLE "readiness_decision" ADD CONSTRAINT "readiness_decision_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "readiness_decision"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "person" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "person" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "person" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "person" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "person" TO app_retention;
ALTER TABLE "person" ADD CONSTRAINT "person_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "person"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "person_identifier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "person_identifier" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "person_identifier" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "person_identifier" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "person_identifier" TO app_retention;
ALTER TABLE "person_identifier" ADD CONSTRAINT "person_identifier_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "person_identifier"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "person_identifier" ADD CHECK ("issuing_country" ~ '^[A-Z]{2}$');
ALTER TABLE "employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employee" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employee" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employee" TO app_retention;
ALTER TABLE "employee" ADD CONSTRAINT "employee_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employee"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "position" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "position" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "position" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "position" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "position" TO app_retention;
ALTER TABLE "position" ADD CONSTRAINT "position_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "position"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "employment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employment" TO app_retention;
ALTER TABLE "employment" ADD CONSTRAINT "employment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "employment_term" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employment_term" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employment_term" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employment_term" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employment_term" TO app_retention;
ALTER TABLE "employment_term" ADD CONSTRAINT "employment_term_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employment_term"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "employment_term" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "employment_term" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "employment_contract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employment_contract" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employment_contract" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employment_contract" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employment_contract" TO app_retention;
ALTER TABLE "employment_contract" ADD CONSTRAINT "employment_contract_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employment_contract"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "candidate_conversion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_conversion" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "candidate_conversion" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "candidate_conversion" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "candidate_conversion" TO app_retention;
ALTER TABLE "candidate_conversion" ADD CONSTRAINT "candidate_conversion_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "candidate_conversion"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "candidate_profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_profile" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "candidate_profile" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "candidate_profile" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "candidate_profile" TO app_retention;
ALTER TABLE "candidate_profile" ADD CONSTRAINT "candidate_profile_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "candidate_profile"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "requisition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "requisition" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "requisition" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "requisition" TO app_retention;
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "requisition"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "application" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "application" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "application" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "application" TO app_retention;
ALTER TABLE "application" ADD CONSTRAINT "application_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "application"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "application" ADD CHECK (state IN ('new','screening','interview','offer','hired','rejected','withdrawn'));
ALTER TABLE "application_stage_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "application_stage_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "application_stage_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "application_stage_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "application_stage_event" TO app_retention;
ALTER TABLE "application_stage_event" ADD CONSTRAINT "application_stage_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "application_stage_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "interview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interview" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "interview" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "interview" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "interview" TO app_retention;
ALTER TABLE "interview" ADD CONSTRAINT "interview_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "interview"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "interview_feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interview_feedback" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "interview_feedback" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "interview_feedback" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "interview_feedback" TO app_retention;
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "interview_feedback"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "offer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "offer" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "offer" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "offer" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "offer" TO app_retention;
ALTER TABLE "offer" ADD CONSTRAINT "offer_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "offer"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "offer" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "offer" ADD CHECK (state IN ('draft','in_review','approved','issued','accepted','declined','expired','withdrawn'));
ALTER TABLE "career_posting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "career_posting" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "career_posting" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "career_posting" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "career_posting" TO app_retention;
ALTER TABLE "career_posting" ADD CONSTRAINT "career_posting_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "career_posting"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "lifecycle_case" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lifecycle_case" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "lifecycle_case" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "lifecycle_case" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "lifecycle_case" TO app_retention;
ALTER TABLE "lifecycle_case" ADD CONSTRAINT "lifecycle_case_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "lifecycle_case"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "lifecycle_case" ADD CHECK (state IN ('draft','active','blocked','completed','canceled'));
ALTER TABLE "lifecycle_task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lifecycle_task" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "lifecycle_task" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "lifecycle_task" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "lifecycle_task" TO app_retention;
ALTER TABLE "lifecycle_task" ADD CONSTRAINT "lifecycle_task_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "lifecycle_task"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "leave_policy_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_policy_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "leave_policy_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "leave_policy_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "leave_policy_version" TO app_retention;
ALTER TABLE "leave_policy_version" ADD CONSTRAINT "leave_policy_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "leave_policy_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "leave_policy_version" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "leave_account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_account" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "leave_account" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "leave_account" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "leave_account" TO app_retention;
ALTER TABLE "leave_account" ADD CONSTRAINT "leave_account_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "leave_account"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "leave_request" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_request" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "leave_request" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "leave_request" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "leave_request" TO app_retention;
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "leave_request"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "leave_request" ADD CHECK (state IN ('draft','submitted','approved','rejected','canceled','taken'));
ALTER TABLE "leave_ledger_entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_ledger_entry" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "leave_ledger_entry" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "leave_ledger_entry" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "leave_ledger_entry" TO app_retention;
ALTER TABLE "leave_ledger_entry" ADD CONSTRAINT "leave_ledger_entry_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "leave_ledger_entry"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "time_entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_entry" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "time_entry" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "time_entry" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "time_entry" TO app_retention;
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "time_entry"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "time_approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_approval" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "time_approval" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "time_approval" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "time_approval" TO app_retention;
ALTER TABLE "time_approval" ADD CONSTRAINT "time_approval_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "time_approval"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "time_approval_item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_approval_item" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "time_approval_item" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "time_approval_item" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "time_approval_item" TO app_retention;
ALTER TABLE "time_approval_item" ADD CONSTRAINT "time_approval_item_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "time_approval_item"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "shift" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shift" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "shift" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "shift" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "shift" TO app_retention;
ALTER TABLE "shift" ADD CONSTRAINT "shift_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "shift"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "shift_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shift_assignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "shift_assignment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "shift_assignment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "shift_assignment" TO app_retention;
ALTER TABLE "shift_assignment" ADD CONSTRAINT "shift_assignment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "shift_assignment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "shift_swap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shift_swap" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "shift_swap" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "shift_swap" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "shift_swap" TO app_retention;
ALTER TABLE "shift_swap" ADD CONSTRAINT "shift_swap_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "shift_swap"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "work_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_assignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "work_assignment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "work_assignment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "work_assignment" TO app_retention;
ALTER TABLE "work_assignment" ADD CONSTRAINT "work_assignment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "work_assignment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "work_assignment" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "client_time_approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_time_approval" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "client_time_approval" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "client_time_approval" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "client_time_approval" TO app_retention;
ALTER TABLE "client_time_approval" ADD CONSTRAINT "client_time_approval_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "client_time_approval"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "pay_period" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_period" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "pay_period" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "pay_period" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "pay_period" TO app_retention;
ALTER TABLE "pay_period" ADD CONSTRAINT "pay_period_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "pay_period"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "pay_period" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "payroll_input_batch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_input_batch" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "payroll_input_batch" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "payroll_input_batch" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "payroll_input_batch" TO app_retention;
ALTER TABLE "payroll_input_batch" ADD CONSTRAINT "payroll_input_batch_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "payroll_input_batch"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "payroll_input_batch" ADD CHECK (state IN ('draft','in_review','approved','exported','rejected','canceled'));
ALTER TABLE "payroll_input" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_input" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "payroll_input" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "payroll_input" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "payroll_input" TO app_retention;
ALTER TABLE "payroll_input" ADD CONSTRAINT "payroll_input_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "payroll_input"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "payroll_input" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "payroll_exception" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_exception" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "payroll_exception" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "payroll_exception" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "payroll_exception" TO app_retention;
ALTER TABLE "payroll_exception" ADD CONSTRAINT "payroll_exception_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "payroll_exception"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "payroll_provider_export" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_provider_export" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "payroll_provider_export" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "payroll_provider_export" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "payroll_provider_export" TO app_retention;
ALTER TABLE "payroll_provider_export" ADD CONSTRAINT "payroll_provider_export_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "payroll_provider_export"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "payroll_provider_export" ADD CHECK (state IN ('generated','approved','exported','provider_accepted','rejected','reconciled'));
ALTER TABLE "pay_run" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_run" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "pay_run" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "pay_run" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "pay_run" TO app_retention;
ALTER TABLE "pay_run" ADD CONSTRAINT "pay_run_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "pay_run"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "pay_run" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "pay_run" ADD CHECK (state IN ('draft','calculated','in_review','approved','finalized','failed','canceled'));
ALTER TABLE "pay_run_worker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_run_worker" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "pay_run_worker" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "pay_run_worker" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "pay_run_worker" TO app_retention;
ALTER TABLE "pay_run_worker" ADD CONSTRAINT "pay_run_worker_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "pay_run_worker"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "pay_run_worker" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "pay_calculation_line" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_calculation_line" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "pay_calculation_line" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "pay_calculation_line" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "pay_calculation_line" TO app_retention;
ALTER TABLE "pay_calculation_line" ADD CONSTRAINT "pay_calculation_line_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "pay_calculation_line"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "payslip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payslip" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "payslip" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "payslip" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "payslip" TO app_retention;
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "payslip"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "final_settlement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "final_settlement" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "final_settlement" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "final_settlement" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "final_settlement" TO app_retention;
ALTER TABLE "final_settlement" ADD CONSTRAINT "final_settlement_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "final_settlement"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "final_settlement" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "payment_evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_evidence" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "payment_evidence" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "payment_evidence" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "payment_evidence" TO app_retention;
ALTER TABLE "payment_evidence" ADD CONSTRAINT "payment_evidence_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "payment_evidence"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "payment_evidence" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "compensation_cycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "compensation_cycle" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "compensation_cycle" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "compensation_cycle" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "compensation_cycle" TO app_retention;
ALTER TABLE "compensation_cycle" ADD CONSTRAINT "compensation_cycle_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "compensation_cycle"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "compensation_cycle" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "compensation_proposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "compensation_proposal" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "compensation_proposal" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "compensation_proposal" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "compensation_proposal" TO app_retention;
ALTER TABLE "compensation_proposal" ADD CONSTRAINT "compensation_proposal_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "compensation_proposal"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "compensation_proposal" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "benefit_plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "benefit_plan" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "benefit_plan" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "benefit_plan" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "benefit_plan" TO app_retention;
ALTER TABLE "benefit_plan" ADD CONSTRAINT "benefit_plan_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "benefit_plan"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "benefit_plan_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "benefit_plan_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "benefit_plan_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "benefit_plan_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "benefit_plan_version" TO app_retention;
ALTER TABLE "benefit_plan_version" ADD CONSTRAINT "benefit_plan_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "benefit_plan_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "benefit_plan_version" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "benefit_enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "benefit_enrollment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "benefit_enrollment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "benefit_enrollment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "benefit_enrollment" TO app_retention;
ALTER TABLE "benefit_enrollment" ADD CONSTRAINT "benefit_enrollment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "benefit_enrollment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "benefit_enrollment" ADD CHECK (state IN ('requested','in_review','approved','provider_pending','active','rejected','ended'));
ALTER TABLE "review_cycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review_cycle" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "review_cycle" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "review_cycle" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "review_cycle" TO app_retention;
ALTER TABLE "review_cycle" ADD CONSTRAINT "review_cycle_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "review_cycle"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "goal" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "goal" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "goal" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "goal" TO app_retention;
ALTER TABLE "goal" ADD CONSTRAINT "goal_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "goal"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "review_submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review_submission" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "review_submission" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "review_submission" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "review_submission" TO app_retention;
ALTER TABLE "review_submission" ADD CONSTRAINT "review_submission_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "review_submission"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "calibration_decision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calibration_decision" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "calibration_decision" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "calibration_decision" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "calibration_decision" TO app_retention;
ALTER TABLE "calibration_decision" ADD CONSTRAINT "calibration_decision_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "calibration_decision"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "learning_course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_course" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "learning_course" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "learning_course" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "learning_course" TO app_retention;
ALTER TABLE "learning_course" ADD CONSTRAINT "learning_course_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "learning_course"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "course_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "course_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "course_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "course_version" TO app_retention;
ALTER TABLE "course_version" ADD CONSTRAINT "course_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "course_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "learning_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_assignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "learning_assignment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "learning_assignment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "learning_assignment" TO app_retention;
ALTER TABLE "learning_assignment" ADD CONSTRAINT "learning_assignment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "learning_assignment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skill" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "skill" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "skill" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "skill" TO app_retention;
ALTER TABLE "skill" ADD CONSTRAINT "skill_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "skill"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "skill_evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skill_evidence" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "skill_evidence" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "skill_evidence" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "skill_evidence" TO app_retention;
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "skill_evidence"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "succession_plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "succession_plan" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "succession_plan" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "succession_plan" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "succession_plan" TO app_retention;
ALTER TABLE "succession_plan" ADD CONSTRAINT "succession_plan_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "succession_plan"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "succession_candidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "succession_candidate" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "succession_candidate" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "succession_candidate" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "succession_candidate" TO app_retention;
ALTER TABLE "succession_candidate" ADD CONSTRAINT "succession_candidate_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "succession_candidate"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "document" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "document" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "document" TO app_retention;
ALTER TABLE "document" ADD CONSTRAINT "document_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "document"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "employment_document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employment_document" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employment_document" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employment_document" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employment_document" TO app_retention;
ALTER TABLE "employment_document" ADD CONSTRAINT "employment_document_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employment_document"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "candidate_document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_document" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "candidate_document" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "candidate_document" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "candidate_document" TO app_retention;
ALTER TABLE "candidate_document" ADD CONSTRAINT "candidate_document_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "candidate_document"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asset" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "asset" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "asset" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "asset" TO app_retention;
ALTER TABLE "asset" ADD CONSTRAINT "asset_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "asset"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "asset_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asset_assignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "asset_assignment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "asset_assignment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "asset_assignment" TO app_retention;
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "asset_assignment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "expense_claim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expense_claim" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "expense_claim" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "expense_claim" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "expense_claim" TO app_retention;
ALTER TABLE "expense_claim" ADD CONSTRAINT "expense_claim_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "expense_claim"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "expense_claim" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "expense_claim" ADD CHECK (state IN ('draft','submitted','in_review','approved','rejected','payment_pending','reimbursed','canceled'));
ALTER TABLE "expense_line" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expense_line" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "expense_line" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "expense_line" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "expense_line" TO app_retention;
ALTER TABLE "expense_line" ADD CONSTRAINT "expense_line_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "expense_line"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "expense_line" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "reimbursement_evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reimbursement_evidence" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "reimbursement_evidence" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "reimbursement_evidence" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "reimbursement_evidence" TO app_retention;
ALTER TABLE "reimbursement_evidence" ADD CONSTRAINT "reimbursement_evidence_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "reimbursement_evidence"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "reimbursement_evidence" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "employee_case" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_case" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employee_case" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employee_case" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employee_case" TO app_retention;
ALTER TABLE "employee_case" ADD CONSTRAINT "employee_case_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employee_case"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "employee_case_access" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_case_access" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employee_case_access" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employee_case_access" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employee_case_access" TO app_retention;
ALTER TABLE "employee_case_access" ADD CONSTRAINT "employee_case_access_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employee_case_access"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "announcement" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "announcement" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "announcement" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "announcement" TO app_retention;
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "announcement"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "acknowledgment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "acknowledgment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "acknowledgment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "acknowledgment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "acknowledgment" TO app_retention;
ALTER TABLE "acknowledgment" ADD CONSTRAINT "acknowledgment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "acknowledgment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "survey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survey" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "survey" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "survey" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "survey" TO app_retention;
ALTER TABLE "survey" ADD CONSTRAINT "survey_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "survey"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "survey_response" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survey_response" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "survey_response" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "survey_response" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "survey_response" TO app_retention;
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "survey_response"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "lead" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "lead" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "lead" TO app_retention;
ALTER TABLE "lead" ADD CONSTRAINT "lead_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "lead"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "opportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "opportunity" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "opportunity" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "opportunity" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "opportunity" TO app_retention;
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "opportunity"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "opportunity" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "opportunity" ADD CHECK (state IN ('qualified','discovery','proposal','negotiation','won','lost'));
ALTER TABLE "sales_stage_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales_stage_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "sales_stage_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "sales_stage_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "sales_stage_event" TO app_retention;
ALTER TABLE "sales_stage_event" ADD CONSTRAINT "sales_stage_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "sales_stage_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "activity" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "activity" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "activity" TO app_retention;
ALTER TABLE "activity" ADD CONSTRAINT "activity_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "activity"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "commercial_contract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial_contract" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "commercial_contract" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "commercial_contract" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "commercial_contract" TO app_retention;
ALTER TABLE "commercial_contract" ADD CONSTRAINT "commercial_contract_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "commercial_contract"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "contract_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contract_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "contract_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "contract_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "contract_version" TO app_retention;
ALTER TABLE "contract_version" ADD CONSTRAINT "contract_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "contract_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "contract_version" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "contract_version" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE "quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quote" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "quote" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "quote" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "quote" TO app_retention;
ALTER TABLE "quote" ADD CONSTRAINT "quote_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "quote"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "quote" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "commercial_order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial_order" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "commercial_order" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "commercial_order" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "commercial_order" TO app_retention;
ALTER TABLE "commercial_order" ADD CONSTRAINT "commercial_order_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "commercial_order"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "commercial_order" ADD CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "success_plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "success_plan" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "success_plan" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "success_plan" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "success_plan" TO app_retention;
ALTER TABLE "success_plan" ADD CONSTRAINT "success_plan_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "success_plan"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "success_plan" ADD CHECK (state IN ('draft','active','blocked','completed','canceled'));
ALTER TABLE "success_milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "success_milestone" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "success_milestone" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "success_milestone" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "success_milestone" TO app_retention;
ALTER TABLE "success_milestone" ADD CONSTRAINT "success_milestone_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "success_milestone"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "health_model_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "health_model_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "health_model_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "health_model_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "health_model_version" TO app_retention;
ALTER TABLE "health_model_version" ADD CONSTRAINT "health_model_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "health_model_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "health_factor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "health_factor" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "health_factor" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "health_factor" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "health_factor" TO app_retention;
ALTER TABLE "health_factor" ADD CONSTRAINT "health_factor_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "health_factor"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "health_snapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "health_snapshot" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "health_snapshot" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "health_snapshot" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "health_snapshot" TO app_retention;
ALTER TABLE "health_snapshot" ADD CONSTRAINT "health_snapshot_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "health_snapshot"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "health_factor_result" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "health_factor_result" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "health_factor_result" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "health_factor_result" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "health_factor_result" TO app_retention;
ALTER TABLE "health_factor_result" ADD CONSTRAINT "health_factor_result_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "health_factor_result"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "renewal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "renewal" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "renewal" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "renewal" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "renewal" TO app_retention;
ALTER TABLE "renewal" ADD CONSTRAINT "renewal_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "renewal"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "support_queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_queue" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "support_queue" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "support_queue" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "support_queue" TO app_retention;
ALTER TABLE "support_queue" ADD CONSTRAINT "support_queue_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "support_queue"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "sla_policy_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sla_policy_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "sla_policy_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "sla_policy_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "sla_policy_version" TO app_retention;
ALTER TABLE "sla_policy_version" ADD CONSTRAINT "sla_policy_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "sla_policy_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "support_ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_ticket" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "support_ticket" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "support_ticket" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "support_ticket" TO app_retention;
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "support_ticket"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "support_ticket" ADD CHECK (state IN ('open','in_progress','waiting','resolved','closed'));
ALTER TABLE "ticket_reply" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ticket_reply" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "ticket_reply" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "ticket_reply" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "ticket_reply" TO app_retention;
ALTER TABLE "ticket_reply" ADD CONSTRAINT "ticket_reply_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "ticket_reply"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "sla_clock_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sla_clock_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "sla_clock_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "sla_clock_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "sla_clock_event" TO app_retention;
ALTER TABLE "sla_clock_event" ADD CONSTRAINT "sla_clock_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "sla_clock_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "knowledge_article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_article" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "knowledge_article" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "knowledge_article" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "knowledge_article" TO app_retention;
ALTER TABLE "knowledge_article" ADD CONSTRAINT "knowledge_article_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "knowledge_article"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "csat_invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "csat_invitation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "csat_invitation" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "csat_invitation" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "csat_invitation" TO app_retention;
ALTER TABLE "csat_invitation" ADD CONSTRAINT "csat_invitation_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "csat_invitation"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "csat_response" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "csat_response" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "csat_response" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "csat_response" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "csat_response" TO app_retention;
ALTER TABLE "csat_response" ADD CONSTRAINT "csat_response_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "csat_response"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "approval_request" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "approval_request" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "approval_request" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "approval_request" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "approval_request" TO app_retention;
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "approval_request"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "approval_request" ADD CHECK (state IN ('pending','approved','rejected','canceled'));
ALTER TABLE "approval_step" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "approval_step" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "approval_step" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "approval_step" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "approval_step" TO app_retention;
ALTER TABLE "approval_step" ADD CONSTRAINT "approval_step_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "approval_step"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "approval_step" ADD CHECK (state IN ('pending','approved','rejected','skipped'));
ALTER TABLE "automation_rule_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "automation_rule_version" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "automation_rule_version" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "automation_rule_version" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "automation_rule_version" TO app_retention;
ALTER TABLE "automation_rule_version" ADD CONSTRAINT "automation_rule_version_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "automation_rule_version"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "automation_run" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "automation_run" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "automation_run" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "automation_run" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "automation_run" TO app_retention;
ALTER TABLE "automation_run" ADD CONSTRAINT "automation_run_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "automation_run"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "subscription" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "subscription" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "subscription" TO app_retention;
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "subscription"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "module_activation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "module_activation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "module_activation" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "module_activation" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "module_activation" TO app_retention;
ALTER TABLE "module_activation" ADD CONSTRAINT "module_activation_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "module_activation"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "module_activation" ADD CHECK (state IN ('unavailable','inactive','provisioning','active','read_only','suspended'));
ALTER TABLE "entitlement_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entitlement_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "entitlement_grant" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "entitlement_grant" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "entitlement_grant" TO app_retention;
ALTER TABLE "entitlement_grant" ADD CONSTRAINT "entitlement_grant_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "entitlement_grant"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "usage_counter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_counter" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "usage_counter" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "usage_counter" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "usage_counter" TO app_retention;
ALTER TABLE "usage_counter" ADD CONSTRAINT "usage_counter_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "usage_counter"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "usage_reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_reservation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "usage_reservation" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "usage_reservation" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "usage_reservation" TO app_retention;
ALTER TABLE "usage_reservation" ADD CONSTRAINT "usage_reservation_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "usage_reservation"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "usage_reservation" ADD CHECK (state IN ('reserved','committed','released','expired'));
ALTER TABLE "usage_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "usage_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "usage_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "usage_event" TO app_retention;
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "usage_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "metric_definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "metric_definition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "metric_definition" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "metric_definition" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "metric_definition" TO app_retention;
ALTER TABLE "metric_definition" ADD CONSTRAINT "metric_definition_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "metric_definition"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "saved_view" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_view" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "saved_view" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "saved_view" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "saved_view" TO app_retention;
ALTER TABLE "saved_view" ADD CONSTRAINT "saved_view_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "saved_view"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "report_snapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_snapshot" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_snapshot" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_snapshot" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "report_snapshot" TO app_retention;
ALTER TABLE "report_snapshot" ADD CONSTRAINT "report_snapshot_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_snapshot"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "export_artifact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "export_artifact" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "export_artifact" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "export_artifact" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "export_artifact" TO app_retention;
ALTER TABLE "export_artifact" ADD CONSTRAINT "export_artifact_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "export_artifact"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "export_artifact" ADD CHECK (state IN ('pending','generating','ready','failed','expired'));
ALTER TABLE "download_grant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "download_grant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "download_grant" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "download_grant" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "download_grant" TO app_retention;
ALTER TABLE "download_grant" ADD CONSTRAINT "download_grant_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "download_grant"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "report_schedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_schedule" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_schedule" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_schedule" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "report_schedule" TO app_retention;
ALTER TABLE "report_schedule" ADD CONSTRAINT "report_schedule_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_schedule"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "report_recipient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_recipient" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_recipient" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_recipient" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "report_recipient" TO app_retention;
ALTER TABLE "report_recipient" ADD CONSTRAINT "report_recipient_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_recipient"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "connector" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "connector" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "connector" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "connector" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "connector" TO app_retention;
ALTER TABLE "connector" ADD CONSTRAINT "connector_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "connector"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "external_mapping" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "external_mapping" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "external_mapping" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "external_mapping" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "external_mapping" TO app_retention;
ALTER TABLE "external_mapping" ADD CONSTRAINT "external_mapping_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "external_mapping"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "import_batch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_batch" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "import_batch" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "import_batch" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "import_batch" TO app_retention;
ALTER TABLE "import_batch" ADD CONSTRAINT "import_batch_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "import_batch"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "import_batch" ADD CHECK (state IN ('staged','validating','ready','committing','committed','failed','expired'));
ALTER TABLE "import_error" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_error" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "import_error" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "import_error" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "import_error" TO app_retention;
ALTER TABLE "import_error" ADD CONSTRAINT "import_error_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "import_error"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "idempotency_record" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "idempotency_record" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "idempotency_record" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "idempotency_record" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "idempotency_record" TO app_retention;
ALTER TABLE "idempotency_record" ADD CONSTRAINT "idempotency_record_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "idempotency_record"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "outbox_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "outbox_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "outbox_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "outbox_event" TO app_retention;
ALTER TABLE "outbox_event" ADD CONSTRAINT "outbox_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "outbox_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "inbox_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inbox_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "inbox_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "inbox_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "inbox_event" TO app_retention;
ALTER TABLE "inbox_event" ADD CONSTRAINT "inbox_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "inbox_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "background_job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "background_job" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "background_job" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "background_job" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "background_job" TO app_retention;
ALTER TABLE "background_job" ADD CONSTRAINT "background_job_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "background_job"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "background_job" ADD CHECK (state IN ('pending','running','succeeded','retryable_failed','outcome_unknown','dead_letter','canceled'));
ALTER TABLE "notification_delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_delivery" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "notification_delivery" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "notification_delivery" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "notification_delivery" TO app_retention;
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "notification_delivery"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "audit_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "audit_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "audit_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "audit_event" TO app_retention;
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "audit_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "rule_proposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rule_proposal" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "rule_proposal" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "rule_proposal" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "rule_proposal" TO app_retention;
ALTER TABLE "rule_proposal" ADD CONSTRAINT "rule_proposal_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "rule_proposal"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "placement_transition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "placement_transition" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "placement_transition" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "placement_transition" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "placement_transition" TO app_retention;
ALTER TABLE "placement_transition" ADD CONSTRAINT "placement_transition_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "placement_transition"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "report_metric_binding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_metric_binding" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_metric_binding" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_metric_binding" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "report_metric_binding" TO app_retention;
ALTER TABLE "report_metric_binding" ADD CONSTRAINT "report_metric_binding_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_metric_binding"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "report_result_row" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report_result_row" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "report_result_row" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "report_result_row" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "report_result_row" TO app_retention;
ALTER TABLE "report_result_row" ADD CONSTRAINT "report_result_row_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "report_result_row"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "person_membership_link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "person_membership_link" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "person_membership_link" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "person_membership_link" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "person_membership_link" TO app_retention;
ALTER TABLE "person_membership_link" ADD CONSTRAINT "person_membership_link_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "person_membership_link"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "contact_membership_link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_membership_link" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "contact_membership_link" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "contact_membership_link" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "contact_membership_link" TO app_retention;
ALTER TABLE "contact_membership_link" ADD CONSTRAINT "contact_membership_link_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "contact_membership_link"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE "employment_lifecycle_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employment_lifecycle_event" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "employment_lifecycle_event" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "employment_lifecycle_event" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "employment_lifecycle_event" TO app_retention;
ALTER TABLE "employment_lifecycle_event" ADD CONSTRAINT "employment_lifecycle_event_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "employment_lifecycle_event"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('append');
ALTER TABLE "organization_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_assignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON "organization_assignment" TO app_runtime, app_retention
 USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT, INSERT, UPDATE ON "organization_assignment" TO app_runtime;
GRANT SELECT, UPDATE, DELETE ON "organization_assignment" TO app_retention;
ALTER TABLE "organization_assignment" ADD CONSTRAINT "organization_assignment_version_positive" CHECK (version>0);
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON "organization_assignment"
 FOR EACH ROW EXECUTE FUNCTION app.guard_record('effective');
ALTER TABLE "organization_assignment" ADD CHECK (valid_to IS NULL OR valid_to>valid_from), ADD CHECK (superseded_at IS NULL OR superseded_at>=recorded_at);
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON tenant TO app_runtime, app_retention USING (id=app.tenant_id()) WITH CHECK (id=app.tenant_id());
GRANT SELECT, UPDATE ON tenant TO app_runtime;
-- Provisioning and destructive tenant closure use a separately controlled migration/admin path.
ALTER TABLE employment ADD CHECK (end_date IS NULL OR end_date>=start_date);
ALTER TABLE time_entry ADD CHECK (ended_at>started_at);
ALTER TABLE shift ADD CHECK (ends_at>starts_at), ADD CHECK(required_count>0);
ALTER TABLE interview ADD CHECK (ends_at>starts_at);
ALTER TABLE leave_request ADD CHECK (ends_on>=starts_on), ADD CHECK(quantity>0);
ALTER TABLE payroll_input_batch ADD CHECK (approver_id IS NULL OR approver_id<>preparer_id);
ALTER TABLE pay_run ADD CHECK (approver_id IS NULL OR approver_id<>preparer_id);
ALTER TABLE expense_claim ADD CHECK (approver_id IS NULL OR approver_id<>claimant_id);
ALTER TABLE compensation_proposal ADD CHECK (approver_id IS NULL OR approver_id<>proposer_id);
ALTER TABLE pay_run_worker ADD CHECK (net=gross-deductions);
ALTER TABLE pay_period ADD CHECK (ends_on>starts_on);
ALTER TABLE opportunity ADD CHECK (probability>=0 AND probability<=1);
ALTER TABLE csat_response ADD CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE calendar_version ADD CHECK (week_mask BETWEEN 0 AND 127);
ALTER TABLE calendar_day ADD CHECK (working_minutes BETWEEN 0 AND 1440);
ALTER TABLE usage_counter ADD CHECK (used>=0 AND reserved>=0 AND hard_limit>=0);
-- used may exceed a newly lowered hard_limit after downgrade. New allocations must use the guarded UPDATE below.
ALTER TABLE usage_reservation ADD CHECK (quantity>0);
ALTER TABLE retention_policy ADD CHECK (retention_days>=0);
ALTER TABLE import_batch ADD CHECK(row_count BETWEEN 0 AND 1000), ADD CHECK(error_count>=0);
ALTER TABLE export_artifact ADD CHECK(row_count BETWEEN 0 AND 5000);
ALTER TABLE payment_evidence ADD CHECK (num_nonnulls(settlement_id,provider_export_id)=1);
ALTER TABLE activity ADD CHECK(num_nonnulls(client_id,contact_id,lead_id,opportunity_id)=1);
ALTER TABLE approval_request ADD CHECK(num_nonnulls(placement_id,leave_request_id,input_batch_id,pay_run_id,expense_claim_id,quote_id,lifecycle_case_id,offer_id)=1);
ALTER TABLE role_grant ADD CHECK (
 (scope_type IN ('tenant','self') AND num_nonnulls(entity_id,team_id,client_id,placement_id)=0) OR
 (scope_type='entity' AND entity_id IS NOT NULL AND num_nonnulls(entity_id,team_id,client_id,placement_id)=1) OR
 (scope_type='team' AND team_id IS NOT NULL AND num_nonnulls(entity_id,team_id,client_id,placement_id)=1) OR
 (scope_type='client' AND client_id IS NOT NULL AND num_nonnulls(entity_id,team_id,client_id,placement_id)=1) OR
 (scope_type='placement' AND placement_id IS NOT NULL AND num_nonnulls(entity_id,team_id,client_id,placement_id)=1));
ALTER TABLE milestone ADD CONSTRAINT milestone_context_key UNIQUE(tenant_id,id,placement_id);
ALTER TABLE placement_task ADD CONSTRAINT task_milestone_context FOREIGN KEY(tenant_id,milestone_id,placement_id) REFERENCES milestone(tenant_id,id,placement_id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX one_open_asset_assignment ON asset_assignment(tenant_id,asset_id) WHERE returned_at IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX one_effective_subscription ON subscription(tenant_id) WHERE state IN ('trial','active') AND deleted_at IS NULL;
CREATE INDEX due_jobs ON background_job(tenant_id,available_at,id) WHERE state IN ('pending','retryable_failed');
CREATE INDEX pending_outbox ON outbox_event(tenant_id,created_at,id) WHERE dispatched_at IS NULL;
CREATE INDEX overdue_tasks ON placement_task(tenant_id,owner_id,due_at,id) WHERE state IN ('pending','in_progress');
CREATE INDEX placement_original_cohort ON placement(tenant_id,original_planned_start,id) INCLUDE(actual_start,status,client_id,owner_id);
CREATE INDEX audit_retention_scan ON audit_event(tenant_id,occurred_at,id);
ALTER TABLE subscription ADD CHECK(ends_at IS NULL OR ends_at>effective_at);
ALTER TABLE entitlement_grant ADD CHECK(expires_at IS NULL OR expires_at>effective_at);
ALTER TABLE role_grant ADD CHECK(expires_at IS NULL OR expires_at>valid_from);
ALTER TABLE placement_task ADD CHECK(state<>'completed' OR (completed_at IS NOT NULL AND completed_by_id IS NOT NULL));
ALTER TABLE placement_task ADD CHECK(state<>'waived' OR (waiver_reason IS NOT NULL AND length(waiver_reason)>0 AND completed_by_id IS NOT NULL));
ALTER TABLE success_plan ADD CHECK(state NOT IN ('active','blocked','completed') OR started_at IS NOT NULL);
ALTER TABLE "employment_term" ADD CONSTRAINT "employment_term_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, employment_id WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);
ALTER TABLE "calendar_version" ADD CONSTRAINT "calendar_version_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, calendar_id WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);
ALTER TABLE "leave_policy_version" ADD CONSTRAINT "leave_policy_version_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, entity_id WITH =, policy_key WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);
ALTER TABLE "benefit_plan_version" ADD CONSTRAINT "benefit_plan_version_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, plan_id WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);
ALTER TABLE "rule_version" ADD CONSTRAINT "rule_version_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, pack_id WITH =, coverage_code WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);
ALTER TABLE "applicability_assignment" ADD CONSTRAINT "applicability_assignment_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, entity_id WITH =, domain_code WITH =, worker_category WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);
ALTER TABLE "organization_assignment" ADD CONSTRAINT "organization_assignment_no_current_overlap" EXCLUDE USING gist (tenant_id WITH =, employment_id WITH =, daterange(valid_from,valid_to,'[)') WITH &&) WHERE (superseded_at IS NULL AND deleted_at IS NULL);

CREATE OR REPLACE FUNCTION app.context_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE expected uuid; actual uuid;
BEGIN
 IF TG_TABLE_NAME='participant_grant' THEN
  SELECT client_id INTO expected FROM placement WHERE tenant_id=NEW.tenant_id AND id=NEW.placement_id;
  SELECT client_id INTO actual FROM contact WHERE tenant_id=NEW.tenant_id AND id=NEW.contact_id;
 ELSIF TG_TABLE_NAME='payroll_input' THEN
  SELECT p.entity_id INTO expected FROM payroll_input_batch b JOIN pay_period p ON p.tenant_id=b.tenant_id AND p.id=b.period_id WHERE b.tenant_id=NEW.tenant_id AND b.id=NEW.batch_id;
  SELECT entity_id INTO actual FROM employment WHERE tenant_id=NEW.tenant_id AND id=NEW.employment_id;
 ELSIF TG_TABLE_NAME='pay_run_worker' THEN
  SELECT employment_id INTO expected FROM employment_term WHERE tenant_id=NEW.tenant_id AND id=NEW.term_id;
  actual=NEW.employment_id;
 ELSIF TG_TABLE_NAME='expense_line' THEN
  IF NEW.currency<>(SELECT currency FROM expense_claim WHERE tenant_id=NEW.tenant_id AND id=NEW.claim_id) THEN RAISE EXCEPTION 'currency_context_mismatch' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='approval_step' THEN
  IF NEW.approver_id=(SELECT requester_id FROM approval_request WHERE tenant_id=NEW.tenant_id AND id=NEW.request_id) THEN RAISE EXCEPTION 'self_approval_forbidden' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='placement_task' THEN
  SELECT template_version_id INTO expected FROM placement WHERE tenant_id=NEW.tenant_id AND id=NEW.placement_id;
  SELECT template_version_id INTO actual FROM task_definition WHERE tenant_id=NEW.tenant_id AND id=NEW.definition_id;
 END IF;
 IF expected IS NULL OR actual IS NULL OR expected<>actual THEN RAISE EXCEPTION 'related_context_mismatch' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER context_integrity BEFORE INSERT OR UPDATE ON participant_grant FOR EACH ROW EXECUTE FUNCTION app.context_integrity();
CREATE TRIGGER context_integrity BEFORE INSERT OR UPDATE ON payroll_input FOR EACH ROW EXECUTE FUNCTION app.context_integrity();
CREATE TRIGGER context_integrity BEFORE INSERT OR UPDATE ON pay_run_worker FOR EACH ROW EXECUTE FUNCTION app.context_integrity();
CREATE TRIGGER context_integrity BEFORE INSERT OR UPDATE ON expense_line FOR EACH ROW EXECUTE FUNCTION app.context_integrity();
CREATE TRIGGER context_integrity BEFORE INSERT OR UPDATE ON approval_step FOR EACH ROW EXECUTE FUNCTION app.context_integrity();
CREATE TRIGGER context_integrity BEFORE INSERT OR UPDATE ON placement_task FOR EACH ROW EXECUTE FUNCTION app.context_integrity();

-- Append-only history must not be rewritten even by ordinary SQL paths.
-- Ledger/account and finalized-parent checks complement endpoint state machines.
CREATE OR REPLACE FUNCTION app.guard_locked_child() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_state text;
BEGIN
 IF TG_TABLE_NAME='pay_calculation_line' THEN
  SELECT r.state INTO parent_state FROM pay_run_worker w JOIN pay_run r ON r.tenant_id=w.tenant_id AND r.id=w.run_id WHERE w.tenant_id=NEW.tenant_id AND w.id=NEW.worker_id;
 ELSIF TG_TABLE_NAME='pay_run_worker' THEN
  SELECT state INTO parent_state FROM pay_run WHERE tenant_id=NEW.tenant_id AND id=NEW.run_id;
 ELSIF TG_TABLE_NAME='pay_run' THEN
  IF OLD.state='finalized' THEN RAISE EXCEPTION 'finalized_run_is_immutable' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 IF parent_state='finalized' THEN RAISE EXCEPTION 'finalized_run_is_immutable' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER locked_parent BEFORE UPDATE ON pay_run FOR EACH ROW EXECUTE FUNCTION app.guard_locked_child();
CREATE TRIGGER locked_parent BEFORE INSERT OR UPDATE ON pay_run_worker FOR EACH ROW EXECUTE FUNCTION app.guard_locked_child();
CREATE TRIGGER locked_parent BEFORE INSERT OR UPDATE ON pay_calculation_line FOR EACH ROW EXECUTE FUNCTION app.guard_locked_child();
ALTER TABLE participant_grant ADD CONSTRAINT participant_verified_identity FOREIGN KEY(tenant_id,contact_id,membership_id) REFERENCES contact_membership_link(tenant_id,contact_id,membership_id) ON DELETE RESTRICT;
ALTER TABLE rule_proposal ADD CHECK(legal_reviewer_id IS NULL OR engineering_reviewer_id IS NULL OR legal_reviewer_id<>engineering_reviewer_id);
ALTER TABLE placement ADD CHECK(status<>'started' OR actual_start IS NOT NULL);
CREATE OR REPLACE FUNCTION app.guard_published() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_state text;
BEGIN
 IF TG_TABLE_NAME='placement' THEN
  IF NEW.original_planned_start<>OLD.original_planned_start THEN RAISE EXCEPTION 'original_plan_is_immutable' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='template_version' THEN
  IF OLD.state='published' THEN RAISE EXCEPTION 'published_template_is_immutable' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='task_definition' THEN
  SELECT state INTO parent_state FROM template_version WHERE tenant_id=NEW.tenant_id AND id=NEW.template_version_id;
  IF parent_state='published' THEN RAISE EXCEPTION 'published_template_is_immutable' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='payroll_input_batch' THEN
  IF OLD.approved_at IS NOT NULL AND
     (to_jsonb(NEW)-ARRAY['state','updated_at','version'])<>(to_jsonb(OLD)-ARRAY['state','updated_at','version']) THEN
     RAISE EXCEPTION 'approved_inputs_are_immutable' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
 ELSIF TG_TABLE_NAME='payroll_input' THEN
  IF EXISTS(SELECT FROM payroll_input_batch WHERE tenant_id=NEW.tenant_id AND id=NEW.batch_id AND approved_at IS NOT NULL) THEN RAISE EXCEPTION 'approved_inputs_are_immutable' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER published_guard BEFORE UPDATE ON placement FOR EACH ROW EXECUTE FUNCTION app.guard_published();
CREATE TRIGGER published_guard BEFORE UPDATE ON template_version FOR EACH ROW EXECUTE FUNCTION app.guard_published();
CREATE TRIGGER published_guard BEFORE INSERT OR UPDATE ON task_definition FOR EACH ROW EXECUTE FUNCTION app.guard_published();
CREATE TRIGGER published_guard BEFORE UPDATE ON payroll_input_batch FOR EACH ROW EXECUTE FUNCTION app.guard_published();
CREATE TRIGGER published_guard BEFORE INSERT OR UPDATE ON payroll_input FOR EACH ROW EXECUTE FUNCTION app.guard_published();
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.tenant_id() TO app_runtime,app_retention;
GRANT EXECUTE ON FUNCTION app.guard_record(),app.context_integrity(),app.guard_locked_child(),app.guard_published() TO app_runtime,app_retention;
COMMIT;

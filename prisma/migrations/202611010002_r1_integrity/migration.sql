-- CreateTable
CREATE TABLE "team_membership" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "membership_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "team_membership_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE INDEX "team_membership_tenant_id_team_id_idx" ON "team_membership"("tenant_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_membership_tenant_id_membership_id_team_id_key" ON "team_membership"("tenant_id", "membership_id", "team_id");

-- AddForeignKey
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_tenant_id_team_id_fkey" FOREIGN KEY ("tenant_id", "team_id") REFERENCES "team"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE team_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_membership FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON team_membership TO app_runtime,app_retention USING (tenant_id=app.tenant_id()) WITH CHECK (tenant_id=app.tenant_id());
GRANT SELECT,INSERT,UPDATE ON team_membership TO app_runtime;
CREATE TRIGGER guard_record BEFORE UPDATE OR DELETE ON team_membership FOR EACH ROW EXECUTE FUNCTION app.guard_record('mutable');
ALTER TABLE team_membership ADD CHECK (version>0);
ALTER TABLE role_grant ADD CHECK ((scope_type='tenant' AND entity_id IS NULL AND team_id IS NULL AND client_id IS NULL AND placement_id IS NULL) OR (scope_type='self' AND entity_id IS NULL AND team_id IS NULL AND client_id IS NULL AND placement_id IS NULL) OR (scope_type='entity' AND entity_id IS NOT NULL AND team_id IS NULL AND client_id IS NULL AND placement_id IS NULL) OR (scope_type='client' AND client_id IS NOT NULL AND entity_id IS NULL AND team_id IS NULL AND placement_id IS NULL) OR (scope_type='placement' AND placement_id IS NOT NULL AND entity_id IS NULL AND team_id IS NULL AND client_id IS NULL));
ALTER TABLE legal_entity ADD CHECK (country_code ~ '^[A-Z]{2}$' AND default_currency ~ '^[A-Z]{3}$');
ALTER TABLE placement ADD CHECK (current_planned_start>=accepted_on AND original_planned_start>=accepted_on AND ((status='started' AND actual_start IS NOT NULL AND actual_start>=accepted_on) OR (status<>'started' AND actual_start IS NULL)));
ALTER TABLE placement_task ADD CHECK ((state='completed' AND completed_at IS NOT NULL AND completed_by_id IS NOT NULL AND completion_evidence_reference IS NOT NULL) OR (state='waived' AND completed_at IS NOT NULL AND completed_by_id IS NOT NULL AND waiver_reason IS NOT NULL) OR (state IN ('pending','in_progress') AND completed_at IS NULL AND completed_by_id IS NULL));
ALTER TABLE task_definition ADD CHECK (due_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND due_offset_days BETWEEN -365 AND 365);
ALTER TABLE retention_policy ADD CHECK (retention_days BETWEEN 1 AND 36500);
ALTER TABLE saved_view ADD CHECK ((visibility='private' AND team_id IS NULL) OR (visibility='team' AND team_id IS NOT NULL));
CREATE FUNCTION app.check_placement_context() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NOT EXISTS (SELECT 1 FROM client_account c WHERE c.tenant_id=NEW.tenant_id AND c.id=NEW.client_id AND c.entity_id=NEW.entity_id) THEN RAISE EXCEPTION 'placement_client_entity_mismatch' USING ERRCODE='23514'; END IF; RETURN NEW; END $$;
CREATE TRIGGER placement_context BEFORE INSERT OR UPDATE ON placement FOR EACH ROW EXECUTE FUNCTION app.check_placement_context();
CREATE FUNCTION app.check_task_context() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NOT EXISTS (SELECT 1 FROM milestone m WHERE m.tenant_id=NEW.tenant_id AND m.id=NEW.milestone_id AND m.placement_id=NEW.placement_id) OR NOT EXISTS (SELECT 1 FROM task_definition d JOIN placement p ON p.tenant_id=d.tenant_id AND p.template_version_id=d.template_version_id WHERE p.tenant_id=NEW.tenant_id AND p.id=NEW.placement_id AND d.id=NEW.definition_id) THEN RAISE EXCEPTION 'task_context_mismatch' USING ERRCODE='23514'; END IF; RETURN NEW; END $$;
CREATE TRIGGER task_context BEFORE INSERT OR UPDATE ON placement_task FOR EACH ROW EXECUTE FUNCTION app.check_task_context();
CREATE FUNCTION app.guard_published_definition() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF EXISTS (SELECT 1 FROM template_version WHERE tenant_id=OLD.tenant_id AND id=OLD.template_version_id AND state='published') THEN RAISE EXCEPTION 'published_definition_immutable' USING ERRCODE='23514'; END IF; RETURN NEW; END $$;
CREATE TRIGGER published_definition BEFORE UPDATE ON task_definition FOR EACH ROW EXECUTE FUNCTION app.guard_published_definition();

-- Read only the context columns required by existing source-integrity triggers.
GRANT SELECT (id,tenant_id,placement_id) ON milestone TO app_retention;
GRANT SELECT (id,tenant_id,template_version_id) ON task_definition TO app_retention;
GRANT SELECT (id,tenant_id,entity_id) ON client_account TO app_retention;

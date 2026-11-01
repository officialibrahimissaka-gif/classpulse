-- Additional explicitly bounded subject-erasure fields and durable cleanup manifest.
GRANT SELECT,DELETE ON placement_transition,placement_date_revision,readiness_decision TO app_retention;
GRANT SELECT ON placement_task,outbox_event TO app_retention;
GRANT UPDATE (label,completion_evidence_reference,waiver_reason,version) ON placement_task TO app_retention;
GRANT INSERT ON outbox_event TO app_retention;
GRANT UPDATE (dispatched_at,version) ON outbox_event TO app_retention;

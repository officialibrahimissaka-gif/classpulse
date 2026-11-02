-- Additive, immutable snapshot summary; legacy snapshots are not backfilled or rewritten.
ALTER TABLE report_snapshot ADD COLUMN summary jsonb;
ALTER TABLE report_snapshot ADD CONSTRAINT report_snapshot_summary_shape CHECK(summary IS NULL OR (jsonb_typeof(summary)='object' AND summary->>'schemaVersion'='1' AND summary ? 'metrics' AND summary ? 'drilldowns' AND summary ? 'distribution' AND summary ? 'rowCount'));
-- Existing forced RLS, composite ownership and append-only guard remain in force.

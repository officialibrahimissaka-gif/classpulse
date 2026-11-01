-- Expiring encrypted staging only. No source placement/person deletion is granted.
GRANT SELECT,DELETE ON import_error,import_batch TO app_retention;

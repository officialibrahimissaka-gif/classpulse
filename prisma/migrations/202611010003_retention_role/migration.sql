-- Narrow maintenance capability; never granted to the web or queue login.
GRANT SELECT (id,entitlement_revision,data_revision) ON tenant TO app_retention;
GRANT UPDATE (data_revision) ON tenant TO app_retention;
GRANT SELECT ON privacy_request,legal_hold,candidate,contact,placement,contact_membership_link,principal,membership,session,invitation,participant_grant,report_run,download_grant,export_artifact,report_result_row,report_metric_binding,report_snapshot TO app_retention;
GRANT UPDATE (state,completed_at,version) ON privacy_request TO app_retention;
GRANT UPDATE (display_name,work_email,source_profile,source_key,version) ON candidate TO app_retention;
GRANT UPDATE (source_profile,source_key,version) ON placement TO app_retention;
GRANT UPDATE (state,issuer,subject,version) ON principal TO app_retention;
GRANT UPDATE (status,display_name,work_email,membership_revision,version) ON membership TO app_retention;
GRANT UPDATE (revoked_at,version) ON session,participant_grant TO app_retention;
GRANT UPDATE (recipient_ciphertext,email_hash,token_hash,revoked_at,version) ON invitation TO app_retention;
GRANT UPDATE (display_name,work_email,work_phone,version) ON contact TO app_retention;
GRANT UPDATE (snapshot_id,state,version) ON report_run TO app_retention;
GRANT DELETE ON download_grant,export_artifact,report_result_row,report_metric_binding,report_snapshot TO app_retention;
GRANT INSERT ON deletion_tombstone,audit_event TO app_retention;

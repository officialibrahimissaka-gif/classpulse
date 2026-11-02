# Risk register

2 November 2026. Reconstructed from SECURITY_AUDIT.md, COMPLIANCE_GAP_ANALYSIS.md, launch results and current runtime evidence. Severity is inherited/qualitative; probability and monetary loss are unmeasured, not fabricated. Owners are accountable functions, with named approvers still unassigned. **Production/commercial launch remains NO-GO.**

| ID / linked findings | Severity / state | Risk and dependency | Remediation / closure evidence / owner |
|---|---|---|---|
| CONT-R001 / P6-B01 | High / blocked | Real identity, MFA, session/provider assertions unverified | Actual approved OIDC/Cognito positive/negative/federation/device evidence + independent security signoff; identity/platform |
| CONT-R002 / P6-B02, P7-B01 | High / blocked | No real cloud/domain/secret bindings; IAM/TLS/mail/storage/egress/renderer controls unproven | Account/domain/budget/change-set access, isolated staging, verified KMS/version/transport/ingress/provider/resource controls; platform/security |
| CONT-R003 / P6-B03 | High / blocked | Restore/deletion-tombstone/rotation/regional recovery evidence absent | Timed isolated managed DB/object restore, privacy replay, actual RPO/RTO + incident exercise; SRE/privacy |
| CONT-R004 / P6-B04 | High / blocked | Applicable Ghana/UAE legal regime, transfer/terms and complete source rights/retention/scoped holds unresolved | Named counsel/privacy review, complete tested lifecycle/response procedures; legal/privacy/backend |
| CONT-R005 / P6-B05 | High / open | Operational access/audit completeness and external tamper evidence incomplete | Tenant-approved time-bounded operator controls, dedicated workload roles and actual auth/denial/audit/alert reconciliation; security/platform |
| CONT-R006 / P7-B02 | High / blocked | Test-only payment adapter is not a recurring invoice/settlement system | Real merchant/test contracts + reviewed recurring subscription/inbox/signature/dedup/replay/dunning/refund/invoice/tax/settlement flows before live keys; billing/security/legal/accountant |
| CONT-R007 / P6-G01 | Medium / local remediation | Different export snapshots could contradict dashboard/history | CONT-T001 implements immutable summary/reuse/current-source checks; CONT-SNAP01–06 plus complete gate. Deployed/manual review not implied; reporting/QA |
| CONT-R008 / P6-G02 | Medium / open | Imported record provenance, source revision and correction/conflict trace incomplete | CONT-T002 next internal slice; additive history-preserving design + tenant/privacy/stale/duplicate tests; backend/product |
| CONT-R009 / P6-G03/G04 | Medium / open | Manual accessibility/tagged PDF, read-only/freshness/least privilege and classification alignment incomplete | Manual assistive-tech review, exact UI/policy acceptance and controlled classification migration; UX/QA/data governance |
| CONT-R010 / P6-G05 | Medium / unverified | Local load results do not prove sustained multi-tenant availability/capacity or queue resilience | Actual staging resource/soak/fault/queue/alert evidence; SRE/performance |
| CONT-R011 / P6-G06 | Medium / open | Development lint dependency DoS advisory remains despite clean production audit | Compatible reviewed tooling remediation or explicit bounded residual decision + full retest; build/security |
| CONT-R012 / REQ-L002, P7-G01 | High commercial / unvalidated | Product demand, procurement acceptance of Ghana/GHS and sustainable recurring economics unknown | Customer discovery/counterexamples, named lawful artifacts/commitments and actual approved collected payments; founder/product |
| CONT-R013 / governance | Medium / mitigated by reconstruction | Missing management records could hide blockers or imply imaginary approvals | Five evidence-linked files created; maintain current status/assumptions/decisions and honest ownership; engineering/founder |

Do not waive critical/high security, integrity or financial risks through a document checkbox. Update evidence links and disposition after actual retest/signoff. One locally closed medium finding does not close the release milestone or permit live processing/outreach/deployment.

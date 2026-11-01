# Known limitations

Updated 2026-11-01. The local agency workflow is implemented; production release remains gated.

- R1 is agency accepted-placement coordination in English. Full HRMS/HCM/ATS, employee documents, payroll, translated Arabic/RTL interfaces, native ATS connectors, public APIs, scheduled reports and payment processing are unavailable.
- Local identities are explicitly unverified, forbidden in production, and cannot satisfy MFA-sensitive actions. SMTP Mailpit and private local files are development adapters. OIDC/Cognito, SES and S3 code exists, but no live cloud credentials/bindings are configured or independently verified.
- Country/authority/retention configuration is a customer attestation, not a compliance pack or legal calculation. Final customer terms, lawful processing and jurisdiction/service applicability need legal review.
- Unit/native PostgreSQL/browser checks exercise synthetic local data. Managed-cloud deployment, container image operation, external provider MFA/delivery/storage/KMS/residency, production performance targets, PITR/object restore and incident drills are not certified by these tests.
- Provider acceptance does not establish recipient delivery. Ambiguous SMTP/SES outcomes and interrupted jobs require operator review; no blind duplicate send occurs. Orphan-object reconciliation after a process crash remains operational work.
- Seven-day report and one-day staging cleanup uses an explicitly selected tenant and separate maintenance credential. Reviewed erasure is resumable and blocks active work/legal holds. Source retention disposition, complete subject access/correction, customer-entered free text, external system/email copies and backup expiry/tombstone replay still need operational/legal review before certifying a privacy response. No automatic hold release or unreviewed source purge is enabled.
- The initial release serializes writes per tenant, caps report exploration at 10,000 relevant records and each export at 5,000 rows and CSV at 1,000 rows/10 MiB, and uses keyset pages of at most 100 for source lists. Measure production load before increasing these envelopes. Bulk import is limited by actual plan capacity, not just file size.
- Key rotation/re-encryption, tamper-evident external audit archival and granular production operator JIT/IAM bindings require deployment review. Bootstrap and maintenance credentials must never enter web/worker workloads. The rate limiter ignores client IP headers by default; enabling TRUST_INGRESS_IP requires independently verified private ingress that overwrites X-Real-IP.
- The pinned Prisma/pg combination emits a pg deprecation warning about adapter queries on an occupied connection. Tests pass; do not upgrade to pg 9 without compatibility review. This warning is not suppressed.
- The final production dependency audit reports zero vulnerabilities after replacing ExcelJS’s vulnerable transitive dependency stack. Audit results are time-sensitive; rerun the security gate with every dependency change.
- Founder interviews, named buyer commitments/payment evidence, independent security/privacy/legal approval and production recovery/residency checks have not been supplied. Local completion does not establish market validation or authorize publication/deployment.

## Phase 6 release blockers

The current verdict is **NO-GO**. See [release checklist](RELEASE_READINESS_CHECKLIST.md) and [requirement-level results](TEST_RESULTS.md). Existing source/worker tests pass after remediation, but cross-format reuse of one snapshot, full imported-source provenance/correction, complete subject-rights/retention workflows, operator approval/audit archival, manual assistive technology and tagged-PDF review remain incomplete. C2 report classifications need alignment with the approved S0–S3 scheme. Measured local 20-user latency and 5,000-row exports do not certify sustained multi-tenant production performance or availability.

- P6-G06: full-tree dependency scan finds 16 moderate affected development lint-tool nodes (minimatch DoS); production dependencies remain clean. Compatible remediation and full retest remain open.

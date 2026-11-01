# R1 operations runbook

## Credentials and deployment gate

Web: `classpulse_app` → `app_runtime` only. Dispatcher: separate directory-only login. Worker uses runtime plus directory credentials, never migration/retention credentials. Maintenance: `classpulse_retention` → `app_retention` only; it cannot enumerate the directory and requires an explicit tenant identifier. Bootstrap/migration owner credentials never enter an application container.

The repository includes Docker web/worker targets and CI, but no cloud account/identity/storage/mail binding has been provisioned or live-verified. Do not publish/deploy from this task. Before production: independently verify UAE service availability/residency, Cognito MFA/direct identity assumptions, OIDC callback/client controls, private versioned S3/KMS/IAM, SES sender/retention, PostgreSQL runtime roles/TLS/backups, Redis TLS/network isolation, ingress/body/timeouts/rate-limit header trust, monitoring/alerts, and restore/incident exercises. Obtain customer/legal/security release reviews separately.

`GET /api/health` checks database and Redis; it does not certify external provider health. Worker `/health` is process liveness and must be private. Monitor job age/state, outbox backlog, failed/ambiguous deliveries, report generation age, storage cleanup age and audit error rate. Logs contain operation/correlation IDs, never raw bodies/tokens or personal data. Configure ingress to log paths without OIDC callback query strings.

## Local services

Use `scripts/local-env.ts` once and preserve the generated keys. Start Compose with `.local/docker.env`; web `npm run dev`, worker `npm run worker`. Mailpit is a local SMTP capture service; provider acceptance is not recipient delivery. No fake production provider is presented. Stop Compose without `-v` to retain local data. `reset-empty-local.ts` refuses a populated tenant table and is not a production migration strategy.

## Accepted commercial orders

Record the owner’s commercial request first. A billing operator independently verifies the accepted order and plan capacity; this is not payment-provider verification. Run `npx tsx scripts/accept-order.ts /private/reviewed-order.json` in a separate controlled task. The JSON contains tenantId, requestId, orderReference, operatorReference, effectiveAt (reviewed UTC timestamp), and `acceptedOrderVerified: true`. Use a dedicated `BILLING_DATABASE_URL` in production; local bootstrap credentials are accepted only for local setup. Never run the command merely to bypass MFA/trial restrictions.

The operation atomically applies the reviewed upgrade/downgrade/cancellation at or after its explicit effective time, records the order reference/audit and increments entitlement revision. Downgrades retain over-capacity records and block new allocations; reductions and reads remain possible. Cancellation stops writes at term end and preserves the 30-day read/export window. It retains module state; read-only modules are explicitly reactivated after fresh MFA. It does not charge money or claim a payment succeeded. Future-dated changes are rejected until due; a controlled scheduler/operator runs them at the reviewed renewal/term-end time. No refund/proration/payment terms are inferred and no self-service billing provider is enabled.

## Ambiguous jobs and delivery

PostgreSQL is authoritative. BullMQ carries tenant/job identifiers, not raw message bodies, invite tokens or source rows. Workers re-check current membership, scopes, modules and exit windows. A durable `sending` intent is committed before SMTP/SES. Never blindly retry a send that may have succeeded: inspect the provider reference and durable delivery/job state. `accepted_by_provider` does not mean delivered. A crash after external acceptance and before the acknowledgement is deliberately an operational review case.

Reports use queued → generating → ready/failed. A non-ready interrupted attempt becomes review-required rather than silently reporting completion. Generate a new report after reviewing an interrupted attempt; it gets a fresh immutable snapshot. An orphan artifact from a crash must be discovered during storage reconciliation/expiry review. Do not treat a queue ACK as proof of a completed report or message.

## Privacy and retention

An owner records verified requests and legal holds after fresh MFA. Reviewed deadlines and retention disposition are human/legal decisions, not encoded legal calculations. The conservative operator workflow blocks whenever **any** tenant legal hold is active; it also blocks candidate erasure with active placements and contact erasure linked to internal employment identities. Releasing/narrowing a hold requires a separate authorized legal process; no automatic expiry releases it.

`npx tsx scripts/execute-erasure.ts /private/reviewed-erasure.json` requires the separate `RETENTION_DATABASE_URL` credential. Input: tenantId, requestId, subjectType (candidate/contact), subjectId, operatorReference, retentionDispositionReference, and `lawfulErasureReviewed: true`. It validates the verified request/hash, holds and active work, pseudonymizes bounded source fields, removes reason/evidence history where required for the subject, invalidates all tenant-derived reports and staging, appends a tombstone/audit and records a cleanup manifest. The manifest contains private object references, not source rows. Repeating the same completed operation is safe. An object-deletion failure leaves `erased_pending_storage`; rerun the same reviewed request to resume its manifest. Candidate/person source deletion is not granted to the runtime.

`npx tsx scripts/cleanup-expired.ts TENANT_UUID` uses the same separate maintenance identity and removes only expired report artifacts/snapshots and one-day encrypted import staging for the explicitly selected tenant. It aborts for a legal hold. Run daily from a controlled scheduler with an authorized tenant list, and inspect failures. It does not automatically erase placement/person sources: a reviewed policy/disposition is required. Physical orphan-object reconciliation, provider logs, inbound/outbound email copies, and customer-controlled backups require separate operational handling.

The erasure scope is bounded known R1 fields. Review customer-entered free text, custom template labels and external/source systems for other copies before certifying a data-subject response. Do not promise that live pseudonymization deletes a recipient’s inbox or a third party’s system.

## Backup, restore and incident review

Before a production release, demonstrate encrypted PITR plus object-version restore into an isolated cell, verify tenant isolation with non-owner identities, and replay deletion tombstones before making restored data accessible. Revoke sessions, invitation hashes and exposed encryption/signing keys as applicable. Preserve legal holds. Test restore against the approved RPO/RTO; this repository’s local test success is not a measured managed-cloud recovery guarantee.

For an incident, isolate ingress/workloads, revoke affected sessions/roles and provider grants, preserve scoped audit evidence, identify the affected tenants/data and involve the designated security/privacy responders. Apply jurisdiction-specific notification advice through legal review; the code does not invent notification deadlines. Production key rotation/re-encryption needs an approved migration/key-ring design before operation.

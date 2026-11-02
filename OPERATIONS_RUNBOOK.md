# Launch operations runbook

2 November 2026. Operational procedures, not evidence of a running production service. **NO-GO remains.** Existing application procedures are preserved in [R1 operations](docs/OPERATIONS_RUNBOOK.md); this file adds launch ownership, monitoring, billing, release and recovery control.

## Ownership and coverage

Before cutover name primary and secondary people for incident command, platform/on-call, application engineering, security/privacy, billing reconciliation, customer support and communications. A role label is not staffed coverage. Record contact routes in an access-controlled roster, test escalation and define coverage honestly; no 24/7 support or SLA is sold by the current draft. Support channels/response commitments remain unset until staffed.

## Monitoring and alerting

| Signal | Collection / proposed threshold | Responder and action |
|---|---|---|
| Core API availability | External regional HTTPS synthetic tenant-safe check every 60s; >=3 failed checks proposed page | SRE: distinguish dependency/auth/ingress failure, check deployment and contain. Synthetic service not provisioned. |
| ALB target 5xx | Template CloudWatch sum >5/min for 3 periods | SRE/application: correlate release/error IDs; never inspect bodies by default. Threshold is provisional. |
| Application error / denials | Redacted `request_failed` / `security.denied` JSON metric filters >5 / >30 in a minute | Application/security: investigate correlated failures or authorization attack; missing auth-success audit remains B05. |
| Database CPU/storage | Template average >80% / free storage <5 GiB for 3 minutes | SRE: inspect connections/locks/slow query shape; bounded pool and tenant workloads before scaling. |
| Queue age / review-required jobs | Dedicated scoped job inspection; propose oldest due >5min or any needs_review | Worker owner: correlate PostgreSQL source, durable intent and provider result. Export/digest jobs never blindly replay. Queue metric exporter/alerts remain incomplete. |
| Usage/capacity | Authorized `/api/v1/me` counters; reconcile reservations and limits weekly | Support/product: discuss plan request without granting hidden overages or deleting retained records. Fleet monitoring remains to implement. |
| Delivery | SES sending/bounce/complaint metrics, signed provider events after review | Mail owner: suppress appropriate recipients, pause affected sends, reconcile ambiguous acceptance. Delivery event integration is not implemented. |
| Billing | Paystack test verification job and audited owner view | Billing: verify reference/customer/GHS minor amount, investigate duplicates/reversals. No live revenue or entitlement automation. |
| Recovery/retention | Backup age, oldest snapshot/version, last successful restore drill and erasure-manifest age | SRE/privacy: page for missing daily backup/failed cleanup; inspect legal holds. Automatic inventory alarms not yet implemented. |

SNS email subscription requires recipient confirmation and an actual delivered test alarm. CloudWatch logs retain 30 days in the draft; legal/security must review whether this policy fits each log purpose. Avoid callback query strings, invite fragments, tokens, payment links, customer emails and request/response bodies. The initial error tracking is redacted JSON plus metric alerts; no Sentry account or complete distributed tracing is configured. Template alarms are definitions, not monitored coverage.

## Incident severity and response

P1: suspected tenant escape, key exposure, data loss, destructive processing or widespread outage. P2: material tenant/workflow failure, sustained latency or ambiguous financial/provider effects. P3: isolated recoverable UI/report defect. Targets for acknowledgement/restoration must be agreed with the staffed roster, not invented as customer promises.

1. Declare incident, record UTC detection/time, incident ID, commander and affected environments; stop release/campaign work.
2. Contain narrowly: pause affected workers or ingress, revoke exposed sessions/provider credentials and preserve tenant-scoped evidence. Suspected financial duplication: stop checkout/verification operators and preserve provider references; never charge again to test.
3. Identify scope using redacted events and least-privilege approved access. No broad support SQL exports or copying live data to development.
4. Engineering produces a reversible repair/forward migration. Security/privacy/legal assesses affected people/contracts and any jurisdiction-specific notification obligations; this runbook prescribes no universal statutory deadline.
5. Verify tenant/entitlement invariants, durable provider state and reconciliation. Obtain commander/security approval before resuming side effects.
6. Communicate reviewed facts through the designated owner, then document root cause, impact, timeline, prevention owner/due date and evidence. No outreach or incident notification was sent in this task.

## Deployment, rollback and migration

Use immutable digests and protected account/environment approvals. Migration task has owner URL; web/worker never do. Review expand/contract SQL before execution. If new code fails and schema remains compatible, restore prior web/worker task definitions and verify health/queue effects. Never infer that downgrading code reverses a destructive schema migration. Data restoration is an incident decision with explicitly accepted loss/reconciliation, not routine application rollback. The provided workflow deploys dark candidate stacks only; live cutover remains a separate controlled procedure.

## Backup and disaster recovery exercise

Record environment/source/digests, incident scenario, backup/object version timestamps, last committed data marker, recovery start/end and approved data-loss boundary. Restore DB and artifacts into an isolated cell with ingress and mail/payment jobs disabled. Apply required schema; replay current out-of-band deletion tombstones and preserve legal holds before any user can read. Invalidate sessions/invitations, reconcile queue/outbox/ambiguous provider effects and rebuild Redis only from PostgreSQL authoritative queued work. Verify row counts, object hashes, tenant/RBAC negative cases, quotas, central KPIs and exports. Obtain privacy/security approval, then enable only safe effects and controlled traffic. Measure actual RPO/RTO against ≤24h/≤8h; no such drill has occurred.

Same-region loss: Multi-AZ mitigates an AZ failure, not a regional outage. An alternate region requires explicit residency/transfer/legal approval and a tested restoration plan; otherwise document that regional recovery is not covered. Inventory/delete retained snapshots, S3 noncurrent versions and support copies according to approved holds/retention. Do not claim 35-day deletion simply because automated RDS retention is 35 days.

## Billing and support reconciliation

The Paystack secret belongs only to a separate billing task. `scripts/create-test-checkout.ts` verifies a monthly GHS test plan and writes its hosted checkout URL to a new mode-0600 private file; it is not a public purchase button. Treat an initialization timeout as unknown and verify the same reference before retrying. `scripts/sync-paystack.ts` fetches Paystack `/transaction/verify/:reference`, checks the reviewed customer, currency and integer amount, then writes an isolated observation/audit. A repeated exact reference is one record; changed amount/customer and terminal-state regressions fail review. Reversals are observed, not automatically refunded or used to revoke data. Live keys are rejected by code. Browser callbacks are never proof of payment. Public Paystack webhook ingestion is deliberately absent; no signature-verification claim is made.

Invoices/tax receipts, failed recurring collections, cancellations, refunds and disputes remain provider/operator-controlled and need implementation and legal/accountant review before paid launch. Test observations are not invoices, revenue recognition or settled cash. The existing accepted-order command separately applies reviewed plan changes at their effective time; it does not verify payment and must never be auto-run from a callback. Professional-service requests require an agreed scope/price, never an unimplemented add-on entitlement.

Support intake procedure: request tenant slug, incident time, safe operation ID, business impact and reproduction; never ask for passports, bank/card details, tokens or whole candidate dumps. Record priority, accountable owner, customer-visible update and resolution in the approved restricted support tracker once selected. Support product/ticket ingestion is not implemented. Privacy/billing/security cases go to their dedicated owner; customer consent and expiring operator access are required before inspecting tenant records.

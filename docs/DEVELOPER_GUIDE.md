# R1 developer guide

## Boundaries and source of truth

`src/platform` contains configuration, cryptography, sessions, policy, transactions, storage/mail and queue plumbing. `src/domain` implements R1 use cases. `src/app/api` is the internal versioned HTTP adapter; client components use HTTP and never import the database. `src/operations` is maintenance-only and must not be imported by web/worker entry points.

Next.js generated `AGENTS.md` is retained. The installed Next.js 16 route-handler, async-cookie and proxy guides were reviewed; proxy supplies headers only and never replaces server authorization.

The deployable schema is `prisma/r1/schema.prisma` (56 FK-closed models). `prisma/schema.prisma`, `prisma/constraints.sql` and root `openapi.yaml` remain full-vision design artifacts. Every schema change has a reviewed immutable migration and checksum. `prisma.config.ts` targets the R1 schema. Generated client files are ignored and rebuilt.

## Transaction and access contract

Set tenant context with `tenantTransaction`; never use a customer model outside it. The runtime login is not an owner/superuser/BYPASSRLS role. Every customer table has FORCE RLS and every child key includes tenant ownership. RLS supplements application predicates; it does not protect against a fully compromised runtime setting another tenant context.

Every request reloads active principal/membership/role grants, session revision, module/subscription state and applicable scope. Tenant-wide administrative permissions require tenant-scoped grants. Mutations validate Origin, CSRF, Zod input, idempotency and record versions. The initial release serializes business writes per tenant with a tenant row lock; reads share the same module fence. This simple policy prevents module-disable races and scope-revision races at pilot scale. Benchmark before increasing write concurrency; a future lock partition needs equivalent fencing proofs.

Mutable rows increment `version`; SQL rejects missing increments, changed identity and append-history updates. Critical source/task/quota/audit/outbox changes commit together. Usage gauges update atomically with the command, so no long-lived reservation is required for synchronous writes/imports. Background attempts keep durable job/delivery records; Redis is transport, not the job ledger.

## Interfaces and correctness

- Requests are bounded streams, not trust in Content-Length. CSV has a second 10 MiB/1,000-row/8 KiB-record envelope, fixed columns and formula-prefix rejection.
- Idempotency keys bind actor, operation and canonical input. Replays return a resource acknowledgement (`version: 0`, `state: replayed`) and require a fresh GET for current record state. Current permission/module checks precede replay.
- `If-Match: "vN"` is required for placement decisions, task completion and ownership changes.
- Dates representing employment events use SQL `date`; timestamps use UTC `timestamptz`. Task due instants derive from an explicit IANA zone and configured local time, rejecting DST gaps/ambiguities. Money calculation is absent; do not introduce floating-point monetary logic.
- KPI formulas live in `analytics.ts`; views and exports use the same values. A report snapshot is immutable, scope-bound and expires. A mutable `ReportRun` represents generation progress separately.
- XLSX is bounded OOXML produced with fflate, all strings encoded as literal inline cells; an independent reader tests interoperability and Unicode. This replaces ExcelJS because its transitive dependencies had moderate advisories. PDF embeds a licensed Unicode font; CSV escapes spreadsheet formulas.
- Private objects are served through an authenticated proxy with current scope/hash/expiry/content-integrity checks. No naked presigned URLs. Source-erasure/ownership changes invalidate old report scope hashes.

## Local and production configuration

`.env.local` is the web/runtime configuration; `.local/worker.env` contains only the dispatcher directory login; `.local/retention.env` contains a separate maintenance login; `.local/admin.env` is bootstrap/migration-only. Never mount bootstrap or maintenance files into web/worker containers. Local setup preserves existing keys. Rotate encryption keys only with a reviewed re-encryption/session/invitation migration; key rings are not implemented.

Production requires HTTPS/OIDC/S3/SES. MFA authorization fails closed unless the configured direct Cognito pool has mandatory MFA, remembered-device configuration is absent, the issuer matches, auth_time is recent and the identity is not federated through an unverified upstream. These live provider assumptions require independent validation. Developer identities never satisfy MFA and cannot run under production NODE_ENV.

Trusted ingress must overwrite X-Real-IP and remove client-supplied identity/forwarding headers before requests reach the application; the limiter ignores X-Real-IP by default; set TRUST_INGRESS_IP=true only for the verified private ingress. Set request timeouts and the ingress body cap to match the application envelope. Do not publicly expose database, Redis, Mailpit or worker health ports.

## Quality and safe change workflow

Confirm linked requirements/acceptance criteria, add a tracked migration, implement policy/use case/API/UI/tests, update trace/status/user docs, then run `npm run check`. Do not mark the original design’s entire acceptance catalog as executed: the mapping distinguishes local evidence, deferred vision, and external release review.

Tests use native PostgreSQL and real local SMTP/storage. No production provider integration is simulated as delivered service. The migration gate replays every migration into a fresh disposable database, checks Prisma drift and FORCE RLS, then drops only that generated test database.

Phase 6 adds fail-closed checks for both NODE_ENV=production and APP_ENV=production, configured provider identifiers and TLS Redis. Export source rows are capped at 5,000 (report exploration remains bounded to 10,000). See TEST_RESULTS.md and SECURITY_AUDIT.md for release disposition.

## Phase 7 commercial and deployment increment

`/pricing` renders the centrally defined proposed GHS catalog. `/billing` reads owner-authorized `/api/v1/billing` (no-store, current tenant/session, `billing.manage`, audited inspection); it is a test payment observation view, not an invoice ledger. The eighth migration adds forced-RLS `billing_connection` and `billing_payment`; runtime may only SELECT. `app_billing_importer` cannot read subscriptions, grant entitlements or change bound customers/amount/currency. Neither new table accepts card details. Payment references and commercial observations are confidential financial metadata; their retention/rights/audit classification needs legal/data review before live use.

Paystack key material is never an argument, checked-in configuration or browser variable. Configure `PAYSTACK_SECRET_KEY` through a secure isolated test-job secret binding; only `sk_test_…` is accepted. No key was available or used in this phase. The following commands use **private** files, never repository fixtures containing real customer data:

```bash
npx tsx scripts/create-test-checkout.ts /private/reviewed-checkout.json /private/new-test-checkout.json
npm run billing:sync -- /private/reviewed-payment.json
```

Checkout input: customerEmail, planCode (`PLN_…`), unique reference, positive safe-integer expectedAmountMinor, currency `GHS`. A Paystack monthly GHS test plan must already exist. The output URL is sensitive and is written mode 0600 with exclusive creation. A timeout is ambiguous; verify the reference before retrying. No auto-retry, direct card API or application checkout button is enabled.

Payment input: tenantId, customerCode (`CUS_…`), reference, reviewedReference (>=8 chars), expectedCurrency `GHS`, expectedAmountMinor as an integer decimal string, bindingVerified true. Inject a dedicated `BILLING_IMPORT_DATABASE_URL` login with only `app_billing_importer` membership. Never use web/worker, owner or accepted-order operator credentials. Provider customer→tenant binding needs independently reviewed evidence. The transaction fetch/parse checks must succeed before any local write. Repeat observation updates one reference and emits an audit; status reversals do not execute a refund or auto-revoke a subscription. A browser callback is never payment verification.

Tests inject explicit HTTP fixture transports; these are contract/negative tests, not live Paystack sandbox results. Provider errors/reference mismatch/live keys/fractional or unsafe amounts are denied; PostgreSQL tests prove role/tenant fences and unchanged trial entitlements. The storage currency allowlist is broader than the Ghana launch review input; supported merchant currencies are not inferred from that list. No provider subscription mapping, invoice ledger, webhook inbox, settlement reconciliation, live recurring collection or tax calculation is implemented.

Infrastructure entry points, account/secret/bootstrap controls and the deliberate default release denial are in PRODUCTION_DEPLOYMENT_GUIDE.md. Run `cfn-lint` independently after template changes. `npm run check:release` **must return nonzero** for the checked-in NO_GO template; this is an exercised security refusal, not a failed quality check to bypass. The deployment script refuses a serving stack rather than scaling it down via a dark-stack update. Protected environments and real approvers must be configured externally.

## Continuation: immutable reusable report snapshots

Task CONT-T001 implements REQ-R002/R005/P6-G01 without changing the full-vision design. POST `/api/v1/report-snapshots` accepts `{filters}` and uses current session/Origin/CSRF/idempotency/billing-independent module/export/read policy under the existing tenant write fence. GET `/api/v1/report-snapshots/{id}` returns `{id,expiresAt,data}` only for the current owner/tenant/scope. Both source data and frozen metric summary are immutable; store projections separately from the nullable versioned summary introduced by migration nine. No backfill rewrites older snapshots.

POST `/api/v1/exports` accepts exactly `{snapshotId,format}` or the backward-compatible `{filters,format}`. The UI always freezes and displays the selected snapshot; the filters-only internal contract still captures at worker execution. A queued run stores permission fingerprint version 2. New report fingerprints exclude ordinary data revision but retain tenant/member/grants/membership/entitlement revision. Every reuse, publication and download additionally checks each source ID against current placement scope, seven-day expiry and snapshot hash/ordered row provenance; privacy erasure physically invalidates snapshots/artifacts and queued runs through existing maintenance. Legacy snapshots retain their old fingerprint and cannot be reused.

Status uses the exact published artifact ID and requested format; multiple formats from one snapshot cannot return another format's download link. Frozen summary contains KPIs/drill-downs/distribution/row count; no formula is duplicated across screens. Generation remains outside the source transaction, with current policy/expiry rechecked before publication. CSV/XLSX/PDF content safety and 5,000-row limit remain. Expiry cleanup handles snapshots even without artifacts, and hold behavior is unchanged. Existing classification/retention/operational gates remain open.

`tests/integration/report-snapshots.test.ts` uses independent CSV/XLSX readers and system `pdftotext` (Poppler) for reconciliation; install `poppler-utils` locally/CI before the full gate. The nine SQL migrations and checksum register must replay without drift/FORCE-RLS gaps. CONT-SNAP01–07 cover mutation between formats, row ordering, owner/tenant/current-row scope, expiry/publication, immutable summary, actual reviewed erasure and legacy compatibility. Historical load results have not been re-benchmarked for these additional authorization checks.

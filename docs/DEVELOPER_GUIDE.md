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

Trusted ingress must overwrite X-Real-IP and remove client-supplied identity/forwarding headers before requests reach the application; the rate limiter uses that ingress identity. Set request timeouts and the ingress body cap to match the application envelope. Do not publicly expose database, Redis, Mailpit or worker health ports.

## Quality and safe change workflow

Confirm linked requirements/acceptance criteria, add a tracked migration, implement policy/use case/API/UI/tests, update trace/status/user docs, then run `npm run check`. Do not mark the original design’s entire acceptance catalog as executed: the mapping distinguishes local evidence, deferred vision, and external release review.

Tests use native PostgreSQL and real local SMTP/storage. No production provider integration is simulated as delivered service. The migration gate replays every migration into a fresh disposable database, checks Prisma drift and FORCE RLS, then drops only that generated test database.

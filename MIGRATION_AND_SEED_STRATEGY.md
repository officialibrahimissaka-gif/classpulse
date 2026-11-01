# Migration and seed-data strategy

Baseline: 1 November 2026. This is the design/review plan, not a command to deploy the whole product vision. No production database or application was changed.

## MIG-001 — Schema baseline and phased adoption

[prisma/schema.prisma](prisma/schema.prisma) models the complete vision. [prisma.config.ts](prisma.config.ts) uses DATABASE_URL supplied securely; the checked-in schema contains no secret. Prisma 7 configuration is intentional: URL belongs in config, not the datasource block. Validation used Prisma 7.10.1; lock and security-review an appropriate supported patch for implementation rather than assuming “latest” is compatible.

Generate base PostgreSQL DDL from the schema with `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`; use a valid design datasource URL in an isolated config even for this offline command because the tested CLI otherwise emitted no script. Check nonempty output and exit status. This does not connect to a production database. Append/review constraints.sql after the generated base DDL; do not deploy Prisma models alone or use db push as a production migration system.

The generated full baseline was used in an isolated engine to validate the full design. Actual R1 migrations should be staged from the R1 release manifest plus transitive FK prerequisites, not automatically create all Later business modules. Generic ApprovalRequest has Later target FKs; R1 readiness uses ReadinessDecision directly, so defer the generic approval tables if their full dependency closure would pull in payroll/expenses. If a reserved Later reference table must exist for a reviewed FK, keep it empty and unavailable; physical table existence never confers module eligibility. Keep the complete design schema as a target and maintain a reviewed release-specific migration schema/artifact during implementation.

## MIG-002 — Migration process and rollback

Each migration has immutable ID/checksum, source commit, owning module/requirement/ADR/test links, forward effect, tenancy/residency/retention impact, concurrency/locking plan, backfill/reconciliation and rollback/forward-repair strategy. SQL changes to RLS, grants, immutable/temporal checks are explicit reviewed migrations, not invisible ORM changes. Validate on clean and upgrade-path databases with the real runtime role before approval. Do not apply a giant baseline to an existing populated installation.

Use expand→compatible application→bounded tenant-scoped backfill→reconcile→switch→later contract. Add nullable/new structures before requiring values; create large indexes concurrently in a separate nontransactional step when appropriate. Do not put CREATE INDEX CONCURRENTLY inside constraints.sql's transaction. Validate new constraints after cleaning identified exceptions; never disable tenant isolation to make a backfill pass. Upgrade all required cells with a recorded compatible-version policy, not a global unreviewed migration.

Backfills record tenant/keyset progress, source version, batch hash, counts and safe errors, and are idempotent. Recheck current grants/holds/retention and pause source mutations only where the invariant requires it. Historical correction creates superseding effective versions/adjustments; it does not rewrite old payroll or merge people automatically. Indexes and country-pack activation are separate from data migration.

Rollback code only while schema remains backward compatible. Destructive schema repair is normally a forward migration. PITR restores are incident operations with approved data-loss/communications and deletion-tombstone replay, not a routine deploy rollback. Do not resume stale jobs or old provider operations from a restored queue. Keep owner credentials exclusively in controlled regional migration tasks; runtime roles never receive DDL/BYPASSRLS.

## MIG-003 — Seeds and fixtures

Seed **catalogue definitions and synthetic fixtures**, not invented customers or legal rules. Proposed manifest is [prisma/seed-manifest.json](prisma/seed-manifest.json). It is data-design input, not an executable production seeder.

| Seed class | Allowed contents | Safety and repeatability |
|---|---|---|
| Supported module catalogue | Stable 26 module keys and release labels; module state inactive/unavailable by default | Core provisioned during explicit tenant setup; no blanket activation |
| Plans/feature keys | Proposed trial/agency plan limits from approved requirements, stable feature IDs | No prices, charges, automatic overages or unreviewed Enterprise unlimited values |
| Permissions/roles | Versioned built-in least-privilege bundles and allowed delegation | Upsert immutable key/version; never grant every user owner/admin or overwrite custom roles |
| R1 templates/metrics | Versioned nonlegal placement milestones and kpi.001–004 definitions with hashes | Publish only reviewed templates; original-date semantics and source permissions preserved |
| Country packs | Proposed pack IDs with unavailable state only | No labour/payroll formula, fake official source, approved rule or legal fixture in production seeds |
| Test organizations | At least tenants A/B, two clients, manager/recruiter/client/revoked identity, synthetic employment if needed for Later tests | Explicit nonproduction marker and deterministic UUID namespace; no real emails, passports, salaries or provider tokens |
| Test secrets/messages | High-entropy disposable test tokens hashed in storage; email sandbox/allowlist | Never publish credentials or deliver to real participants; test-only region/cell separate |

Seed operation key = seed set/version + tenant. Apply in FK order inside tenant context with transactional upserts, compare expected hashes/versions, and refuse conflicting existing custom data instead of overwriting it. Record audit/provenance. Rerun must produce no duplicate placements, grants, usage, metrics or reminders. Identity verification and role assignment use trusted onboarding services; a seed is not a login backdoor. Destructive reset is limited to a clearly isolated disposable test database and never inferred from an environment variable alone.

## MIG-004 — Required migration/release validation

Validate Prisma schema and generated DDL, OpenAPI references/schemas, all tenant PK/FKs/RLS, no-context and two-tenant denial, temporal overlap/correction, append-only/finalized data protection, self-approval/currency/context checks, immutable snapshot behavior, and staged seed rerun. Use native managed PostgreSQL 17 for pooled/multi-connection integration, EXPLAIN/load/deadlocks, role/IAM and full restore tests. The isolated PGlite PostgreSQL-compatible engine used here validates SQL semantics but cannot establish RDS behavior, connection pooling, concurrency or production throughput.

Before build/release add actual code and current-run evidence to existing IMP/TEST records; [DATA_DESIGN_REVIEW.md](DATA_DESIGN_REVIEW.md) separates executed design checks from still-unimplemented application/legal controls. No regulatory pack is enabled by successful schema validation.

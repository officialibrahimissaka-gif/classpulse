# Data and API design review

Reviewed: 1 November 2026. This is a design baseline with executed contract/SQL checks, not an implemented application or deployment approval.

## Artifacts and traceability

- [prisma/schema.prisma](prisma/schema.prisma): complete-vision Prisma model; 165 models, including Tenant and 164 explicitly tenant-owned tables.
- [prisma/constraints.sql](prisma/constraints.sql): mandatory PostgreSQL RLS, grants, checks, exclusions, context and immutability triggers.
- [prisma.config.ts](prisma.config.ts): Prisma 7 configuration using externally supplied DATABASE_URL; no credential is embedded.
- [ERD.md](ERD.md) and [DATA_DICTIONARY.md](DATA_DICTIONARY.md): 311 tenant-qualified domain FK relations and field/key/classification/history definitions.
- [INDEX_AND_CONSTRAINTS.md](INDEX_AND_CONSTRAINTS.md): tenant boundary, indexes, invariants, money, transactions and deletion behavior.
- [API_ENDPOINT_CATALOG.md](API_ENDPOINT_CATALOG.md) and [openapi.yaml](openapi.yaml): versioned requests/responses, scopes, errors, idempotency, limits and event contracts; 380 operations with explicit release/module labels.
- [WORKFLOW_STATE_DIAGRAMS.md](WORKFLOW_STATE_DIAGRAMS.md): recruitment, placement, joiner/leaver, leave, payroll, expense, sales, success and support state machines.
- [MIGRATION_AND_SEED_STRATEGY.md](MIGRATION_AND_SEED_STRATEGY.md) and [prisma/seed-manifest.json](prisma/seed-manifest.json): staged adoption and non-executable safe seed input.
- [design/verify.mjs](design/verify.mjs) and [design/validation-results.json](design/validation-results.json): repeatable design validator and actual current-run evidence, including input hashes and tool versions.

DD/DB/API/WF/MIG contracts refine the Phase 1 DES records and Phase 2 ARCH/SEC/INT/GLOB contracts. Existing IMP records remain not implemented and TEST records remain application acceptance specifications. These design checks do not mark every application TEST passed. Tenant/scope contracts trace REQ-P001/P003, histories REQ-P006/P011/P012, subscriptions REQ-E001–E014, R1 domain tables/APIs REQ-F001–F003/F029/F038–F040, reports REQ-R001–R010, and legal/configuration adapters REQ-F042/F043.

## Review conclusions

| Area | Design decision and corrections made | Evidence / remaining boundary |
|---|---|---|
| Tenant isolation | Composite tenant PK/FKs, explicit Tenant relation, ENABLE/FORCE RLS and non-owner/non-bypass roles; no global customer identity master | Executed no-context, cross-tenant select/update/insert and cross-tenant FK checks. Field/team/client/entitlement policy remains application work |
| Identity/client access | Explicit PersonMembershipLink and verified ContactMembershipLink; participant grants must use the verified contact/member pair | SQL DDL/FKs validate; complete invitation/identity-proofing application journey still needs TEST-P002/F003 |
| Historical accuracy | Business and system-time versioning; supersede immutable old content, then insert replacement intervals; rule proposals separated from published versions | Executed overlap/reversed-date/illegal-update rejection and surviving as-known history test. Native concurrent correction/approval tests remain |
| Financial consistency | Exact decimal types/string wire values, currency/context checks, net relation, self-approval checks, frozen approved inputs/finalized run children | Executed exact arithmetic, overflow, expense currency and batch/expense self-approval tests. No payroll legal formula/provider acceptance is validated |
| Provider namespaces | Payment/reimbursement references include providerCode + providerAccountKey + reference | Prevents false collisions between different providers/accounts. Real provider retry/acceptance tests remain |
| Reports | Immutable result rows and metric bindings, not just a pointer to changing source records; protected artifacts and current-scope reauthorization | Snapshot schemas/SQL validate. Actual chart/export parity, rendering and revoked-download tests need handlers |
| Workflows | Typed approval targets and exactly-one checks; separate approval/export/payment/reconciliation; original plan and transition history retained | Executed missing-target rejection. Full transition/role/approval-edge enforcement remains the registered service command boundary |
| Performance | Tenant-leading keys, FK/operational/partial indexes, bounded cursors/import/export, documented locks and R1-only migration scope | No production benchmark or EXPLAIN evidence; full-vision table/index count is not a recommendation to migrate all Later modules in R1 |
| Privacy/retention | No cascaded tenant destruction; explicit archival vs erasure; scoped maintenance role, holds, pseudonymous actors, tombstones and artifact expiry | RLS/physical-delete/audit-update denial executed. Full erasure/backup/processor propagation remains unimplemented |
| API security | Request field allowlists, no generic writable states/calculated totals, ETags/idempotency, minimum secret exposure and release gates | OpenAPI validates structurally; handlers/policy/MFA/CSRF/rate meter and secure secret delivery are not implemented |

## Executed checks

Current evidence file records **34 passing assertions** using Prisma 7.10.1, PGlite 0.4.3, Swagger Parser 13.1.0 and Node 24.19.0. The suite validates Prisma, nonempty offline-generated DDL, OpenAPI 3.0.3 references/schema, unique operation IDs, module/release labels, execution of all generated/companion SQL, RLS on every table, non-bypass/non-owner runtime role, tenant data separation, composite FK denial, version and physical-delete guards, temporal exclusions/supersession, downgrade-safe capacity condition, numeric exactness/overflow, append-only audit, self-approval, claim currency, typed targets and transaction-local context reset.

The test database is an isolated disposable PostgreSQL-compatible WASM engine; it never connects to the design URL, RDS or another external database. Fixtures use synthetic identities, example.invalid and no legal/payment effect. No application features, migrations against customer data, messages, cloud resources or regulatory packs were activated.

To repeat from the repository root, install the exact validators in an isolated writable tools directory (not the application root), then run the validator:

```sh
npm install --prefix /tmp/classpulse-phase3-tools --no-package-lock prisma@7.10.1 @electric-sql/pglite@0.4.3 @apidevtools/swagger-parser@13.1.0 yaml@2.9.1
DESIGN_TOOLS_DIR=/tmp/classpulse-phase3-tools node design/verify.mjs
```

This reproduces the direct validator versions, not a production lockfile/build. The script uses a fixed non-production placeholder URL only to satisfy Prisma's offline diff configuration, refuses empty generated SQL, creates an in-memory engine, and writes current evidence hashes. Implementation must use a reviewed frozen dependency lockfile and native PostgreSQL 17 integration tests. Passing this suite alone is insufficient for deployment.

## Implementation gates and accepted design limits

1. Implement and test the typed policy/repository/transaction layer, current-session/entitlement checks, scoped role delegation and source-domain approval edge registry. RLS alone cannot enforce these or protect a fully compromised SQL role.
2. Complete per-module service invariants and lock protocols identified in DB-004/WF-010: manager/team cycle prevention, benefit/entity and pay-run currency coverage, approved expense-line immutability, provider/source namespaces and legal applicability. The design names these explicitly; do not silently omit them in handlers.
3. Validate native PostgreSQL/RDS 17, real connection pooling, multi-connection quota/ledger/deadlock/temporal races, query plans under tenant skew, backup/restore and deletion tombstones. PGlite cannot establish these outcomes.
4. Translate full-vision schema to staged R1 migration artifacts with explicit FK closure. R1 readiness is specific; generic Later approval targets must not force premature payroll/HR feature deployment. Actual feature/release gates remain authoritative.
5. Obtain legal/provider/retention/residency approval before affected Later module activation. Country packs remain unavailable; no verified payroll calculation or universal UAE compliance rule was introduced.

The design is suitable for review and planning the next implementation phase with these explicit gates. It is not a claim that production services are built, secure, performant or legally approved.

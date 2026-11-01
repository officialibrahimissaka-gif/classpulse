# Executed quality evidence

Executed 1 November 2026, UTC, against the final R1 implementation. `npm run check` completed with exit code **0**. [Complete output](quality/2026-11-01-full-check.log).

| Gate | Result | Evidence |
|---|---|---|
| Formatting | PASS | Prettier check on source/tests/scripts/config/CI |
| Lint | PASS | Next/React/TypeScript ESLint; no explicit any; database imports restricted from app UI |
| Strict types | PASS | `tsc --noEmit`, strict/noUncheckedIndexedAccess |
| Unit | PASS — 8 tests | Central metric cohorts/no-data semantics; date/DST validity; cryptographic integrity; module denial; CSV safety; independent XLSX reader including Arabic/literal formulas |
| Integration | PASS — 12 tests, native PostgreSQL | Atomic setup/idempotency, non-owner FORCE RLS, scoped client/internal membership, stale writes/CSRF/revocation, human readiness, replacement invitation allowlists, SMTP attempt fencing, CSV atomicity/quota rollback, paid conversion/101-row retained downgrade/cancellation window, actual PDF/CSV/XLSX, private/team views, template publication, reviewed erasure/holds/maintenance separation |
| End to end | PASS — 1 complete browser journey | Company → client → accepted placement → required tasks → human ready → actual start → CSV validation/commit → BullMQ PDF generation/download; axe WCAG 2.0/2.1/2.2 tags, 390px overflow and mobile sign-out/cookie-clearing check |
| API contract | PASS | Deterministic generated contract drift check; Swagger Parser validates 37 versioned operations |
| Migrations | PASS — 7 migrations | Immutable checksums; fresh disposable PostgreSQL migration replay; no Prisma schema difference; every customer table has FORCE RLS |
| Security | PASS for automated local gate | Static forbidden-pattern scan; production npm dependency audit: zero vulnerabilities; negative authorization/isolation checks above |
| Production build | PASS | Prisma generation + Next.js standalone compilation/type checks |
| Bundled worker smoke | PASS | Same esbuild entry used by worker Docker target starts, serves private health, shuts down cleanly |

**Scope of evidence:** This is 21 automated tests plus build/API/migration/security checks, not the entire design acceptance catalog. Tests use synthetic local tenants and actual local PostgreSQL/Redis/SMTP/private-file services. There is no live Cognito/SES/S3, production image/runtime, managed-cloud recovery/load, customer discovery, legal or independent security certification. See [limitations](../KNOWN_LIMITATIONS.md).

Warnings were not suppressed: the pinned Prisma/pg adapter emits a pg query-serialization deprecation warning; Playwright reports NO_COLOR/FORCE_COLOR environment warnings. Neither was a failing check. The earlier baseline-column, SQL lock-deserialization, list-scope, browser locator, reader-shape and erasure-trigger-permission failures were corrected before this final successful run. The vulnerable spreadsheet dependency chain was removed rather than ignored.

[Source/config/test/migration hashes](quality/source-hashes.json) identify the implementation reviewed by this run. Documentation status records do not change runtime behavior.

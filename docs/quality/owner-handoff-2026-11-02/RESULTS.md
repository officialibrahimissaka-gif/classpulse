# Owner handoff validation

2 November 2026 · Baseline 98dd5b9 · Public interactive deployment remains unavailable; production remains NO-GO.

The owner requested a usable project handoff, Windows instructions, real reports and an explanation of what to host. Added a local startup helper/sample workspace and a separately labeled static portfolio folder. No application business rule, API, schema, MFA/entitlement rule or production deployment configuration changed. D01 discovery and queued feature work remain otherwise unchanged.

## Executed evidence

- **Full `npm run check`: PASS, exit 0.** 20 unit +34 PostgreSQL integration +5 browser = **59 tests**, plus format/lint/strict types, 40-operation API, nine immutable migration replay/no drift/FORCE RLS, static security, zero-vulnerability production dependency audit and production build. See final-gate.log.
- **Actual `npm run demo` smoke: PASS in managed Linux.** Existing private settings preserved; Docker services started; tracked migration applied idempotently with no reset; web and actual worker reached readiness; sample workspace created with two fictional clients, five placements and two confirmed starts. Ctrl+C stopped owned web/worker processes; ports were verified closed and database volumes retained. Interrupt exit status is not a quality-suite failure.
- **OWNER-LOCAL01/02:** local-only settings accepted, production/public-origin/external-service/missing-service configurations rejected before demo/migration use.
- **OWNER-LOCAL03:** actual sample command run twice in a unique synthetic workspace; second run preserves existing records; browser owner signs in, sees two-start metric and downloads a real worker-generated PDF.
- **Portfolio artifacts:** captured actual synthetic dashboard via browser; PDF/CSV/XLSX generated/downloaded from the same frozen app view. Independent CSV/XLSX/PDF-text readers reconciled five source records and two confirmed starts. No private cookie, object key or application download token is published.
- **Static showcase:** local-file render at widths 390/1440 had no horizontal overflow; axe WCAG 2.0/2.1/2.2 tags passed. Initial ad-hoc axe harness required an explicit browser context; corrected and rerun successfully, without suppressing a page violation.
- **Windows:** guide and process invocation designed for Windows; Prisma migration now uses Node's executable/CLI path rather than a Unix `.bin` shim. An actual Windows machine/Docker Desktop installation was **not** executed here. Founder confirmed Windows and no Docker Desktop; first installation requires their computer.

## Delivery boundaries

`OPEN_MY_PROJECT.md` is the owner guide. `portfolio-showcase/` is a plain static page with fictional exported examples, suitable for owner-managed manual static upload; it prominently says it is not the live application. No host account was connected, no Netlify/other hosting deployment occurred and no public URL is invented. A fully interactive public app still requires backend/provider/access setup; the local development identity is not exposed by a tunnel or weakened for hosting.

The helper creates only a separate synthetic workspace through actual local development APIs, using unverified local identity—not forged MFA, billing grants or privileged database writes. Existing workspaces are not reseeded/reset, and trial expiry is not extended. Database/Redis/Mailpit remain local; commands refuse remote app-service configuration. Live payment keys are neither required nor used. No prospect/customer outreach or environment publication occurred.

Historical production security/privacy/recovery/billing issues and moderate development-tool advisories remain open. Portfolio/showcase readiness and local owner exploration are distinct from real-customer production readiness.

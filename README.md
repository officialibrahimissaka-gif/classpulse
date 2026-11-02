# ClassPulse

**Current release: NO-GO for production.** Latest continuation passes **56 local tests**; [status](DEVELOPMENT_STATUS.md), [roadmap](PRODUCT_ROADMAP.md), [evidence](docs/quality/continuation-2026-11-02/RESULTS.md) and [release checklist](RELEASE_READINESS_CHECKLIST.md) distinguish completed work from remaining gates.

R1 agency placement-to-start coordination. The runnable implementation covers company setup, clients and minimal candidate references, checklist ownership, scoped client participation, exceptions and human readiness/start decisions, CSV import, daily reminders, and operational reports. Full HRMS and payroll remain outside this release.

## Open and show the project

Start with [OPEN_MY_PROJECT.md](OPEN_MY_PROJECT.md), the Windows owner walkthrough. `npm.cmd ci` then `npm.cmd run demo` starts the real local app, worker and synthetic sample workspace after Node.js 24/Docker Desktop installation. [portfolio-showcase](portfolio-showcase/README.md) is a separate static page with real generated sample files that you can upload to Netlify; it is clearly labeled and is not a public interactive app.

## Local development

Requires Node 24 and Docker Compose. These commands create private local credentials; they never publish or deploy the environment.

```bash
npm ci
npx tsx scripts/local-env.ts
docker compose --env-file .local/docker.env up -d --wait
npm run db:migrate
npm run db:generate
npm run dev
```

In a second terminal run `npm run worker`. Open http://127.0.0.1:3000. Local SMTP is captured by Mailpit at http://127.0.0.1:18025. Local identities are explicitly unverified and cannot authorize MFA-protected changes. They are forbidden in production.

For a first workflow, sign in locally, record your company authority/time zone/retention policy, add a client, and enter an accepted placement. Complete the required checklist, record readiness, then confirm the actual first day. Add a scoped client invitation before readiness to test the client portal. Report generation requires the worker.

## Verification

```bash
npx playwright install --with-deps chromium
npm run check
```

The suite checks formatting, lint, strict types, unit tests, native PostgreSQL integration, browser/accessibility behavior, fresh migration replay/schema drift/RLS, dependency/static security and production build. Tests use unique synthetic local tenants and real local SMTP/private files. Never point local/test tooling at production.

See [development status](DEVELOPMENT_STATUS.md), [known limitations](KNOWN_LIMITATIONS.md), [user guide](docs/USER_GUIDE.md), [developer guide](docs/DEVELOPER_GUIDE.md), and [operations runbook](docs/OPERATIONS_RUNBOOK.md). The root Phase 0–4 documents remain design baselines; the full-vision Prisma schema and OpenAPI are not the deployed R1 contract.

## Launch preparation

[Launch plan](LAUNCH_PLAN.md) · [Deployment guide](PRODUCTION_DEPLOYMENT_GUIDE.md) · [Operations](OPERATIONS_RUNBOOK.md) · [Pricing](PRICING_STRATEGY.md) · [Customer onboarding](CUSTOMER_ONBOARDING_PLAN.md) · [Sales](SALES_PLAYBOOK.md) · [Revenue model](REVENUE_MODEL.md) · [Roadmap](POST_LAUNCH_ROADMAP.md). Local previews: `/pricing` and owner-only `/billing`. [Phase 7 executed evidence](docs/quality/phase7/RESULTS.md). No public deployment or live billing is enabled.

## Ongoing project management

[Roadmap](PRODUCT_ROADMAP.md) · [Charter](PROJECT_CHARTER.md) · [Decisions](DECISION_LOG.md) · [Assumptions](ASSUMPTIONS_LOG.md) · [Risks](RISK_REGISTER.md). Latest slice: frozen Overview with same-snapshot PDF/CSV/XLSX reuse; [56-test continuation evidence](docs/quality/continuation-2026-11-02/RESULTS.md). M8.1 is locally complete; production release M8 remains NO-GO.

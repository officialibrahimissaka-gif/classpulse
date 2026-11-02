# ClassPulse

**Phase 6: NO-GO for production.** [Test results](TEST_RESULTS.md), [security audit](SECURITY_AUDIT.md), and [release checklist](RELEASE_READINESS_CHECKLIST.md) are available on this branch. The Phase 6 suite passed 42 tests; Phase 7 now passes 49 local tests; production and acceptance blockers remain.

R1 agency placement-to-start coordination. The runnable implementation covers company setup, clients and minimal candidate references, checklist ownership, scoped client participation, exceptions and human readiness/start decisions, CSV import, daily reminders, and operational reports. Full HRMS and payroll remain outside this release.

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

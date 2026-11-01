# Your ClassPulse delivery

**Phase 6: NO-GO for production.** [Test results](TEST_RESULTS.md), [security audit](SECURITY_AUDIT.md), and [release checklist](RELEASE_READINESS_CHECKLIST.md) are available on this branch. All 42 local tests pass; production and acceptance blockers remain.

The source and documentation are now uploaded to GitHub on branch `codex/classpulse-mvp-review`. The `main` branch is unchanged. Uploading source does not deploy a running application.

## Files

[Browse the files](https://github.com/officialibrahimissaka-gif/classpulse/tree/codex/classpulse-mvp-review) or [download this branch as a ZIP](https://github.com/officialibrahimissaka-gif/classpulse/archive/refs/heads/codex/classpulse-mvp-review.zip). On GitHub, select `codex/classpulse-mvp-review` before using **Code → Download ZIP**.

The branch contains the actual application source, Phase 0–4 documents, database schema/migrations, API contract, tests, design specifications and developer/user guides. Private local configuration, credentials, database contents, dependencies, caches and build output are excluded.

[View actual application screenshots](docs/PREVIEW.md). These are screenshots of the running development application with synthetic data, not an interactive deployment.

Unzip it and open the extracted folder containing `package.json` in VS Code or another editor. Start with `README.md`, `DEVELOPMENT_STATUS.md`, `docs/USER_GUIDE.md`, and `KNOWN_LIMITATIONS.md`.

## Run it on your own computer

Install Node.js 24 and Docker Desktop first. Start Docker Desktop. Open a terminal in the extracted folder containing `package.json`:

```bash
npm ci
npx tsx scripts/local-env.ts
docker compose --env-file .local/docker.env up -d --wait
npm run db:migrate
npm run db:generate
npm run dev
```

Leave that terminal running. Open a second terminal in the same folder:

```bash
npm run worker
```

Now open **http://127.0.0.1:3000 in your computer's browser**. This address works on your computer only after you start the app there. The cloud workspace's localhost address is a different machine; typing it on your computer does not reach the cloud workspace.

## Try a complete workflow

1. Enter a test name/email and click Continue locally. This is an explicitly unverified local test login, not production authentication.
2. Create a test company. Use `review-agency` as the workspace address, `AE`, `Asia/Dubai`, `AED`, and an explicitly TEST authority/retention policy. Retention values here are test inputs, not legal advice or a production retention recommendation.
3. Open Clients, enter a company name and a unique reference, then Add client.
4. Open Placements, enter a test candidate and different candidate/placement source references. Choose acceptance/start dates before or on today.
5. Open the placement, complete each required checklist task with a test confirmation, record readiness, then confirm the actual start.
6. Open Overview, inspect the metrics and generate/download a PDF, CSV or XLSX report. The worker terminal must be running.
7. To test client participation, invite a test email before completing the checklist. Read local email at http://127.0.0.1:18025, open its invitation link in a separate/private browser window and sign in using the invited email.

Sensitive administrative changes require real fresh MFA and intentionally fail under the unverified local login. Payroll and the full HRMS/ATS/CRM vision are not implemented; the approved first release is agency placement coordination.

## Automated checks

```bash
npx playwright install --with-deps chromium
npm run check
```

The recorded suite passes 8 unit tests, 12 native PostgreSQL integration tests and one complete browser journey, plus formatting, lint, types, API/migration/security/build checks. You still need to review the actual workflow and give product feedback; automated checks are not your acceptance.

## Live browser preview

The source upload is complete, but the application is not deployed to a public URL. This environment-setup chat does not provide interactive web previews. Follow the local run instructions above to test the app. A hosted private preview requires a separate hosting and authentication setup; no public tunnel or production deployment has been performed.

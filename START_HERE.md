# Your ClassPulse delivery

**Want to open it yourself? Start with [OPEN_MY_PROJECT.md](OPEN_MY_PROJECT.md).** Windows: install Node.js 24 and Docker Desktop, then run `npm.cmd ci` and `npm.cmd run demo`. The helper starts app and worker and provides a separate synthetic sample workspace. For a static page you can upload to Netlify immediately, see [portfolio-showcase](portfolio-showcase/README.md); it is explicitly not the live application.

**Current release: NO-GO for production.** Latest owner handoff passes **59 local tests**; [status](DEVELOPMENT_STATUS.md), [roadmap](PRODUCT_ROADMAP.md), [evidence](docs/quality/continuation-2026-11-02/RESULTS.md) and [release checklist](RELEASE_READINESS_CHECKLIST.md) distinguish completed work from remaining gates.

The source and documentation are now uploaded to GitHub on branch `codex/classpulse-mvp-review`. The `main` branch is unchanged. Uploading source does not deploy a running application.

## Files

[Browse the files](https://github.com/officialibrahimissaka-gif/classpulse/tree/codex/classpulse-mvp-review) or [download this branch as a ZIP](https://github.com/officialibrahimissaka-gif/classpulse/archive/refs/heads/codex/classpulse-mvp-review.zip). On GitHub, select `codex/classpulse-mvp-review` before using **Code → Download ZIP**.

The branch contains the actual application source, Phase 0–4 documents, database schema/migrations, API contract, tests, design specifications and developer/user guides. Private local configuration, credentials, database contents, dependencies, caches and build output are excluded.

[View actual application screenshots](docs/PREVIEW.md). These are screenshots of the running development application with synthetic data, not an interactive deployment.

Unzip it and open the extracted folder containing `package.json` in VS Code or another editor. Start with `README.md`, `DEVELOPMENT_STATUS.md`, `docs/USER_GUIDE.md`, and `KNOWN_LIMITATIONS.md`.

## Run it on your own Windows computer

Install Node.js 24 and Docker Desktop, open Docker Desktop, and open a terminal in the extracted folder containing `package.json`:

```powershell
npm.cmd ci
npm.cmd run demo
```

Wait for READY, then open **http://127.0.0.1:3000 on that same computer**. Keep the terminal open. The helper starts web/worker and local services and creates a fictional `portfolio-demo` workspace. Use name **Portfolio Demo Owner**, email **demo-owner@example.invalid**, Continue locally, then Join workspace **portfolio-demo**. Existing sample records are preserved on restart. [Owner walkthrough and hosting map](OPEN_MY_PROJECT.md).

This address is local to the computer running the command; the cloud workspace's localhost is a different computer. Advanced manual setup remains in the developer guide. To view a portfolio page immediately without Docker, open `portfolio-showcase/index.html`; it is a static showcase, not the interactive app.

## Try a complete workflow

1. Use the supplied local sample sign-in above, or create a separate test company using your own fictional name/email. This is an unverified local identity, not production authentication.
2. If creating your own workspace rather than opening `portfolio-demo`, create a test company. Use `review-agency` as the workspace address, `AE`, `Asia/Dubai`, `AED`, and an explicitly TEST authority/retention policy. Retention values here are test inputs, not legal advice or a production retention recommendation.
3. Open Clients, enter a company name and a unique reference, then Add client.
4. Open Placements, enter a test candidate and different candidate/placement source references. Choose acceptance/start dates before or on today.
5. Open the placement, complete each required checklist task with a test confirmation, record readiness, then confirm the actual start.
6. Open Overview, inspect the metrics and generate/download a PDF, CSV or XLSX report. The worker terminal must be running.
7. To test client participation, invite a test email before completing the checklist. Read local email at http://127.0.0.1:18025, open its invitation link in a separate/private browser window and sign in using the invited email.

Sensitive administrative changes require real fresh MFA and intentionally fail under the unverified local login. Payroll and the full HRMS/ATS/CRM vision are not implemented; the approved first release is agency placement coordination.

## Automated checks (optional; CI/Linux workflow)

```bash
npx playwright install --with-deps chromium
npm run check
```

Historical checks are documented in the quality records. The owner-handoff results describe the current executed suite; do not treat earlier test totals as a new test run. This test workflow also needs an independent PDF text reader (Poppler) and has been executed in Linux; it is not required to open the local app on Windows. You still need to review the actual workflow and give product feedback; automated checks are not your acceptance.

## Live browser preview

The source upload is complete, but the application is not deployed to a public URL. This environment-setup chat does not provide interactive web previews. Follow the local run instructions above to test the app. A hosted private preview requires a separate hosting and authentication setup; no public tunnel or production deployment has been performed.

## Phase 7 launch preview

After starting the app locally, open **http://127.0.0.1:3000/pricing** for proposed GHS plans and **http://127.0.0.1:3000/billing** for owner-only test billing records. These are real screens in the source, not public cloud URLs. No live checkout or subscription purchase is enabled. Start with [launch plan](LAUNCH_PLAN.md) and [deployment guide](PRODUCTION_DEPLOYMENT_GUIDE.md) for the eight new launch documents and remaining gates.

## Latest project continuation

On the local Overview, choose **Freeze report** (or generate the first export), then produce PDF, CSV and XLSX from the same displayed snapshot. Use **Refresh live report** for current values. See [project roadmap](PRODUCT_ROADMAP.md), [current status](DEVELOPMENT_STATUS.md) and [continuation evidence](docs/quality/continuation-2026-11-02/RESULTS.md). Production remains NO-GO; this is source delivery, not public deployment.

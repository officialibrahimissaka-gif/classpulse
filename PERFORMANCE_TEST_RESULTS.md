# Phase 6 performance test results

**Local workload: PASS for the measured read/write latency targets. Production capacity/availability/recovery: UNVERIFIED, release blocked.**

Run: 2026-11-01T20:06:33.538Z to 2026-11-01T20:07:02.434Z. [Raw run metadata](docs/quality/phase6/performance.json), [all 460 request samples](docs/quality/phase6/performance-samples.json). These are actual measurements, not estimates or vendor claims.

## Method and fixture

- Actual loopback HTTP requests to the Next.js **development** server, real signed sessions/current authorization, native Docker PostgreSQL 17, Redis and private local storage. No provider calls or customer data.
- 20 distinct internal user sessions in one synthetic tenant; 10,000 candidate references and 10,000 placements (100 current/9,900 started), two clients and 30,000 checklist rows. The history is synthetic fixture data rather than a replay of every historical approval event; do not infer production history/index/retention realism.
- Closed-loop batches of 20 concurrent users, no think time: 20 read rounds (400 requests), then three write rounds (60 requests). Read pages contain 100 records; writes use actual source validation, tenant lock, idempotency and audit. The database also contains other isolated synthetic QA tenants; no concurrent multi-tenant load was generated.
- Growth order/capacity remains enforced. A 1,000-row CSV existing-source reconciliation imports zero new allocations; it does not bypass the 500-active-placement plan limit to claim 1,000 new placements can be committed.
- Host reports 5 CPUs; cgroup quota `400000 100000` = four CPU equivalents and memory limit 32 GiB. Node v24.19.0, linux/x64. These are test-machine resources, not a proposed production instance size.
- Fixture seeding took 14.20s and is excluded from interactive latency. The first pre-load request took 100.60ms; the raw field is named coldFirstReadMs, but the server had been warmed during prior checks. It is **not** a cold-boot measurement.

## Interactive results

Latency includes loopback request/response parsing and application/database work; excludes internet, production TLS/ingress/CDN and remote provider latency. p95 uses nearest rank over successful requests; all failures are separately counted and none occurred.

| Operation | Requests | Success/failure | p50 ms | p95 ms | Max ms | Approved local target |
|---|---:|---:|---:|---:|---:|---|
| 100-row authorized source page | 400 | 400 / 0 | 267.57 | 363.48 | 472.95 | <2,000 ms p95 — PASS |
| Transactional source write | 60 | 60 / 0 | 372.53 | 726.63 | 763.09 | <3,000 ms p95 — PASS |

Combined measured interactive error rate: **0 / 460 = 0%** during this short run. This does not establish monthly 99.5% availability.

## Imports and exports

The 1,000-row existing-source import staged/validated in 64.93ms and committed/reconciled in 124.13ms. New-allocation overflow and concurrent last-slot behavior are covered separately by native regression tests.

Export jobs below each select exactly 5,000 authorized source rows from one client, including current and original-date cohorts. Generation invokes the actual worker service directly; **queue waiting time is not measured**. Downloads go through the real current-authorization HTTP proxy. One sample per format is descriptive timing, not a percentile.

| Format | Independently reconciled rows | Artifact bytes | Request ms | Generation ms | Authenticated download ms |
|---|---:|---:|---:|---:|---:|
| CSV | 5000 | 469281 | 32.79 | 1370.45 | 37.70 |
| XLSX | 5000 | 162777 | 33.67 | 1394.44 | 33.93 |
| PDF | 5000 | 270387 | 29.35 | 1656.43 | 47.30 |

CSV was read by a strict csv-parse consumer, XLSX by independent read-excel-file and PDF by pdftotext. Each reconciled 5,000 source records. The initial workload attempt discovered inconsistent CSV row widths and stopped during reconciliation; P6-F10 was reproduced/fixed and the completed run above then passed. No failing format check was relaxed. New exports reject 5,001 rows in every format.

## Limits and follow-up

This ~29-second local run is not a production benchmark or soak test. No measured production queue-lag distribution, network/provider latency, rate-limit/WAF outage behavior, multi-tenant contention, full memory/CPU saturation, deadlock/DB failover/Redis loss/object-store outage, monthly availability or managed RPO/RTO result is available. Rendering is bounded by rows but production per-job resource/timeout isolation still needs deployment evidence. The separate native/browser suite exercises real queue processing and ambiguous-delivery handling for correctness, not sustained queue capacity.

Owner: SRE + performance QA. Repeat on an approved production-like staging cell with representative histories, 20-user/multi-tenant sustained load, queue lag and resource telemetry, then conduct approved restore/fault exercises before release. Reproduce locally only against synthetic loopback targets: start app/dependencies, then `npm run test:performance`. The script refuses remote/production targets and writes a new synthetic tenant; it is intentionally not part of every fast CI run.

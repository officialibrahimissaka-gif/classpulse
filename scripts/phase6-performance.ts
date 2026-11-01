import "../tests/support/guard";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { parse } from "csv-parse/sync";
import readXlsxFile from "read-excel-file/node";
import {
  tenant,
  within,
  request,
  testIdentity,
  type TestSession,
} from "../tests/support/phase6";
import { database } from "../src/platform/database";
import { createClient, dueInstant } from "../src/domain/agency";
import { createSession } from "../src/platform/auth";
import { requestPlan } from "../src/domain/admin";
import { acceptOrder } from "../src/operations/commercial";
import { generateExport } from "../src/domain/exports";
import { config } from "../src/platform/config";
const output = "docs/quality/phase6",
  startedAt = new Date().toISOString();
await mkdir(output, { recursive: true });
const s = await tenant(),
  tenantId = await within(s, async (_tx, c) => c.tenantId),
  users: TestSession[] = [s];
const commercial = await within(
  s,
  (tx, c) =>
    requestPlan(tx, c, request(s), {
      planKey: "growth",
      reason: "Synthetic Phase 6 performance fixture",
    }),
  true,
);
await acceptOrder(config().DATABASE_URL, {
  tenantId,
  requestId: commercial.id,
  orderReference: "PERF-" + randomUUID(),
  operatorReference: "SYNTHETIC-QA",
  effectiveAt: new Date().toISOString(),
  acceptedOrderVerified: true,
});
await within(
  s,
  async (tx) => {
    const role = await tx.role.findUniqueOrThrow({
      where: { tenantId_roleKey: { tenantId, roleKey: "owner" } },
    });
    for (let i = 1; i < 20; i++) {
      const identity = testIdentity(),
        principal = await tx.principal.create({
          data: {
            tenantId,
            issuer: identity.issuer,
            subject: identity.subject,
            state: "active",
          },
        }),
        member = await tx.membership.create({
          data: {
            tenantId,
            principalId: principal.id,
            status: "active",
            displayName: "Synthetic performance user " + i,
            workEmail: identity.email,
          },
        });
      await tx.roleGrant.create({
        data: {
          tenantId,
          membershipId: member.id,
          roleId: role.id,
          scopeType: "tenant",
          validFrom: new Date(),
        },
      });
      users.push(await createSession(tx, tenantId, member.id, identity));
    }
    await tx.usageCounter.update({
      where: {
        tenantId_resourceKey_periodKey: {
          tenantId,
          resourceKey: "internal_seats",
          periodKey: "gauge",
        },
      },
      data: { used: 20, version: { increment: 1 } },
    });
  },
  true,
);
const clients: Awaited<ReturnType<typeof createClient>>[] = [];
for (const code of ["A", "B"])
  clients.push(
    await within(
      s,
      (tx, c) =>
        createClient(tx, c, request(s), {
          name: "Synthetic benchmark client " + code,
          code: "BENCH-" + code,
        }),
      true,
    ),
  );
const seedStart = performance.now();
for (let offset = 0; offset < 10000; offset += 500) {
  await within(
    s,
    async (tx, c) => {
      const entity = await tx.legalEntity.findFirstOrThrow({
          where: { tenantId },
        }),
        template = await tx.templateVersion.findFirstOrThrow({
          where: { tenantId, state: "published" },
          include: { fromTaskDefinition_templateVersion: true },
        }),
        candidates = Array.from({ length: 500 }, (_, j) => {
          const i = offset + j;
          return {
            id: randomUUID(),
            tenantId,
            sourceProfile: "phase6-performance",
            sourceKey: "candidate-" + i,
            displayName: "Synthetic person " + i,
            ownerId: c.memberId,
          };
        });
      const placements = candidates.map((person, j) => {
        const i = offset + j,
          planned = `2026-10-${String(5 + (i % 20)).padStart(2, "0")}`;
        return {
          id: randomUUID(),
          tenantId,
          entityId: entity.id,
          clientId: clients[i % 2]!.id,
          candidateId: person.id,
          ownerId: c.memberId,
          sourceProfile: "phase6-performance",
          sourceKey: "placement-" + i,
          acceptedOn: new Date("2026-10-01"),
          originalPlannedStart: new Date(planned),
          currentPlannedStart: new Date(planned),
          status: i < 100 ? "accepted" : "started",
          actualStart:
            i < 100
              ? null
              : new Date(
                  `2026-10-${String(5 + (i % 20) + (i % 3)).padStart(2, "0")}`,
                ),
          timeZone: entity.timeZone,
          templateVersionId: template.id,
        };
      });
      const milestones = placements.map((p) => ({
        id: randomUUID(),
        tenantId,
        placementId: p.id,
        milestoneKey: "pre-start",
        label: "Synthetic pre-start",
        sortOrder: 0,
      }));
      await tx.candidate.createMany({ data: candidates });
      await tx.placement.createMany({ data: placements });
      await tx.milestone.createMany({ data: milestones });
      await tx.placementTask.createMany({
        data: placements.flatMap((p, j) =>
          template.fromTaskDefinition_templateVersion.map((d) => ({
            tenantId,
            placementId: p.id,
            milestoneId: milestones[j]!.id,
            definitionId: d.id,
            label: d.label,
            required: d.required,
            ownerId: c.memberId,
            dueAt: dueInstant(
              p.currentPlannedStart.toISOString().slice(0, 10),
              d.dueOffsetDays,
              d.dueTime,
              p.timeZone,
            ),
          })),
        ),
      });
    },
    true,
  );
}
await within(
  s,
  async (tx) => {
    await tx.usageCounter.update({
      where: {
        tenantId_resourceKey_periodKey: {
          tenantId,
          resourceKey: "active_placements",
          periodKey: "gauge",
        },
      },
      data: { used: 100, version: { increment: 1 } },
    });
  },
  true,
);
const seedMs = performance.now() - seedStart;
const samples: {
  operation: string;
  user: number;
  ms: number;
  status: number;
  errorCode?: string;
}[] = [];
async function http(user: TestSession, path: string, body?: unknown) {
  return fetch(config().APP_URL + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      cookie: user.cookie.split(";")[0]!,
      ...(body === undefined
        ? {}
        : {
            Origin: config().APP_URL,
            "Content-Type": "application/json",
            "X-CSRF-Token": user.csrf,
            "Idempotency-Key": randomUUID(),
          }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const cold = performance.now();
const warm = await http(s, "/api/v1/placements?limit=100");
if (!warm.ok) throw Error("Benchmark web server is not ready");
await warm.arrayBuffer();
const coldMs = performance.now() - cold;
for (let round = 0; round < 20; round++) {
  await Promise.all(
    users.map(async (user, index) => {
      const start = performance.now(),
        r = await http(user, "/api/v1/placements?limit=100");
      const data = await r.json();
      samples.push({
        operation: "read_100_rows",
        user: index,
        ms: performance.now() - start,
        status: r.status,
        ...(!r.ok ? { errorCode: String(data.code) } : {}),
      });
      if (r.ok && (!Array.isArray(data) || data.length !== 100))
        throw Error("Benchmark page shape/cardinality mismatch");
    }),
  );
}
for (let round = 0; round < 3; round++) {
  await Promise.all(
    users.map(async (user, index) => {
      const start = performance.now(),
        r = await http(user, "/api/v1/clients", {
          name: "Synthetic measured write",
          code: randomUUID(),
        });
      const data = await r.json();
      samples.push({
        operation: "transactional_write",
        user: index,
        ms: performance.now() - start,
        status: r.status,
        ...(!r.ok ? { errorCode: String(data.code) } : {}),
      });
    }),
  );
}
const csv =
  "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\n" +
  Array.from(
    { length: 1000 },
    (_, i) =>
      `BENCH-${i % 2 ? "B" : "A"},Synthetic benchmark client ${i % 2 ? "B" : "A"},candidate-${i},Synthetic person ${i},placement-${i},2026-10-01,2026-10-${String(5 + (i % 20)).padStart(2, "0")}`,
  ).join("\n");
let start = performance.now();
const staged = await http(s, "/api/v1/imports", {
  sourceProfile: "phase6-performance",
  csv,
});
if (!staged.ok) throw Error("1000-row staging failed");
const batch = await staged.json();
const stageMs = performance.now() - start;
start = performance.now();
const commit = await http(s, `/api/v1/imports/${batch.id}/commit`, {});
if (!commit.ok) throw Error("1000-row unchanged-source commit failed");
await commit.arrayBuffer();
const importCommitMs = performance.now() - start;
const formats: Record<string, unknown> = {};
for (const format of ["csv", "xlsx", "pdf"]) {
  start = performance.now();
  const r = await http(s, "/api/v1/exports", {
    filters: { from: "2026-10-01", to: "2026-10-31", clientId: clients[0]!.id },
    format,
  });
  if (!r.ok) throw Error("Report request failed");
  const run = await r.json();
  const requestMs = performance.now() - start;
  start = performance.now();
  await generateExport(tenantId, run.id);
  const generateMs = performance.now() - start;
  const status = await (await http(s, "/api/v1/exports/" + run.id)).json();
  start = performance.now();
  const artifact = await http(
    s,
    "/api/v1/exports/" + status.artifactId + "/content",
  );
  if (!artifact.ok) throw Error("Authenticated download failed");
  const bytes = Buffer.from(await artifact.arrayBuffer()),
    downloadMs = performance.now() - start;
  let parsedRows: number | undefined;
  if (format === "csv") {
    const rows = parse(bytes.toString("utf8"), {
      skip_empty_lines: true,
    }) as string[][];
    const first = rows.findIndex((r) => r[0] === "Candidate");
    parsedRows = rows.length - first - 1;
  }
  if (format === "xlsx") {
    const sheets = await readXlsxFile(bytes);
    parsedRows = sheets.find((s) => s.sheet === "Placements")!.data.length - 1;
  }
  if (format === "pdf") {
    const result = spawnSync("pdftotext", ["-", "-"], {
      input: bytes,
      maxBuffer: 16 * 1024 * 1024,
    });
    if (result.status !== 0) throw Error("Independent PDF text parser failed");
    parsedRows = (result.stdout.toString().match(/Synthetic person /g) ?? [])
      .length;
  }
  if (parsedRows !== 5000)
    throw Error("Independent export row reconciliation failed for " + format);
  formats[format] = {
    rows: parsedRows,
    bytes: bytes.length,
    requestMs,
    generateMs,
    downloadMs,
    independentReconciliation: true,
  };
}
function stats(operation: string) {
  const all = samples.filter((s) => s.operation === operation),
    times = all
      .filter((s) => s.status === 200)
      .map((s) => s.ms)
      .sort((a, b) => a - b);
  return {
    requests: all.length,
    successes: times.length,
    failures: all.length - times.length,
    errorRate: (all.length - times.length) / all.length,
    p50: times[Math.ceil(times.length * 0.5) - 1],
    p95: times[Math.ceil(times.length * 0.95) - 1],
    max: times.at(-1),
  };
}
const reads = stats("read_100_rows"),
  writes = stats("transactional_write");
const metadata = {
  startedAt,
  completedAt: new Date().toISOString(),
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  reportedCpuCount: os.cpus().length,
  cgroupCpuMax: await readFile("/sys/fs/cgroup/cpu.max", "utf8").catch(
    () => "unavailable",
  ),
  cgroupMemoryMax: await readFile("/sys/fs/cgroup/memory.max", "utf8").catch(
    () => "unavailable",
  ),
  target:
    "loopback Next.js development server + native Docker PostgreSQL, Redis and private local storage",
  users: 20,
  initialPlacements: 10000,
  currentActivePlacements: 100,
  candidates: 10000,
  taskRows: 30000,
  seedMs,
  coldFirstReadMs: coldMs,
  reads,
  writes,
  import1000Rows: {
    mode: "existing-source reconciliation, no allocations bypassed",
    stageMs,
    commitMs: importCommitMs,
  },
  exports: formats,
  queueWaitMeasured: false,
  productionCertified: false,
  localLatencyTargetPassed:
    reads.failures === 0 &&
    writes.failures === 0 &&
    reads.p95! < 2000 &&
    writes.p95! < 3000,
};
await writeFile(
  output + "/performance.json",
  JSON.stringify(metadata, null, 2) + "\n",
);
await writeFile(
  output + "/performance-samples.json",
  JSON.stringify(samples, null, 2) + "\n",
);
console.log(JSON.stringify(metadata, null, 2));
await database().$disconnect();
if (!metadata.localLatencyTargetPassed) process.exitCode = 1;

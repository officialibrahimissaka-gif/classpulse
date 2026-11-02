import { randomUUID } from "node:crypto";
import { assertLocalDemo, localSettings } from "./demo-safety";
assertLocalDemo(await localSettings());
const slug = process.argv[2] ?? "portfolio-demo";
if (!/^[a-z][a-z0-9-]{2,59}$/.test(slug))
  throw Error(
    "Use a workspace address of 3–60 lowercase letters, digits and hyphens, starting with a letter.",
  );
const origin = "http://127.0.0.1:3000",
  email = "demo-owner@example.invalid",
  jar = new Map<string, string>();
let csrf = "";
async function call(
  path: string,
  body?: unknown,
  version?: number,
  allowDenied = false,
): Promise<Record<string, unknown>> {
  const response = await fetch(origin + path, {
    method: body === undefined ? "GET" : "POST",
    redirect: "error",
    signal: AbortSignal.timeout(30000),
    headers: {
      Cookie: [...jar].map(([k, v]) => k + "=" + v).join("; "),
      ...(body === undefined
        ? {}
        : {
            Origin: origin,
            "Content-Type": "application/json",
            "X-CSRF-Token": csrf,
            "Idempotency-Key": randomUUID(),
            ...(version ? { "If-Match": `"v${version}"` } : {}),
          }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  for (const entry of response.headers.getSetCookie()) {
    const pair = entry.split(";")[0]!;
    const at = pair.indexOf("=");
    jar.set(pair.slice(0, at), pair.slice(at + 1));
  }
  const result = (await response.json()) as Record<string, unknown>;
  if (
    allowDenied &&
    response.status === 401 &&
    result.code === "WORKSPACE_DENIED"
  )
    return { denied: true };
  if (!response.ok)
    throw Error(
      typeof result.title === "string"
        ? result.title
        : `Local sample setup failed (${response.status}); existing data was not reset.`,
    );
  return result;
}
await call("/api/auth/development", { name: "Portfolio Demo Owner", email });
const existing = await call("/api/auth/workspace", { slug }, undefined, true);
if (!existing.denied) {
  console.log(
    `Existing '${slug}' workspace preserved. No sample records were added or reset.`,
  );
} else {
  await call("/api/v1/tenants", {
    name: "Portfolio Demo Agency — Synthetic Data",
    slug,
    country: "AE",
    authority: "DEMO ONLY — not a legal attestation",
    timeZone: "Asia/Dubai",
    currency: "AED",
    retentionDays: 90,
    retentionReference:
      "Synthetic local demonstration policy; no real employee data",
    acknowledged: true,
  });
  const me = await call("/api/v1/me");
  csrf = String(me.csrf);
  const clients = [];
  for (let i = 1; i <= 2; i++)
    clients.push(
      await call("/api/v1/clients", {
        name: `Example Client ${i}`,
        code: `DEMO-CLIENT-${i}`,
      }),
    );
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i <= 5; i++) {
    const p = await call("/api/v1/placements", {
      clientId: clients[(i - 1) % 2]!.id,
      candidateName: `Demo Candidate ${i}`,
      candidateKey: `demo-candidate-${i}`,
      sourceProfile: "local-portfolio-sample-v1",
      sourceKey: `demo-placement-${i}`,
      acceptedOn: today,
      plannedStart: today,
    });
    if (i <= 2) {
      let detail = await call(`/api/v1/placements/${p.id}`);
      const tasks = detail.fromPlacementTask_placement as {
        id: string;
        required: boolean;
        state: string;
      }[];
      for (const task of tasks.filter(
        (t) => t.required && !["completed", "waived"].includes(t.state),
      )) {
        await call(
          `/api/v1/placements/${p.id}/actions`,
          {
            action: "complete",
            taskId: task.id,
            evidence: "Synthetic demo confirmation; not an employment decision",
          },
          Number(detail.version),
        );
        detail = await call(`/api/v1/placements/${p.id}`);
      }
      await call(
        `/api/v1/placements/${p.id}/actions`,
        {
          action: "ready",
          reason: "Synthetic checklist reviewed for demonstration",
        },
        Number(detail.version),
      );
      detail = await call(`/api/v1/placements/${p.id}`);
      await call(
        `/api/v1/placements/${p.id}/actions`,
        {
          action: "start",
          date: today,
          reason: "Synthetic first-day confirmation for demonstration",
        },
        Number(detail.version),
      );
    }
  }
  console.log(
    `Created '${slug}' with 2 sample clients and 5 sample placements (2 confirmed starts). All data is synthetic.`,
  );
}
console.log(
  `Local sign-in: name 'Portfolio Demo Owner', email '${email}', then open workspace '${slug}'. No password is used by this local-only demonstration.`,
);

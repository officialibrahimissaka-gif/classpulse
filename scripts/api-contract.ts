import { exportRequestSchema } from "../src/domain/exports";
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { stringify } from "yaml";
import { setupSchema } from "../src/domain/setup";
import {
  clientSchema,
  placementSchema,
  actionSchema,
} from "../src/domain/agency";
const ref = (name: string) => ({ $ref: "#/components/schemas/" + name });
const object = (
  properties: Record<string, unknown>,
  required = Object.keys(properties),
) => ({ type: "object", properties, required, additionalProperties: false });
const str = { type: "string" },
  uuid = { type: "string", format: "uuid" },
  num = { type: "number" },
  bool = { type: "boolean" },
  nullableDate = { type: ["string", "null"], format: "date-time" };
const array = (items: unknown) => ({ type: "array", items });
const js = (schema: z.ZodType) => {
  const result = z.toJSONSchema(schema, { io: "input" });
  delete result.$schema;
  return result;
};
const schemas: Record<string, unknown> = {
  Setup: js(setupSchema),
  ClientInput: js(clientSchema),
  PlacementInput: js(placementSchema),
  PlacementAction: js(actionSchema),
  Ack: object({ id: uuid, version: { type: "integer" }, state: str }, [
    "id",
    "version",
  ]),
  Problem: object(
    {
      type: str,
      title: str,
      status: { type: "integer" },
      code: str,
      requestId: uuid,
      errors: array(object({ field: str, code: str })),
    },
    ["type", "title", "status", "code", "requestId"],
  ),
  Filters: object(
    {
      from: { type: "string", format: "date" },
      to: { type: "string", format: "date" },
      clientId: uuid,
      entityId: uuid,
    },
    ["from", "to"],
  ),
  MetricRow: object({
    id: uuid,
    version: { type: "integer" },
    status: str,
    original: str,
    planned: str,
    actual: { type: ["string", "null"] },
    client: str,
    candidate: str,
    overdue: { type: "integer" },
  }),
  Metrics: object({
    confirmedStarts: num,
    onTimeRate: { type: ["number", "null"] },
    overdueRequired: num,
    medianDelay: { type: ["number", "null"] },
    denominator: num,
    unresolved: num,
    canceled: num,
  }),
  Report: object({
    asOf: str,
    sourceWatermark: str,
    filters: ref("Filters"),
    metrics: ref("Metrics"),
    drilldowns: { type: "object", additionalProperties: array(uuid) },
    distribution: { type: "object", additionalProperties: { type: "integer" } },
    rows: array(ref("MetricRow")),
  }),
  Me: object({
    name: str,
    company: str,
    slug: str,
    csrf: str,
    external: bool,
    reauthAvailable: bool,
    permissions: array(str),
    modules: { type: "object", additionalProperties: str },
    trialEndsAt: nullableDate,
    subscription: object({ planKey: str, state: str }),
    usage: array(object({ resourceKey: str, used: num, hardLimit: num })),
  }),
};
const datamodel = await readFile("prisma/r1/schema.prisma", "utf8");
for (const [, name, body] of datamodel.matchAll(
  /model (\w+) \{([\s\S]*?)\n\}/g,
)) {
  const props: Record<string, unknown> = {},
    required: string[] = [];
  for (const line of body!.split("\n")) {
    const m = line
      .trim()
      .match(/^(\w+)\s+(String|Int|BigInt|Boolean|DateTime|Json)(\?)?\s/);
    if (!m) continue;
    const [, field, type, optional] = m;
    const schema: Record<string, unknown> =
      type === "Json"
        ? {}
        : {
            type:
              type === "Int"
                ? "integer"
                : type === "BigInt"
                  ? "string"
                  : type === "Boolean"
                    ? "boolean"
                    : "string",
          };
    if (type === "DateTime") schema.format = "date-time";
    if (type === "String" && line.includes("@db.Uuid")) schema.format = "uuid";
    props[field!] = optional ? { anyOf: [schema, { type: "null" }] } : schema;
    required.push(field!);
  }
  schemas[name!] = object(props, required);
}
schemas.ClientList = array(
  object({
    id: uuid,
    name: str,
    accountCode: str,
    version: { type: "integer" },
  }),
);
schemas.PlacementList = array(
  object({
    id: uuid,
    status: str,
    timeZone: str,
    originalPlannedStart: str,
    currentPlannedStart: str,
    actualStart: nullableDate,
    version: { type: "integer" },
    candidate: object({ displayName: str }),
    client: object({ name: str }),
    fromPlacementTask_placement: array(
      object({ state: str, required: bool, dueAt: str }),
    ),
  }),
);
schemas.PlacementDetail = {
  allOf: [
    ref("Placement"),
    {
      type: "object",
      properties: {
        candidate: ref("Candidate"),
        client: ref("ClientAccount"),
        fromPlacementTask_placement: array(ref("PlacementTask")),
        fromPlacementException_placement: array(ref("PlacementException")),
        fromPlacementTransition_placement: array(ref("PlacementTransition")),
      },
    },
  ],
};
// PlacementDetail extends the scalar DTO with explicitly selected relations.
(schemas.Placement as { additionalProperties: boolean }).additionalProperties =
  true;
const errorResponses = Object.fromEntries(
  [400, 401, 403, 404, 409, 412, 413, 422, 428, 429, 500, 503].map((status) => [
    String(status),
    {
      description:
        "Problem response; field paths/codes only, never request values.",
      content: { "application/problem+json": { schema: ref("Problem") } },
    },
  ]),
);
const paths: Record<string, Record<string, unknown>> = {};
let index = 0;
function add(
  path: string,
  method: "get" | "post",
  response: unknown,
  request?: unknown,
  permission = "session",
  module = "platform.core",
) {
  const idParams = [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({
    in: "path",
    name: m[1],
    required: true,
    schema: uuid,
  }));
  const parameters = [
    ...idParams,
    ...(method === "post"
      ? [
          {
            in: "header",
            name: "Origin",
            required: true,
            schema: { type: "string", format: "uri" },
          },
          { in: "header", name: "X-CSRF-Token", required: true, schema: str },
          {
            in: "header",
            name: "Idempotency-Key",
            required: true,
            schema: { type: "string", minLength: 16, maxLength: 160 },
          },
        ]
      : []),
  ];
  paths[path] ??= {};
  paths[path][method] = {
    operationId: `R1-API-${String(++index).padStart(3, "0")}`,
    summary: `${method.toUpperCase()} ${path}`,
    description: `Internal R1 endpoint. Permission: ${permission}. Module: ${module}. Current tenant/session/role/module/scope checks apply on every request. Lists are bounded; no public integration API is offered. Exports are limited to 5,000 rows.`,
    security: [{ session: [] }],
    parameters,
    ...(request
      ? {
          requestBody: {
            required: true,
            content: { "application/json": { schema: request } },
          },
        }
      : {}),
    responses: {
      "200": {
        description: "Authorized operation result",
        content: { "application/json": { schema: response } },
      },
      ...errorResponses,
    },
  };
}
add("/api/v1/me", "get", ref("Me"));
add(
  "/api/v1/clients",
  "get",
  ref("ClientList"),
  undefined,
  "accounts.read",
  "crm.accounts",
);
add(
  "/api/v1/clients",
  "post",
  ref("Ack"),
  ref("ClientInput"),
  "accounts.write",
  "crm.accounts",
);
add(
  "/api/v1/placements",
  "get",
  ref("PlacementList"),
  undefined,
  "placements.read",
  "agency.starts",
);
add(
  "/api/v1/placements",
  "post",
  ref("Ack"),
  ref("PlacementInput"),
  "placements.write",
  "agency.starts",
);
add(
  "/api/v1/placements/{id}",
  "get",
  ref("PlacementDetail"),
  undefined,
  "placements.read",
  "agency.starts",
);
add(
  "/api/v1/placements/{id}/actions",
  "post",
  ref("Ack"),
  ref("PlacementAction"),
  "action-specific permission",
  "agency.starts",
);
add(
  "/api/v1/reports",
  "get",
  ref("Report"),
  undefined,
  "reports.read",
  "platform.analytics + agency.starts",
);
(paths["/api/v1/reports"]!.get as { parameters: unknown[] }).parameters = [
  ...["from", "to"].map((name) => ({
    in: "query",
    name,
    required: true,
    schema: { type: "string", format: "date" },
  })),
  ...["clientId", "entityId"].map((name) => ({
    in: "query",
    name,
    required: false,
    schema: uuid,
  })),
];
add(
  "/api/v1/exports",
  "post",
  ref("Ack"),
  js(exportRequestSchema),
  "reports.export",
  "platform.analytics + agency.starts",
);
add(
  "/api/v1/exports/{id}",
  "get",
  object(
    {
      id: uuid,
      state: str,
      errorCode: { type: ["string", "null"] },
      artifactId: uuid,
      snapshotId: { type: ["string", "null"], format: "uuid" },
      expiresAt: str,
    },
    ["id", "state", "errorCode"],
  ),
  undefined,
  "reports.export",
  "platform.analytics",
);
add(
  "/api/v1/exports/{id}/content",
  "get",
  {},
  undefined,
  "reports.export",
  "platform.analytics + agency.starts",
);
(
  paths["/api/v1/exports/{id}/content"]!.get as { responses: unknown }
).responses = {
  "200": {
    description:
      "Authenticated current-scope private artifact; never a presigned URL",
    content: Object.fromEntries(
      [
        "application/pdf",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].map((t) => [t, { schema: { type: "string", format: "binary" } }]),
    ),
  },
  ...errorResponses,
};
add(
  "/api/v1/imports",
  "post",
  ref("Ack"),
  object(
    {
      sourceProfile: str,
      csv: { type: "string", maxLength: 10485760 },
      entityId: uuid,
    },
    ["sourceProfile", "csv"],
  ),
  "imports.run",
  "platform.integrations + agency.starts",
);
add(
  "/api/v1/imports/{id}",
  "get",
  object({
    id: uuid,
    state: str,
    rowCount: num,
    errorCount: num,
    expiresAt: str,
    errors: array(object({ rowNumber: num, columnKey: str, errorCode: str })),
  }),
  undefined,
  "imports.run",
  "platform.integrations",
);
add(
  "/api/v1/imports/{id}/commit",
  "post",
  ref("Ack"),
  object({}),
  "imports.run + accounts.write + placements.write",
  "platform.integrations + agency.starts",
);
add(
  "/api/v1/modules",
  "post",
  ref("Ack"),
  object({
    module: {
      enum: [
        "crm.accounts",
        "agency.starts",
        "platform.analytics",
        "platform.integrations",
      ],
    },
    state: { enum: ["active", "read_only"] },
    cascade: bool,
  }),
  "billing.manage + fresh MFA",
);
add(
  "/api/v1/invitations",
  "post",
  ref("Ack"),
  object({
    placementId: uuid,
    name: str,
    email: { type: "string", format: "email" },
    taskIds: array(uuid),
    sharedFields: array({ enum: ["candidate.name", "planned_start"] }),
  }),
  "participants.manage",
  "agency.starts",
);
add(
  "/api/v1/participants/{id}",
  "get",
  object({
    grants: array(
      object({
        id: uuid,
        revokedAt: nullableDate,
        expiresAt: str,
        contact: object({ displayName: str }),
      }),
    ),
    invitations: array(
      object({
        id: uuid,
        acceptedAt: nullableDate,
        expiresAt: str,
        deliveryRows: array(object({ state: str })),
      }),
    ),
  }),
  undefined,
  "participants.manage",
  "agency.starts",
);
add(
  "/api/v1/participants/revoke",
  "post",
  ref("Ack"),
  object({ grantId: uuid }),
  "participants.manage",
  "agency.starts",
);
add(
  "/api/v1/shared",
  "get",
  array(
    object(
      {
        id: uuid,
        grantId: uuid,
        status: str,
        candidateName: str,
        plannedStart: str,
        tasks: array(
          object({
            id: uuid,
            label: str,
            state: str,
            dueAt: str,
            version: num,
          }),
        ),
      },
      ["id", "grantId", "status", "tasks"],
    ),
  ),
  undefined,
  "placement grant",
  "agency.starts",
);
add(
  "/api/v1/shared/complete",
  "post",
  ref("Ack"),
  object({ placementId: uuid, taskId: uuid, evidence: str }),
  "tasks.complete + current assignment",
  "agency.starts",
);
add(
  "/api/v1/views",
  "get",
  array(
    object({
      id: uuid,
      name: str,
      visibility: str,
      filterSchema: ref("Filters"),
      teamId: { type: ["string", "null"] },
    }),
  ),
  undefined,
  "reports.read",
  "platform.analytics",
);
add(
  "/api/v1/views",
  "post",
  ref("Ack"),
  object(
    {
      name: str,
      visibility: { enum: ["private", "team"] },
      filters: ref("Filters"),
      teamId: uuid,
    },
    ["name", "visibility", "filters"],
  ),
  "reports.read + explicit team membership",
  "platform.analytics",
);
add(
  "/api/v1/teams",
  "get",
  array(object({ team: object({ id: uuid, name: str }) })),
);
add(
  "/api/v1/members",
  "get",
  array(object({ id: uuid, displayName: str, status: str })),
  undefined,
  "tasks.assign",
);
add(
  "/api/v1/members/invite",
  "post",
  ref("Ack"),
  object({
    name: str,
    email: { type: "string", format: "email" },
    role: { enum: ["owner", "recruiter"] },
  }),
  "roles.manage + fresh MFA",
);
add(
  "/api/v1/members/deactivate",
  "post",
  ref("Ack"),
  object({ membershipId: uuid }),
  "roles.manage + fresh MFA",
);
add(
  "/api/v1/tasks/assign",
  "post",
  ref("Ack"),
  object({ taskId: uuid, ownerId: uuid }),
  "tasks.assign",
  "agency.starts",
);
add(
  "/api/v1/template",
  "get",
  object({
    revision: num,
    fromTaskDefinition_templateVersion: array(
      object({ label: str, required: bool, dueOffsetDays: num, dueTime: str }),
    ),
  }),
  undefined,
  "templates.manage",
  "agency.starts",
);
add(
  "/api/v1/template",
  "post",
  ref("Ack"),
  object({
    tasks: array(
      object({
        label: str,
        required: bool,
        dueOffsetDays: { type: "integer", minimum: -365, maximum: 365 },
        dueTime: { type: "string", pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$" },
      }),
    ),
  }),
  "templates.manage",
  "agency.starts",
);
add(
  "/api/v1/commercial-requests",
  "post",
  ref("Ack"),
  object(
    {
      planKey: { enum: ["starter", "growth"] },
      reason: str,
      requestType: { enum: ["upgrade", "downgrade", "cancel"] },
    },
    ["planKey", "reason"],
  ),
  "billing.manage",
);
add(
  "/api/v1/entities",
  "get",
  array(
    object({
      id: uuid,
      code: str,
      name: str,
      countryCode: str,
      authorityCode: str,
      timeZone: str,
      defaultCurrency: str,
    }),
  ),
  undefined,
  "accounts.read",
);
add(
  "/api/v1/entities",
  "post",
  ref("Ack"),
  object({
    code: str,
    name: str,
    country: str,
    authority: str,
    timeZone: str,
    currency: str,
  }),
  "tenant.manage + fresh MFA",
);
add(
  "/api/v1/privacy",
  "get",
  object({
    requests: array(
      object({ id: uuid, state: str, requestType: str, dueAt: str }),
    ),
    candidates: array(object({ id: uuid, displayName: str })),
    contacts: array(object({ id: uuid, displayName: str })),
  }),
  undefined,
  "privacy.manage",
);
add(
  "/api/v1/privacy",
  "post",
  ref("Ack"),
  object({
    subjectType: { enum: ["candidate", "contact"] },
    subjectId: uuid,
    dueOn: { type: "string", format: "date" },
    verificationReference: str,
  }),
  "privacy.manage + fresh MFA",
);
add(
  "/api/v1/holds",
  "post",
  ref("Ack"),
  object({
    reasonCode: str,
    authorityReference: str,
    reviewOn: { type: "string", format: "date" },
  }),
  "privacy.manage + fresh MFA",
);
add(
  "/api/v1/audit",
  "get",
  array(
    object({
      id: uuid,
      action: str,
      resourceType: str,
      resourceId: { type: ["string", "null"] },
      occurredAt: str,
    }),
  ),
  undefined,
  "audit.read",
);
for (const path of [
  "/api/v1/placements/{id}/actions",
  "/api/v1/tasks/assign",
  "/api/v1/shared/complete",
])
  (paths[path]!.post as { parameters: unknown[] }).parameters.push({
    in: "header",
    name: "If-Match",
    required: true,
    schema: { type: "string", pattern: '^"v[0-9]+"$' },
  });
add(
  "/api/v1/tenants",
  "post",
  object({ ok: bool }),
  ref("Setup"),
  "verified identity cookie + exact Origin",
);
const registration = paths["/api/v1/tenants"]!.post as {
  security: unknown[];
  parameters: unknown[];
  responses: Record<string, unknown>;
};
registration.security = [{ identity: [] }];
registration.parameters = [
  {
    in: "header",
    name: "Origin",
    required: true,
    schema: { type: "string", format: "uri" },
  },
];
registration.responses["201"] = registration.responses["200"];
delete registration.responses["200"];
for (const path of ["/api/v1/clients", "/api/v1/placements"])
  (paths[path]!.get as { parameters: unknown[] }).parameters.push(
    { in: "query", name: "after", required: false, schema: uuid },
    {
      in: "query",
      name: "limit",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 100, default: 100 },
    },
  );
const spec = {
  openapi: "3.1.0",
  info: {
    title: "ClassPulse internal R1 API",
    version: "0.1.0",
    description:
      "Implemented application contract, not a public integration API. UTC timestamps, calendar-date filters inclusive; fixed local bounds: clients/members/views 100 and source report 10,000. Auth routes use OIDC PKCE/state/nonce and sealed identity/invitation cookies; see docs/API_CONTRACT.md.",
  },
  servers: [
    {
      url: "http://127.0.0.1:3000",
      description:
        "Local development. Production uses the configured HTTPS origin.",
    },
  ],
  paths,
  components: {
    securitySchemes: {
      session: {
        type: "apiKey",
        in: "cookie",
        name: "__Host-cp-session",
        description: "Local HTTP uses cp-local-session; never a bearer token.",
      },
      identity: { type: "apiKey", in: "cookie", name: "cp-identity" },
    },
    schemas,
  },
};
schemas.BillingSummary = object({
  provider: { type: "string", const: "paystack" },
  mode: { type: "string", const: "test" },
  syncedAt: nullableDate,
  payments: array(
    object({
      reference: str,
      status: str,
      currency: str,
      amountMinor: { type: "string", pattern: "^[0-9]+$" },
      paidAt: nullableDate,
      syncedAt: { type: "string", format: "date-time" },
    }),
  ),
});
add(
  "/api/v1/billing",
  "get",
  ref("BillingSummary"),
  undefined,
  "billing.manage",
);
add(
  "/api/v1/report-snapshots",
  "post",
  ref("Ack"),
  object({ filters: ref("Filters") }),
  "reports.read + reports.export",
  "platform.analytics + agency.starts",
);
add(
  "/api/v1/report-snapshots/{id}",
  "get",
  object({
    id: uuid,
    expiresAt: { type: "string", format: "date-time" },
    data: ref("Report"),
  }),
  undefined,
  "reports.read + reports.export",
  "platform.analytics + agency.starts",
);
const output = stringify(spec, { lineWidth: 110 });
if (process.argv.includes("--check")) {
  if ((await readFile("api/r1.openapi.yaml", "utf8")) !== output)
    throw Error("R1 API contract drift: regenerate and review");
} else await writeFile("api/r1.openapi.yaml", output);
console.log(`Generated ${index} versioned R1 operations.`);

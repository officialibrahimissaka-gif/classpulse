import { z } from "zod";
export const gateNames = [
  "quality",
  "identity",
  "infrastructure",
  "recovery",
  "legal_privacy",
  "operator_audit",
  "requirements",
  "customer_validation",
  "billing",
  "on_call",
] as const;
const digest = z
  .string()
  .regex(
    /^[0-9]{12}\.dkr\.ecr\.me-central-1\.amazonaws\.com\/classpulse\/[a-z-]+@sha256:[a-f0-9]{64}$/,
  );
const signedGate = z
  .object({
    status: z.literal("pass"),
    evidence: z.url().refine((v) => v.startsWith("https://")),
    approver: z.string().min(3),
  })
  .strict();
const gates = Object.fromEntries(
  gateNames.map((n) => [n, signedGate]),
) as Record<(typeof gateNames)[number], typeof signedGate>;
const manifest = z
  .object({
    schemaVersion: z.literal(1),
    decision: z.literal("GO"),
    target: z.enum(["staging", "production"]),
    sourceCommit: z.string().regex(/^[a-f0-9]{40}$/),
    images: z
      .object({ web: digest, worker: digest, operations: digest })
      .strict(),
    gates: z.object(gates).strict(),
  })
  .strict();
export function validateRelease(
  input: unknown,
  target: string,
  commit: string,
) {
  const m = manifest.parse(input);
  if (m.target !== target || m.sourceCommit !== commit)
    throw Error("Release evidence target/source mismatch");
  return m;
}

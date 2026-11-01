import { randomUUID } from "node:crypto";
import { z } from "zod";
export class Problem extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function check(
  condition: unknown,
  status: number,
  code: string,
  message: string,
): asserts condition {
  if (!condition) throw new Problem(status, code, message);
}
export function problemResponse(
  error: unknown,
  requestId: string = randomUUID(),
): Response {
  if (error instanceof z.ZodError)
    return Response.json(
      {
        type: "about:blank",
        title: "Please correct the highlighted fields",
        status: 422,
        code: "VALIDATION",
        requestId,
        errors: error.issues.map((i) => ({
          field: i.path.join("."),
          code: i.code,
        })),
      },
      { status: 422 },
    );
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
    error = new Problem(
      409,
      "DUPLICATE_RECORD",
      "A record already exists with this reference.",
    );
  if (error instanceof SyntaxError)
    error = new Problem(400, "INVALID_JSON", "Submit a valid JSON request.");
  const e =
    error instanceof Problem
      ? error
      : new Problem(
          500,
          "INTERNAL_ERROR",
          "The operation could not be completed. Try again or contact your administrator.",
        );
  // Never log request bodies, database exceptions, tokens or personal data.
  if (e.status === 500)
    console.error(JSON.stringify({ event: "request_failed", requestId }));
  return Response.json(
    {
      type: "about:blank",
      title: e.message,
      status: e.status,
      code: e.code,
      requestId,
    },
    {
      status: e.status,
      headers: {
        "Content-Type": "application/problem+json",
        "Cache-Control": "no-store",
        ...(e.status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}

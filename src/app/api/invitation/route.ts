import { jsonBody } from "@/platform/body";
import { z } from "zod";
import { accept, acceptSchema } from "@/domain/collaboration";
import {
  cookie,
  readCookie,
  readIdentity,
  validateOrigin,
} from "@/platform/auth";
import { seal, unseal } from "@/platform/crypto";
import { check, problemResponse } from "@/platform/errors";
import { rateLimit } from "@/platform/rate-limit";
export async function POST(request: Request) {
  try {
    await rateLimit(request);
    validateOrigin(request);
    const body = z
      .object({
        action: z.enum(["remember", "accept"]),
        context: acceptSchema.optional(),
      })
      .strict()
      .parse(await jsonBody(request));
    if (body.action === "remember") {
      const ctx = acceptSchema.parse(body.context);
      return Response.json(
        { ok: true },
        {
          headers: {
            "set-cookie": cookie("cp-invitation", seal(ctx), 900),
            "Cache-Control": "no-store",
          },
        },
      );
    }
    const raw = readCookie(request, "cp-invitation");
    check(raw, 403, "INVITATION_REQUIRED", "Open the invitation link again.");
    const session = await accept(readIdentity(request), unseal(raw));
    const response = Response.json({ ok: true });
    response.headers.append("set-cookie", session.cookie);
    response.headers.append("set-cookie", cookie("cp-identity", "", 0));
    response.headers.append("set-cookie", cookie("cp-invitation", "", 0));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return problemResponse(error);
  }
}

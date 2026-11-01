import { check } from "./errors";
export async function jsonBody(request: Request, max = 100000) {
  check(request.body, 400, "BODY_REQUIRED", "Submit a request body");
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > max) {
      await reader.cancel();
      check(
        false,
        413,
        "REQUEST_TOO_LARGE",
        "Submit a smaller file or request.",
      );
    }
    chunks.push(next.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

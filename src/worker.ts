import { createServer } from "node:http";
import { runWorker } from "./platform/jobs";
import { database } from "./platform/database";
const close = await runWorker();
const port = Number(process.env.WORKER_PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw Error("Invalid worker health port");
const server = createServer((req, res) => {
  if (req.url !== "/health") {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end('{"status":"running"}');
});
server.listen(
  port,
  process.env.APP_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
);
let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  server.close();
  await close();
  await database().$disconnect();
}
process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

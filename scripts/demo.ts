import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { setTimeout as pause } from "node:timers/promises";
import { assertLocalDemo, localSettings } from "./demo-safety";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2),
  noSample = args.includes("--no-sample"),
  at = args.indexOf("--workspace"),
  slug = at >= 0 ? args[at + 1] : "portfolio-demo";
if (!slug || !/^[a-z][a-z0-9-]{2,59}$/.test(slug))
  throw Error("Provide a valid workspace after --workspace.");
const children: ChildProcess[] = [];
let stopping = false,
  failed = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    try {
      if (process.platform === "win32")
        spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      else process.kill(-child.pid, "SIGTERM");
    } catch {
      /* Child already exited. */
    }
  }
  console.log(
    "App and worker stopping. Your workspaces and local database are preserved.",
  );
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());
async function run(command: string, args: string[], label: string) {
  console.log(`\n${label}`);
  await new Promise<void>((resolve, reject) => {
    const c = spawn(command, args, {
      stdio: "inherit",
      detached: process.platform !== "win32",
    });
    children.push(c);
    c.once("error", () =>
      reject(
        Error(
          `${label} failed to start. Check that Node.js 24 and Docker Desktop are installed and Docker is running.`,
        ),
      ),
    );
    c.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            Error(
              `${label} failed (${code ?? "stopped"}); no database reset was attempted.`,
            ),
          ),
    );
  });
}
async function portFree(port: number) {
  await new Promise<void>((resolve, reject) => {
    const s = createServer();
    s.once("error", () =>
      reject(
        Error(
          `Port ${port} is already in use. Stop your previous app/worker or use its existing browser window; this helper will not kill it.`,
        ),
      ),
    );
    s.listen(port, "127.0.0.1", () => s.close(() => resolve()));
  });
}
function launch(args: string[], name: string) {
  const c = spawn(process.execPath, args, {
    stdio: "inherit",
    detached: process.platform !== "win32",
  });
  children.push(c);
  c.once("error", () => {
    failed = true;
    console.error(`${name} could not start.`);
    void stop();
  });
  c.once("exit", () => {
    if (!stopping) {
      failed = true;
      console.error(
        `${name} exited. Review the message above, then run npm run demo again.`,
      );
      void stop();
    }
  });
}
async function ready(url: string) {
  const until = Date.now() + 120000;
  while (!stopping && Date.now() < until) {
    try {
      if (
        (
          await fetch(url, {
            signal: AbortSignal.timeout(3000),
            redirect: "error",
          })
        ).ok
      )
        return;
    } catch {
      /* Starting. */
    }
    await pause(500);
  }
  throw Error(
    "Local app readiness timed out. Check the earlier messages; ports 3000/3001 and Docker must be available.",
  );
}
try {
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw Error("Install Node.js 24, then run npm ci and npm run demo.");
  if (
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production"
  )
    throw Error("The local demo helper refuses a production environment.");
  try {
    await access(".env.local");
    assertLocalDemo(await localSettings());
  } catch (e) {
    if (!(e instanceof Error && "code" in e && e.code === "ENOENT")) throw e;
  }
  await portFree(3000);
  await portFree(3001);
  await run(
    "docker",
    ["info", "--format", "{{.ServerVersion}}"],
    "Checking Docker Desktop / local Docker engine",
  );
  await run(
    process.execPath,
    ["--import", "tsx", "scripts/local-env.ts"],
    "Preparing private local settings (existing keys are preserved)",
  );
  assertLocalDemo(await localSettings());
  await run(
    "docker",
    ["compose", "--env-file", ".local/docker.env", "up", "-d", "--wait"],
    "Starting local database, Redis and test email inbox",
  );
  await run(
    process.execPath,
    ["--import", "tsx", "scripts/migrate.ts"],
    "Applying tracked migrations (never a reset)",
  );
  await run(
    process.execPath,
    ["node_modules/prisma/build/index.js", "generate"],
    "Preparing the database client",
  );
  launch(
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1"],
    "Web app",
  );
  launch(["--import", "tsx", "src/worker.ts"], "Report and email worker");
  await Promise.all([
    ready("http://127.0.0.1:3000/api/health"),
    ready("http://127.0.0.1:3001/health"),
  ]);
  if (!noSample)
    await run(
      process.execPath,
      ["--import", "tsx", "scripts/demo-sample.ts", slug],
      "Preparing a separate synthetic portfolio workspace",
    );
  console.log(
    "\nREADY ON THIS COMPUTER: http://127.0.0.1:3000\nTest email inbox: http://127.0.0.1:18025\nKeep this terminal open. Press Ctrl+C to stop the app/worker without deleting your data.\nThis is a local app, not a public shareable link. See OPEN_MY_PROJECT.md for the walkthrough and hosting map.",
  );
  while (!stopping) await pause(500);
  if (failed) process.exitCode = 1;
} catch (e) {
  console.error(e instanceof Error ? e.message : "Local startup failed.");
  process.exitCode = 1;
  await stop();
}

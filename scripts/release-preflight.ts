import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { validateRelease } from "../src/operations/release";
const [path = "infra/release-evidence.json", target = "staging"] =
  process.argv.slice(2);
try {
  validateRelease(
    JSON.parse(await readFile(path, "utf8")),
    target,
    execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  );
} catch {
  console.error(
    "Release blocked: reviewed GO evidence for this exact commit/environment and all gate owners is required. See RELEASE_READINESS_CHECKLIST.md.",
  );
  process.exit(1);
}
console.log(
  "Evidence structure passed; protected environment approval and evidence authenticity review are still required.",
);

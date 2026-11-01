import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const violations: string[] = [];
async function walk(dir: string) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "generated") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(ts|tsx)$/.test(p)) {
      const text = await readFile(p, "utf8");
      for (const pattern of [
        /(?<!\.)\beval\s*\(/,
        /dangerouslySetInnerHTML/,
        /\$queryRawUnsafe/,
        /\$executeRawUnsafe/,
        /rejectUnauthorized:\s*false/,
        /localStorage/,
        /console\.log\(.*(?:token|password|secret)/i,
      ])
        if (pattern.test(text)) violations.push(`${p}: ${pattern.source}`);
    }
  }
}
await walk("src");
if (violations.length) throw new Error(violations.join("\n"));
console.log(
  "Static security policy checks passed; independent security review is still required.",
);

import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const dirs = (
  await readdir("prisma/migrations", { withFileTypes: true })
).filter((d) => d.isDirectory());
const hashes: Record<string, string> = {};
for (const dir of dirs)
  hashes[dir.name] = createHash("sha256")
    .update(await readFile(`prisma/migrations/${dir.name}/migration.sql`))
    .digest("hex");
if (process.argv.includes("--record"))
  await writeFile(
    "prisma/migration-checksums.json",
    JSON.stringify(hashes, null, 2) + "\n",
  );
else {
  const expected: unknown = JSON.parse(
    await readFile("prisma/migration-checksums.json", "utf8"),
  );
  if (JSON.stringify(expected) !== JSON.stringify(hashes))
    throw new Error(
      "Unrecorded or altered migration: review the SQL and record checksums",
    );
  console.log(`Verified ${dirs.length} immutable migration checksums.`);
}

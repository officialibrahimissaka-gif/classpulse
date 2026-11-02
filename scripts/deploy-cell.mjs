import { validateRelease } from "../src/operations/release.ts";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const run = (args) => execFileSync("aws", args, { encoding: "utf8" });
const target = process.env.TARGET,
  stack = process.env.STACK_NAME,
  account = process.env.EXPECTED_ACCOUNT,
  path = process.env.PARAMETERS_PATH;
if (
  !["staging", "production"].includes(target) ||
  !/^classpulse-[a-z0-9-]+$/.test(stack ?? "") ||
  !/^\d{12}$/.test(account ?? "") ||
  !path
)
  throw Error(
    "Explicit target, stack, account and non-secret parameters file required",
  );
const m = JSON.parse(
  readFileSync(
    process.env.RELEASE_EVIDENCE_PATH ?? "infra/release-evidence.json",
    "utf8",
  ),
);
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
try {
  validateRelease(m, target, sha);
} catch {
  throw Error(
    "Release blocked: exact reviewed source, target, digests and all evidence gates required",
  );
}
if (
  JSON.parse(run(["sts", "get-caller-identity", "--output", "json"]))
    .Account !== account
)
  throw Error("Wrong AWS account");
// Never scale an already serving cell to zero with the dark-stack workflow.
const existing = spawnSync(
  "aws",
  [
    "cloudformation",
    "describe-stacks",
    "--stack-name",
    stack,
    "--region",
    "me-central-1",
    "--output",
    "json",
  ],
  { encoding: "utf8" },
);
if (existing.status === 0) {
  const state = JSON.parse(existing.stdout);
  if (
    state.Stacks?.[0]?.Parameters?.some(
      (p) => p.ParameterKey === "ReleaseTraffic" && p.ParameterValue === "true",
    )
  )
    throw Error(
      "Serving stack detected; use a separate candidate stack and reviewed cutover",
    );
} else if (!/ValidationError[\s\S]*does not exist/.test(existing.stderr ?? ""))
  throw Error("Cannot verify existing stack; refusing update");
const p = JSON.parse(readFileSync(path, "utf8"));
if (
  !Array.isArray(p) ||
  p.some(
    (x) =>
      typeof x.ParameterKey !== "string" ||
      typeof x.ParameterValue !== "string",
  )
)
  throw Error("Invalid non-secret parameters");
const mapping = {
  WebImage: m.images.web,
  WorkerImage: m.images.worker,
  OperationsImage: m.images.operations,
  Environment: target,
  ReleaseTraffic: "false",
};
const params = p
  .filter((x) => !Object.hasOwn(mapping, x.ParameterKey))
  .concat(
    Object.entries(mapping).map(([ParameterKey, ParameterValue]) => ({
      ParameterKey,
      ParameterValue,
    })),
  );
// No traffic is enabled by this automation. A separate signed activation review follows migration and staging exercises.
run([
  "cloudformation",
  "validate-template",
  "--template-body",
  "file://infra/aws/cell.template.json",
  "--region",
  "me-central-1",
]);
run([
  "cloudformation",
  "deploy",
  "--stack-name",
  stack,
  "--template-file",
  "infra/aws/cell.template.json",
  "--parameter-overrides",
  ...params.map((x) => x.ParameterKey + "=" + x.ParameterValue),
  "--capabilities",
  "CAPABILITY_IAM",
  "--no-fail-on-empty-changeset",
  "--region",
  "me-central-1",
]);
console.log(
  "Dark infrastructure stack updated. Run isolated migration and validation; traffic remains disabled.",
);

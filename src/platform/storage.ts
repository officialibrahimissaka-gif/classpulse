import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "./config";
import { check } from "./errors";
function path(key: string) {
  check(
    /^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(pdf|csv|xlsx|csv\.enc)$/.test(key),
    500,
    "INVALID_STORAGE_KEY",
    "Artifact unavailable",
  );
  return resolve(config().ARTIFACT_DIRECTORY, key);
}
function client() {
  return new S3Client({
    region: config().AWS_REGION,
    requestHandler: { requestTimeout: 8000, connectionTimeout: 5000 },
  });
}
export async function putArtifact(key: string, data: Buffer, type: string) {
  const c = config();
  if (c.STORAGE_DRIVER === "local") {
    const p = path(key);
    await mkdir(resolve(p, ".."), { recursive: true, mode: 0o700 });
    await writeFile(p, data, { mode: 0o600, flag: "wx" });
    return "local-v1";
  }
  check(
    c.S3_BUCKET,
    503,
    "STORAGE_NOT_CONFIGURED",
    "Artifact storage is not configured",
  );
  const result = await client().send(
    new PutObjectCommand({
      Bucket: c.S3_BUCKET,
      Key: key,
      Body: data,
      ContentType: type,
      ServerSideEncryption: "aws:kms",
    }),
  );
  return result.VersionId ?? "unversioned";
}
export async function getArtifact(key: string, version: string) {
  const c = config();
  if (c.STORAGE_DRIVER === "local") return readFile(path(key));
  check(
    c.S3_BUCKET,
    503,
    "STORAGE_NOT_CONFIGURED",
    "Artifact storage is not configured",
  );
  const response = await client().send(
    new GetObjectCommand({
      Bucket: c.S3_BUCKET,
      Key: key,
      ...(version === "unversioned" ? {} : { VersionId: version }),
    }),
  );
  check(response.Body, 404, "ARTIFACT_MISSING", "Artifact unavailable");
  return Buffer.from(await response.Body.transformToByteArray());
}
export async function removeArtifact(key: string, version: string) {
  const c = config();
  if (c.STORAGE_DRIVER === "local") {
    await unlink(path(key)).catch((error: unknown) => {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    });
    return;
  }
  await client().send(
    new DeleteObjectCommand({
      Bucket: c.S3_BUCKET,
      Key: key,
      ...(version === "unversioned" ? {} : { VersionId: version }),
    }),
  );
}

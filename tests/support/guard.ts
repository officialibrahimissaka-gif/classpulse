import { config } from "@/platform/config";
const c = config();
if (
  c.APP_ENV === "production" ||
  [c.DATABASE_URL, c.REDIS_URL, c.APP_URL].some(
    (value) => !["127.0.0.1", "localhost"].includes(new URL(value).hostname),
  )
)
  throw Error(
    "Automated local tests refuse production or non-loopback targets.",
  );

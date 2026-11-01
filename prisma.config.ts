// Design-time configuration. Install a reviewed Prisma 7 patch before use.
import "dotenv/config";
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: "prisma/r1/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://design:design@127.0.0.1:5432/design",
  },
});

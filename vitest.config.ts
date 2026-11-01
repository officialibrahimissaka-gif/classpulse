import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", testTimeout: 30000, hookTimeout: 60000 },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});

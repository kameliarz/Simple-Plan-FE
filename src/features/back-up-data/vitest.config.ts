import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: "src/features/back-up-data/__tests__/.cache",
  resolve: { alias: { "@": fileURLToPath(new URL("../../", import.meta.url)) } },
  test: {
    env: { VITE_API_BASE_URL: "http://test.invalid/api/v1" },
    environment: "jsdom",
    include: ["src/features/back-up-data/**/*.test.{ts,tsx}"],
    setupFiles: ["src/features/back-up-data/__tests__/setup.ts"],
    restoreMocks: true,
  },
});

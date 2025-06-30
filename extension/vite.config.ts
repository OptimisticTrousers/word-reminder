/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { coverageConfigDefaults, configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ["common"] },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts", "./tests/__mocks__/chrome.ts"],
    exclude: [...configDefaults.exclude, "**/e2e/**"],
    coverage: {
      exclude: [
        "**/index.ts",
        "*.config.*",
        "**/types.ts",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
  build: {
    sourcemap: true,
    emptyOutDir: false,
  },
});

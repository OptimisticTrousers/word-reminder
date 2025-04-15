import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/service-worker/service-worker.ts",
      formats: ["es"],
      fileName: "service-worker",
    },
    outDir: "dist",
    sourcemap: true,
  },
});

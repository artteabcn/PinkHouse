import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same "@/..." alias as tsconfig.json, so route handlers can be tested.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});

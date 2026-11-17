import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "app/**/*.{ts,tsx}", "components/**/*.tsx"],
      exclude: ["app/layout.tsx", "components/AdminCharts.tsx", "lib/types.ts"],
      reporter: ["text", "html"],
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 85 },
    },
  },
});

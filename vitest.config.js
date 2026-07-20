import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // This codebase follows Next.js convention: components use JSX in plain .js
  // files. Vite's default oxc transform excludes .js from JSX parsing, so
  // widen it to match.
  oxc: {
    include: /\.(m?ts|[jt]sx|m?js)$/,
    exclude: [],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    globals: true,
    include: ["src/**/*.test.{js,jsx}"],
  },
});

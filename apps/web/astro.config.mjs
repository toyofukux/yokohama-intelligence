import { defineConfig } from "astro/config";
export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "https://yokohama-intelligence.toyofukux.workers.dev",
  trailingSlash: "always",
});

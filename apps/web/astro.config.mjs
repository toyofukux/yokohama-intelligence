import { defineConfig } from "astro/config";
import { checkRelease } from "../../scripts/factcheck.ts";
import { ensureEvidenceCache } from "../../scripts/factcheck-cache.ts";
await ensureEvidenceCache();
await checkRelease();
export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "https://open.yokohama",
  trailingSlash: "always",
});

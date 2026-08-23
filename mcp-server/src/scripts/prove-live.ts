import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Orchestrator, type MaintainerSignal } from "@changelog-radar/shared";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(root, ".env") });

const outDir = path.join(root, "docs", "proof", "live-collect");
await fs.mkdir(outDir, { recursive: true });

const orch = new Orchestrator();
await orch.init();

const pkg = await fs.readFile(path.join(root, "fixtures", "package.json"), "utf8");
const result = await orch.auditPackageJson(pkg, {
  mode: "reactive",
  includeGithub: true,
  includeChaos: Boolean(process.env.CHAOS_PAGE_URL) || orch.client.mock,
  limit: 5,
});

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = path.join(outDir, `live-${stamp}.json`);
await fs.writeFile(outFile, JSON.stringify(result, null, 2), "utf8");

const sources = new Set(result.signals.map((s: MaintainerSignal) => s.source));
console.log(`Wrote ${outFile}`);
console.log(`mock=${orch.client.mock}`);
console.log(`sources=${[...sources].join(",")}`);
console.log(`signals=${result.signals.length} bumps=${result.bumps.length}`);
console.log(`errors=${result.errors.join(" | ") || "(none)"}`);

if (!sources.has("npm")) {
  console.error("FAIL: missing npm signals");
  process.exit(1);
}
if (!sources.has("github_releases") && !orch.client.mock) {
  console.warn("WARN: no github_releases rows (check collector / repo URLs)");
}
console.log("Proof A: PASS (npm rows present)");

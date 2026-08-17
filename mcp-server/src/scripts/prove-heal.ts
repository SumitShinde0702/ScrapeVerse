import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Orchestrator } from "@changelog-radar/shared";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(root, ".env") });

const outDir = path.join(root, "docs", "proof", "heal");
await fs.mkdir(outDir, { recursive: true });

const orch = new Orchestrator();
await orch.init();

const pkg = await fs.readFile(path.join(root, "fixtures", "package.json"), "utf8");

const before = await orch.auditPackageJson(pkg, {
  mode: "reactive",
  includeGithub: false,
  includeChaos: true,
  forceChaosBreak: false,
  limit: 2,
});

const after = await orch.auditPackageJson(pkg, {
  mode: "reactive",
  includeGithub: false,
  includeChaos: true,
  forceChaosBreak: true,
  limit: 2,
});

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const payload = { before, after, mock: orch.client.mock };
const outFile = path.join(outDir, `heal-${stamp}.json`);
await fs.writeFile(outFile, JSON.stringify(payload, null, 2), "utf8");

const healed = after.heal_events.some((e) => e.stage === "retry_succeeded");
console.log(`Wrote ${outFile}`);
console.log(`heal_events=${after.heal_events.length} retry_succeeded=${healed}`);
if (!healed && after.heal_events.length === 0) {
  console.error("FAIL: no heal events");
  process.exit(1);
}
console.log("Proof B: PASS (heal pipeline exercised)");
console.log(
  "For a live DOM break: edit fixtures/chaos-page selectors on the hosted URL, then re-run with CHANGELOG_RADAR_MOCK=0.",
);

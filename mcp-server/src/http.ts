import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { orchestrator } from "./runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const fixturesPkg = path.join(root, "fixtures", "package.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    mock: orchestrator.client.mock,
    watching: orchestrator.isWatching(),
    collectors: orchestrator.getHealth(),
  });
});

app.get("/api/health/collectors", (_req, res) => {
  res.json({
    health: orchestrator.getHealth(),
    heal_events: orchestrator.getHealLog(),
    watching: orchestrator.isWatching(),
    mock: orchestrator.client.mock,
  });
});

app.get("/api/findings", (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json({ findings: orchestrator.store.list(limit) });
});

app.post("/api/audit", async (req, res) => {
  try {
    const packageJson =
      typeof req.body?.packageJson === "string"
        ? req.body.packageJson
        : fs.readFileSync(fixturesPkg, "utf8");
    const result = await orchestrator.auditPackageJson(packageJson, {
      mode: "reactive",
      includeGithub: req.body?.includeGithub !== false,
      includeChaos: Boolean(req.body?.includeChaos),
      forceChaosBreak: Boolean(req.body?.forceChaosBreak),
      chaosUrl: req.body?.chaosUrl,
      limit: req.body?.limit ?? 8,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/watch/start", async (req, res) => {
  try {
    const packageJson =
      typeof req.body?.packageJson === "string"
        ? req.body.packageJson
        : fs.readFileSync(fixturesPkg, "utf8");
    const intervalMs = Number(req.body?.intervalMs ?? 15 * 60_000);
    const result = await orchestrator.startWatch(packageJson, intervalMs);
    res.json({ watching: true, intervalMs, result });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/watch/stop", (_req, res) => {
  orchestrator.stopWatch();
  res.json({ watching: false });
});

app.post("/api/chaos/heal-demo", async (req, res) => {
  try {
    const packageJson = fs.readFileSync(fixturesPkg, "utf8");
    const result = await orchestrator.auditPackageJson(packageJson, {
      mode: "reactive",
      includeGithub: false,
      includeChaos: true,
      forceChaosBreak: true,
      chaosUrl: req.body?.chaosUrl,
      limit: 3,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get("/api/fixture/package", (_req, res) => {
  res.type("json").send(fs.readFileSync(fixturesPkg, "utf8"));
});

const port = Number(
  process.env.CHANGELOG_RADAR_API_PORT ?? process.env.PORT ?? 8787,
);
const host = process.env.HOST ?? "0.0.0.0";
app.listen(port, host, () => {
  console.log(
    `Changelog Radar API on http://${host}:${port} (mock=${orchestrator.client.mock})`,
  );
});

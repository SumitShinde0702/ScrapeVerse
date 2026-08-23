import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePackageJson, type DepRef } from "@changelog-radar/shared";
import cors from "cors";
import express from "express";
import {
  openaiEnabled,
  reviewScrapePlan,
  summarizeAudit,
  type PreviewDep,
} from "./openai.js";
import { orchestrator } from "./runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const fixturesPkg = path.join(root, "fixtures", "package.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "changelog-radar-api",
    health: "/health",
    collectors: "/api/health/collectors",
  });
});

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

app.post("/api/preview", async (req, res) => {
  try {
    const packageJson =
      typeof req.body?.packageJson === "string"
        ? req.body.packageJson
        : fs.readFileSync(fixturesPkg, "utf8");
    const includeGithub = req.body?.includeGithub !== false;
    const includeChaos = Boolean(req.body?.includeChaos);
    const limit = Number(req.body?.limit ?? 12);
    const chaosUrl =
      typeof req.body?.chaosUrl === "string"
        ? req.body.chaosUrl
        : (orchestrator.config.chaosPageUrl ?? "https://example.com/chaos-demo");

    const deps: PreviewDep[] = parsePackageJson(packageJson)
      .slice(0, Number.isFinite(limit) ? limit : 12)
      .map((d: DepRef) => ({
        name: d.name,
        version: d.version,
        npmUrl: d.npmUrl,
        githubReleasesUrl: includeGithub ? d.githubReleasesUrl : undefined,
        chaosUrl: includeChaos ? chaosUrl : undefined,
      }));

    const reviewed = await reviewScrapePlan(deps);
    res.json({
      includeGithub,
      includeChaos,
      chaosUrl: includeChaos ? chaosUrl : undefined,
      aiEnabled: reviewed.aiEnabled,
      aiNote: reviewed.aiNote,
      deps: reviewed.deps,
    });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/summarize", async (req, res) => {
  try {
    if (!openaiEnabled()) {
      res.json({ summary: null, aiEnabled: false });
      return;
    }
    const summary = await summarizeAudit({
      signals: Array.isArray(req.body?.signals) ? req.body.signals : [],
      bumps: Array.isArray(req.body?.bumps) ? req.body.bumps : [],
    });
    res.json({ summary, aiEnabled: true });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
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

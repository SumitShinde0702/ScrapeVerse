import { randomUUID } from "node:crypto";
import { BrightDataClient } from "./brightdata/client.js";
import { scrapeAndValidate } from "./brightdata/scrape.js";
import { loadConfigFromEnv, type BrightDataConfig } from "./config.js";
import { parsePackageJson, type DepRef } from "./manifests.js";
import type {
  AuditResult,
  CollectorHealth,
  HealEvent,
  Source,
  SuggestedBump,
} from "./schemas.js";
import { suggestBump } from "./signals.js";
import { FindingsStore } from "./store.js";

export type AuditOptions = {
  mode?: "reactive" | "proactive";
  includeGithub?: boolean;
  includeChaos?: boolean;
  forceChaosBreak?: boolean;
  limit?: number;
  chaosUrl?: string;
};

export class Orchestrator {
  readonly client: BrightDataClient;
  readonly store: FindingsStore;
  readonly config: BrightDataConfig;
  private health: Record<Source, CollectorHealth> = {
    npm: "idle",
    github_releases: "idle",
    chaos: "idle",
  };
  private healLog: HealEvent[] = [];
  private watchTimer: ReturnType<typeof setInterval> | null = null;
  private watchManifest: string | null = null;

  constructor(
    config: BrightDataConfig = loadConfigFromEnv(),
    store = new FindingsStore(),
  ) {
    this.config = config;
    this.client = new BrightDataClient(config);
    this.store = store;
  }

  getHealth() {
    return { ...this.health };
  }

  getHealLog(limit = 40) {
    return this.healLog.slice(-limit);
  }

  async init() {
    await this.store.load();
  }

  async auditPackageJson(
    packageJsonRaw: string,
    opts: AuditOptions = {},
  ): Promise<AuditResult> {
    const mode = opts.mode ?? "reactive";
    const deps = parsePackageJson(packageJsonRaw).slice(0, opts.limit ?? 12);
    return this.auditDeps(deps, opts, mode);
  }

  async auditDeps(
    deps: DepRef[],
    opts: AuditOptions = {},
    mode: "reactive" | "proactive" = "reactive",
  ): Promise<AuditResult> {
    const audit_id = randomUUID();
    const started_at = new Date().toISOString();
    const heal_events: HealEvent[] = [];
    const errors: string[] = [];
    const bumps: SuggestedBump[] = [];
    const currentByName = Object.fromEntries(deps.map((d) => [d.name, d.version]));

    const onHeal = (e: HealEvent) => {
      heal_events.push(e);
      this.healLog.push(e);
      this.health[e.collector] =
        e.stage === "retry_succeeded"
          ? "healthy"
          : e.stage.startsWith("heal") || e.stage === "validation_failed"
            ? "healing"
            : this.health[e.collector];
    };

    // npm
    this.health.npm = "scraping";
    const npmUrls = deps.map((d) => d.npmUrl);
    const npmOut = await scrapeAndValidate(this.client, "npm", npmUrls, {
      onHealEvent: onHeal,
    });
    this.health.npm = npmOut.error ? "failed" : "healthy";
    if (npmOut.error) errors.push(`npm: ${npmOut.error}`);

    // github
    let ghSignals = [] as typeof npmOut.signals;
    if (opts.includeGithub !== false) {
      const ghUrls = deps
        .map((d) => d.githubReleasesUrl)
        .filter((u): u is string => Boolean(u));
      if (ghUrls.length) {
        this.health.github_releases = "scraping";
        const ghOut = await scrapeAndValidate(
          this.client,
          "github_releases",
          ghUrls.slice(0, opts.limit ?? 8),
          { onHealEvent: onHeal },
        );
        ghSignals = ghOut.signals;
        this.health.github_releases = ghOut.error ? "failed" : "healthy";
        if (ghOut.error) errors.push(`github: ${ghOut.error}`);
      }
    }

    // chaos
    let chaosSignals = [] as typeof npmOut.signals;
    if (opts.includeChaos || opts.forceChaosBreak) {
      const chaosUrl =
        opts.chaosUrl ??
        this.config.chaosPageUrl ??
        "https://example.com/chaos-demo";
      this.health.chaos = "scraping";
      const chaosOut = await scrapeAndValidate(this.client, "chaos", [chaosUrl], {
        forceChaosBreak: opts.forceChaosBreak,
        onHealEvent: onHeal,
      });
      chaosSignals = chaosOut.signals;
      this.health.chaos = chaosOut.error && !chaosOut.healed ? "failed" : "healthy";
      if (chaosOut.error && !chaosOut.signals.length) {
        errors.push(`chaos: ${chaosOut.error}`);
      }
    }

    const signals = [...npmOut.signals, ...ghSignals, ...chaosSignals];
    for (const s of signals) {
      const bump = suggestBump(s, currentByName[s.package_name] ?? null);
      if (bump) bumps.push(bump);
    }

    await this.store.addMany(
      signals.map((signal) => ({
        mode,
        signal,
        bump:
          bumps.find(
            (b) =>
              b.package_name === signal.package_name && b.source === signal.source,
          ) ?? null,
      })),
    );

    return {
      audit_id,
      started_at,
      finished_at: new Date().toISOString(),
      mode,
      signals,
      bumps,
      heal_events,
      health: { ...this.health },
      errors,
    };
  }

  startWatch(packageJsonRaw: string, intervalMs = 15 * 60_000) {
    this.watchManifest = packageJsonRaw;
    if (this.watchTimer) clearInterval(this.watchTimer);
    this.watchTimer = setInterval(() => {
      void this.auditPackageJson(packageJsonRaw, { mode: "proactive" });
    }, intervalMs);
    return this.auditPackageJson(packageJsonRaw, { mode: "proactive" });
  }

  stopWatch() {
    if (this.watchTimer) clearInterval(this.watchTimer);
    this.watchTimer = null;
    this.watchManifest = null;
  }

  isWatching() {
    return Boolean(this.watchTimer);
  }

  getWatchManifest() {
    return this.watchManifest;
  }
}

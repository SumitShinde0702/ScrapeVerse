import { z } from "zod";
import {
  MaintainerSignalSchema,
  type HealEvent,
  type MaintainerSignal,
  type Source,
} from "../schemas.js";
import { enrichSignal } from "../signals.js";
import type { BrightDataClient } from "./client.js";
import { mockBrokenChaosRow, mockRowsForUrl } from "./mock.js";

export function buildHealPrompt(
  source: Source,
  issues: string[],
): string {
  return [
    `The ${source} scraper output failed schema validation after a likely site layout change.`,
    `Missing or invalid fields: ${issues.join("; ")}.`,
    `Re-extract using plain-language descriptions: package_name, latest_version (header/tag), notice_text (security/deprecation banner), changelog_excerpt (release notes body).`,
    `Keep the same JSON field names. Fix selectors for the current DOM.`,
  ]
    .join(" ")
    .slice(0, 1000);
}

export function validateRows(
  source: Source,
  rows: unknown[],
): { ok: MaintainerSignal[]; issues: string[] } {
  const ok: MaintainerSignal[] = [];
  const issues: string[] = [];
  if (!rows.length) {
    issues.push("empty dataset");
    return { ok, issues };
  }
  for (const [i, row] of rows.entries()) {
    const normalized = normalizeRow(source, row);
    const parsed = MaintainerSignalSchema.safeParse(normalized);
    if (parsed.success) {
      ok.push(enrichSignal(parsed.data));
    } else {
      for (const issue of parsed.error.issues) {
        issues.push(`[${i}] ${issue.path.join(".")}: ${issue.message}`);
      }
    }
  }
  return { ok, issues };
}

function normalizeRow(source: Source, row: unknown): unknown {
  if (!row || typeof row !== "object") return row;
  const r = row as Record<string, unknown>;
  return {
    source: r.source ?? source,
    package_name:
      r.package_name ?? r.packageName ?? r.name ?? r.title ?? "unknown",
    url: r.url ?? (r.input as { url?: string } | undefined)?.url ?? "https://example.com",
    latest_version:
      r.latest_version ?? r.latestVersion ?? r.version ?? r.tag ?? "",
    published_at: r.published_at ?? r.publishedAt ?? r.date ?? null,
    deprecated_or_yanked: Boolean(
      r.deprecated_or_yanked ?? r.deprecated ?? r.yanked ?? false,
    ),
    notice_text: r.notice_text ?? r.notice ?? r.banner ?? null,
    changelog_excerpt:
      r.changelog_excerpt ??
      r.changelog ??
      r.release_notes ??
      r.description ??
      "",
    signal_tags: r.signal_tags ?? [],
  };
}

export type ScrapeOutcome = {
  signals: MaintainerSignal[];
  healEvents: HealEvent[];
  healed: boolean;
  error?: string;
};

export async function scrapeAndValidate(
  client: BrightDataClient,
  source: Source,
  urls: string[],
  opts: {
    forceChaosBreak?: boolean;
    onHealEvent?: (e: HealEvent) => void;
  } = {},
): Promise<ScrapeOutcome> {
  const healEvents: HealEvent[] = [];
  const push = (e: {
    stage: HealEvent["stage"];
    detail: string;
    zod_issues?: string[];
    id?: string;
  }) => {
    const event: HealEvent = {
      id: e.id ?? `${source}-${Date.now()}-${healEvents.length}`,
      at: new Date().toISOString(),
      collector: source,
      stage: e.stage,
      detail: e.detail,
      zod_issues: e.zod_issues,
    };
    healEvents.push(event);
    opts.onHealEvent?.(event);
  };

  const inputs = urls.map((url) => ({ url }));

  let raw: unknown[];
  try {
    if (client.mock) {
      if (opts.forceChaosBreak && source === "chaos") {
        raw = mockBrokenChaosRow(urls[0] ?? "https://example.com/chaos");
      } else {
        raw = urls.flatMap((u) => mockRowsForUrl(source, u));
      }
    } else {
      raw = await client.scrape(source, inputs);
    }
  } catch (err) {
    return {
      signals: [],
      healEvents,
      healed: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  let { ok, issues } = validateRows(source, raw);
  if (ok.length && !issues.length) {
    return { signals: ok, healEvents, healed: false };
  }

  push({
    stage: "validation_failed",
    detail: `Zod validation failed for ${source}`,
    zod_issues: issues,
  });

  push({
    stage: "heal_started",
    detail: buildHealPrompt(source, issues),
  });

  try {
    if (client.mock) {
      // Simulate async heal + successful retry with good data
      push({
        stage: "heal_pending_answer",
        detail: "Mock heal proposed selector rewrite (auto-approve)",
      });
      push({
        stage: "heal_approved",
        detail: "Auto-approved mock heal",
      });
      push({
        stage: "retry_started",
        detail: "Re-scraping after mock heal",
      });
      raw = urls.flatMap((u) => mockRowsForUrl(source, u));
    } else {
      await client.triggerHeal(source, buildHealPrompt(source, issues));
      const progress = await client.pollHealProgress(source);
      push({
        stage: "heal_pending_answer",
        detail: `Heal status: ${progress.status}`,
      });
      if (progress.status === "pending_answer") {
        await client.approveHeal(source, true);
        push({
          stage: "heal_approved",
          detail: "Auto-approved Bright Data heal diff",
        });
      } else {
        push({
          stage: "heal_approved",
          detail: `Heal finished with status ${progress.status}`,
        });
      }
      push({
        stage: "retry_started",
        detail: "Re-triggering collector after heal",
      });
      raw = await client.scrape(source, inputs);
    }

    ({ ok, issues } = validateRows(source, raw));
    if (ok.length && issues.length === 0) {
      push({
        stage: "retry_succeeded",
        detail: `Recovered ${ok.length} row(s) for ${source}`,
      });
      return { signals: ok, healEvents, healed: true };
    }

    push({
      stage: "retry_failed",
      detail: `Still invalid after heal: ${issues.join("; ")}`,
      zod_issues: issues,
    });
    return {
      signals: ok,
      healEvents,
      healed: true,
      error: issues.join("; "),
    };
  } catch (err) {
    push({
      stage: "retry_failed",
      detail: err instanceof Error ? err.message : String(err),
    });
    return {
      signals: [],
      healEvents,
      healed: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const PackageJsonSchema = z.object({
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
  optionalDependencies: z.record(z.string()).optional(),
});

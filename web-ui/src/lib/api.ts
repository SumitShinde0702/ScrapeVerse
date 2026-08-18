export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Empty = same-origin (Next.js proxies /api/* to the orchestration API). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type Source = "npm" | "github_releases" | "chaos";
export type CollectorHealth =
  | "idle"
  | "scraping"
  | "healing"
  | "healthy"
  | "failed";

export type MaintainerSignal = {
  source: Source;
  package_name: string;
  url: string;
  latest_version: string;
  published_at?: string | null;
  deprecated_or_yanked: boolean;
  notice_text?: string | null;
  changelog_excerpt: string;
  signal_tags: string[];
};

export type SuggestedBump = {
  package_name: string;
  current_version: string | null;
  suggested_version: string;
  reason: string;
  source: Source;
  signal_tags: string[];
};

export type HealEvent = {
  id: string;
  at: string;
  collector: Source;
  stage: string;
  detail: string;
  zod_issues?: string[];
};

export type AuditResult = {
  audit_id: string;
  started_at: string;
  finished_at: string;
  mode: "reactive" | "proactive";
  signals: MaintainerSignal[];
  bumps: SuggestedBump[];
  heal_events: HealEvent[];
  health: Record<Source, CollectorHealth>;
  errors: string[];
};

export type Finding = {
  id: string;
  at: string;
  mode: "reactive" | "proactive";
  signal: MaintainerSignal;
  bump?: SuggestedBump | null;
};

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/api/health/collectors`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("health fetch failed");
  return res.json() as Promise<{
    health: Record<Source, CollectorHealth>;
    heal_events: HealEvent[];
    watching: boolean;
    mock: boolean;
  }>;
}

export async function fetchFindings() {
  const res = await fetch(`${API_URL}/api/findings?limit=40`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("findings fetch failed");
  return res.json() as Promise<{ findings: Finding[] }>;
}

export async function runAudit(body: Record<string, unknown> = {}) {
  const res = await fetch(`${API_URL}/api/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "audit failed");
  return data as AuditResult;
}

export async function runChaosHeal() {
  const res = await fetch(`${API_URL}/api/chaos/heal-demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "chaos heal failed");
  return data as AuditResult;
}

export async function startWatch(body: Record<string, unknown> = {}) {
  const res = await fetch(`${API_URL}/api/watch/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intervalMs: 15 * 60_000, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "watch failed");
  return data;
}

export async function stopWatch() {
  const res = await fetch(`${API_URL}/api/watch/stop`, { method: "POST" });
  return res.json();
}

export async function fetchFixturePackage() {
  const res = await fetch(`${API_URL}/api/fixture/package`);
  return res.text();
}

export type UrlCheckStatus = "ok" | "unsure" | "likely_wrong";

export type UrlCheck = {
  status: UrlCheckStatus;
  reason: string;
};

export type ScrapePlanDep = {
  name: string;
  version: string;
  npmUrl: string;
  githubReleasesUrl?: string;
  chaosUrl?: string;
  checks?: {
    npm?: UrlCheck;
    github?: UrlCheck;
    chaos?: UrlCheck;
  };
};

export type ScrapePlan = {
  includeGithub: boolean;
  includeChaos: boolean;
  chaosUrl?: string;
  aiEnabled: boolean;
  aiNote?: string;
  deps: ScrapePlanDep[];
};

export async function fetchScrapePlan(body: Record<string, unknown> = {}) {
  const res = await fetch(`${API_URL}/api/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "preview failed");
  return data as ScrapePlan;
}

export async function summarizeAudit(body: {
  signals: Array<{
    package_name: string;
    source: string;
    latest_version: string;
    signal_tags: string[];
  }>;
  bumps: Array<{
    package_name: string;
    current_version: string | null;
    suggested_version: string;
    reason: string;
  }>;
}) {
  const res = await fetch(`${API_URL}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "summarize failed");
  return data as { summary: string | null; aiEnabled: boolean };
}

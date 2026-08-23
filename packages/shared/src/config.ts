import type { Source } from "./schemas.js";

export type BrightDataConfig = {
  apiToken: string;
  collectors: Partial<Record<Source, string>>;
  mock: boolean;
  chaosPageUrl?: string;
  baseUrl?: string;
};

function configured(value: string | undefined): string | undefined {
  const v = value?.trim() ?? "";
  if (!v) return undefined;
  const lower = v.toLowerCase();
  if (
    lower === "your_api_token_here" ||
    lower === "c_xxxxxxxx" ||
    lower.startsWith("c_xxxx") ||
    v === "c_..." ||
    v === "..."
  ) {
    return undefined;
  }
  return v;
}

export function loadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): BrightDataConfig {
  const apiToken = configured(env.BRIGHT_DATA_API_TOKEN) ?? "";
  const collectors = {
    npm: configured(env.BRIGHT_DATA_COLLECTOR_NPM),
    github_releases: configured(env.BRIGHT_DATA_COLLECTOR_GITHUB),
    chaos: configured(env.BRIGHT_DATA_COLLECTOR_CHAOS),
  };
  const forceMock = env.CHANGELOG_RADAR_MOCK === "1";
  // Live scrape needs a real token and at least an npm collector. Missing
  // either used to throw "No collector configured" and render an empty Radar.
  const canLive = Boolean(apiToken && collectors.npm);
  return {
    apiToken,
    collectors,
    mock: forceMock || !canLive,
    chaosPageUrl: configured(env.CHAOS_PAGE_URL),
    baseUrl: env.BRIGHT_DATA_API_BASE?.trim() || "https://api.brightdata.com",
  };
}

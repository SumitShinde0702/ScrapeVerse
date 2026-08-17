import type { Source } from "./schemas.js";

export type BrightDataConfig = {
  apiToken: string;
  collectors: Partial<Record<Source, string>>;
  mock: boolean;
  chaosPageUrl?: string;
  baseUrl?: string;
};

export function loadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): BrightDataConfig {
  return {
    apiToken: env.BRIGHT_DATA_API_TOKEN?.trim() ?? "",
    collectors: {
      npm: env.BRIGHT_DATA_COLLECTOR_NPM?.trim() || undefined,
      github_releases: env.BRIGHT_DATA_COLLECTOR_GITHUB?.trim() || undefined,
      chaos: env.BRIGHT_DATA_COLLECTOR_CHAOS?.trim() || undefined,
    },
    mock: env.CHANGELOG_RADAR_MOCK === "1" || !env.BRIGHT_DATA_API_TOKEN,
    chaosPageUrl: env.CHAOS_PAGE_URL?.trim() || undefined,
    baseUrl: env.BRIGHT_DATA_API_BASE?.trim() || "https://api.brightdata.com",
  };
}

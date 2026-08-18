export type UrlCheckStatus = "ok" | "unsure" | "likely_wrong";

export type UrlCheck = {
  status: UrlCheckStatus;
  reason: string;
};

export type PreviewDep = {
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

type ReviewResult = {
  aiEnabled: boolean;
  aiNote?: string;
  deps: PreviewDep[];
};

const STATUSES = new Set<UrlCheckStatus>(["ok", "unsure", "likely_wrong"]);

export function openaiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function model() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

async function chatJson(system: string, user: string): Promise<unknown | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model(),
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function asCheck(value: unknown): UrlCheck | undefined {
  if (!value || typeof value !== "object") return undefined;
  const rec = value as Record<string, unknown>;
  const status = rec.status;
  const reason = rec.reason;
  if (typeof status !== "string" || !STATUSES.has(status as UrlCheckStatus)) {
    return undefined;
  }
  return {
    status: status as UrlCheckStatus,
    reason: typeof reason === "string" ? reason : "",
  };
}

export async function reviewScrapePlan(
  deps: PreviewDep[],
): Promise<ReviewResult> {
  if (!openaiEnabled() || !deps.length) {
    return { aiEnabled: false, deps };
  }

  const payload = deps.map((d) => ({
    name: d.name,
    version: d.version,
    npmUrl: d.npmUrl,
    githubReleasesUrl: d.githubReleasesUrl ?? null,
    chaosUrl: d.chaosUrl ?? null,
  }));

  const parsed = await chatJson(
    [
      "You review planned scrape URLs for npm packages.",
      "npm URLs of the form https://www.npmjs.com/package/{name} are almost always ok.",
      "GitHub releases URLs are often guessed; mark likely_wrong if the owner/repo is probably not that package, unsure if you cannot tell, ok if it is the well-known repo.",
      "chaos URLs are a demo page we host; mark ok unless the URL is clearly unrelated.",
      "Return JSON: { note: string, checks: [{ name, npm?: {status, reason}, github?: {status, reason}, chaos?: {status, reason} }] }.",
      "status must be one of ok, unsure, likely_wrong. Keep reasons to one short sentence.",
    ].join(" "),
    JSON.stringify({ packages: payload }),
  );

  if (!parsed || typeof parsed !== "object") {
    return { aiEnabled: true, deps };
  }

  const rec = parsed as Record<string, unknown>;
  const checks = Array.isArray(rec.checks) ? rec.checks : [];
  const byName = new Map<string, Record<string, unknown>>();
  for (const item of checks) {
    if (item && typeof item === "object" && "name" in item) {
      const row = item as Record<string, unknown>;
      if (typeof row.name === "string") byName.set(row.name, row);
    }
  }

  return {
    aiEnabled: true,
    aiNote: typeof rec.note === "string" ? rec.note : undefined,
    deps: deps.map((d) => {
      const row = byName.get(d.name);
      if (!row) return d;
      return {
        ...d,
        checks: {
          npm: asCheck(row.npm),
          github: d.githubReleasesUrl ? asCheck(row.github) : undefined,
          chaos: d.chaosUrl ? asCheck(row.chaos) : undefined,
        },
      };
    }),
  };
}

export async function summarizeAudit(input: {
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
}): Promise<string | null> {
  if (!openaiEnabled()) return null;
  const parsed = await chatJson(
    "Summarize maintainer-page audit findings for a developer. Return JSON { summary: string } with 2-4 sentences covering security/deprecation signals and the most important version bumps. Do not invent packages that are not in the input.",
    JSON.stringify(input),
  );
  if (!parsed || typeof parsed !== "object") return null;
  const summary = (parsed as { summary?: unknown }).summary;
  return typeof summary === "string" ? summary : null;
}

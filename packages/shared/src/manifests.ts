import { PackageJsonSchema } from "./brightdata/scrape.js";

export type DepRef = {
  name: string;
  version: string;
  npmUrl: string;
  githubReleasesUrl?: string;
};

const GITHUB_RE =
  /(?:git\+)?https?:\/\/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?/i;

export function parsePackageJson(
  raw: string,
  opts: { githubHints?: Record<string, string> } = {},
): DepRef[] {
  const parsed = PackageJsonSchema.parse(JSON.parse(raw));
  const deps = Object.assign(
    {} as Record<string, string>,
    parsed.dependencies,
    parsed.devDependencies,
    parsed.optionalDependencies,
  );
  return Object.entries(deps).map(([name, version]) => {
    const cleaned = version.replace(/^[\^~>=<\s]+/, "");
    const gh =
      opts.githubHints?.[name] ??
      guessGithub(name);
    return {
      name,
      version: cleaned,
      npmUrl: `https://www.npmjs.com/package/${encodeURIComponent(name)}`,
      githubReleasesUrl: gh
        ? `https://github.com/${gh}/releases`
        : undefined,
    };
  });
}

function guessGithub(name: string): string | undefined {
  const known: Record<string, string> = {
    lodash: "lodash/lodash",
    express: "expressjs/express",
    axios: "axios/axios",
    minimist: "minimistjs/minimist",
    semver: "npm/node-semver",
  };
  return known[name];
}

export function parseGithubFromRepoField(repo?: string | { url?: string }) {
  const url = typeof repo === "string" ? repo : repo?.url;
  if (!url) return undefined;
  const m = url.match(GITHUB_RE);
  if (!m) return undefined;
  return `${m[1]}/${m[2]}`;
}

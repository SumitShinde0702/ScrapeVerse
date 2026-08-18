import type { MaintainerSignal, Source } from "../schemas.js";
import { enrichSignal } from "../signals.js";

const MOCK: Record<string, Omit<MaintainerSignal, "signal_tags">> = {
  lodash: {
    source: "npm",
    package_name: "lodash",
    url: "https://www.npmjs.com/package/lodash",
    latest_version: "4.17.21",
    published_at: "2021-02-20T00:00:00.000Z",
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "4.17.21 — Prototype pollution fix in zipObjectDeep / set / unset related paths. Security patch recommended.",
  },
  express: {
    source: "npm",
    package_name: "express",
    url: "https://www.npmjs.com/package/express",
    latest_version: "4.21.2",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "Maintenance release. See GitHub releases for security advisories on older 4.x lines.",
  },
  axios: {
    source: "npm",
    package_name: "axios",
    url: "https://www.npmjs.com/package/axios",
    latest_version: "1.7.9",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "Security: fixed SSRF and credential leakage issues in prior minors. Upgrade from 1.6.x.",
  },
  minimist: {
    source: "npm",
    package_name: "minimist",
    url: "https://www.npmjs.com/package/minimist",
    latest_version: "1.2.8",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: "Older versions have prototype pollution advisories.",
    changelog_excerpt:
      "1.2.8 — security: prototype pollution fixes. Do not use < 1.2.6.",
  },
  semver: {
    source: "npm",
    package_name: "semver",
    url: "https://www.npmjs.com/package/semver",
    latest_version: "7.6.3",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt: "Bugfix release. Documentation and range-parsing tweaks only.",
  },
  "lodash-gh": {
    source: "github_releases",
    package_name: "lodash",
    url: "https://github.com/lodash/lodash/releases",
    latest_version: "4.17.21",
    published_at: "2021-02-20T00:00:00.000Z",
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "Release 4.17.21 — Bump to fix security issue. Prototype pollution.",
  },
  "express-gh": {
    source: "github_releases",
    package_name: "express",
    url: "https://github.com/expressjs/express/releases",
    latest_version: "4.21.2",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "4.21.2 — dependency updates. Advisories for older 4.18.x are listed on the security tab.",
  },
  "axios-gh": {
    source: "github_releases",
    package_name: "axios",
    url: "https://github.com/axios/axios/releases",
    latest_version: "1.7.9",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "1.7.9 — CVE-class SSRF / credential leak fixes versus 1.6.x. Upgrade recommended.",
  },
  "minimist-gh": {
    source: "github_releases",
    package_name: "minimist",
    url: "https://github.com/minimistjs/minimist/releases",
    latest_version: "1.2.8",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt:
      "1.2.8 — prototype pollution patches. Do not stay on 1.2.5.",
  },
  "semver-gh": {
    source: "github_releases",
    package_name: "semver",
    url: "https://github.com/npm/node-semver/releases",
    latest_version: "7.6.3",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text: null,
    changelog_excerpt: "7.6.3 — maintenance tag. Changelog is bugfixes only.",
  },
  chaos: {
    source: "chaos",
    package_name: "chaos-demo",
    url: "https://example.com/chaos",
    latest_version: "2.4.1",
    published_at: null,
    deprecated_or_yanked: false,
    notice_text:
      "Security fix in 2.4.1: patched prototype pollution in config merge.",
    changelog_excerpt:
      "## 2.4.1\n- security: fix prototype pollution in mergeConfig\n- deprecate legacy unsafeEval option",
  },
};

export function mockRowsForUrl(
  source: Source,
  url: string,
): MaintainerSignal[] {
  const lower = url.toLowerCase();
  let key = "semver";
  if (source === "chaos" || lower.includes("chaos")) key = "chaos";
  else if (lower.includes("lodash"))
    key = source === "github_releases" ? "lodash-gh" : "lodash";
  else if (lower.includes("express"))
    key = source === "github_releases" ? "express-gh" : "express";
  else if (lower.includes("axios"))
    key = source === "github_releases" ? "axios-gh" : "axios";
  else if (lower.includes("minimist"))
    key = source === "github_releases" ? "minimist-gh" : "minimist";
  else if (lower.includes("semver"))
    key = source === "github_releases" ? "semver-gh" : "semver";

  const base = { ...MOCK[key] };
  base.source = source;
  base.url = url;
  if (source === "chaos") {
    base.package_name = "chaos-demo";
  }
  return [enrichSignal(base as MaintainerSignal)];
}

/** Simulate layout break: strip required fields so Zod fails */
export function mockBrokenChaosRow(url: string): unknown[] {
  return [
    {
      source: "chaos",
      package_name: "chaos-demo",
      url,
      latest_version: "",
      published_at: null,
      deprecated_or_yanked: false,
      notice_text: null,
      changelog_excerpt: "",
    },
  ];
}

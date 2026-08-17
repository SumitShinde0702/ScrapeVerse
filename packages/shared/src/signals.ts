import type { MaintainerSignal, SignalTag, SuggestedBump } from "./schemas.js";

const SECURITY_RE =
  /\b(security|cve|vulnerab|rce|xss|ssrf|prototype pollution|advisory|patch(ed)?|CVE-\d+)/i;
const BREAKING_RE = /\b(breaking|breaking change|major|incompatible)\b/i;
const DEPRECATION_RE = /\b(deprecat|legacy|removed|will be removed)\b/i;
const YANKED_RE = /\b(yanked|unpublished|malicious)\b/i;

export function deriveSignalTags(
  signal: Pick<
    MaintainerSignal,
    "notice_text" | "changelog_excerpt" | "deprecated_or_yanked"
  >,
): SignalTag[] {
  const blob = `${signal.notice_text ?? ""}\n${signal.changelog_excerpt}`;
  const tags = new Set<SignalTag>();
  if (signal.deprecated_or_yanked || DEPRECATION_RE.test(blob)) {
    tags.add("deprecation");
  }
  if (YANKED_RE.test(blob)) tags.add("yanked");
  if (SECURITY_RE.test(blob)) tags.add("security");
  if (BREAKING_RE.test(blob)) tags.add("breaking");
  return [...tags];
}

export function enrichSignal(signal: MaintainerSignal): MaintainerSignal {
  const tags = deriveSignalTags(signal);
  return { ...signal, signal_tags: tags };
}

export function suggestBump(
  signal: MaintainerSignal,
  currentVersion: string | null,
): SuggestedBump | null {
  if (signal.signal_tags.length === 0) return null;
  if (
    currentVersion &&
    signal.latest_version &&
    currentVersion === signal.latest_version &&
    !signal.deprecated_or_yanked
  ) {
    return null;
  }
  const reasons: string[] = [];
  if (signal.signal_tags.includes("security")) {
    reasons.push("maintainer notes mention a security fix");
  }
  if (signal.signal_tags.includes("deprecation")) {
    reasons.push("package or API is deprecated");
  }
  if (signal.signal_tags.includes("breaking")) {
    reasons.push("release notes include breaking changes");
  }
  if (signal.signal_tags.includes("yanked")) {
    reasons.push("version appears yanked or unpublished");
  }
  if (
    currentVersion &&
    signal.latest_version &&
    currentVersion !== signal.latest_version
  ) {
    reasons.push(
      `you are on ${currentVersion}, latest on ${signal.source} is ${signal.latest_version}`,
    );
  }
  return {
    package_name: signal.package_name,
    current_version: currentVersion,
    suggested_version: signal.latest_version,
    reason: reasons.join("; ") || "newer maintainer release detected",
    source: signal.source,
    signal_tags: signal.signal_tags,
  };
}

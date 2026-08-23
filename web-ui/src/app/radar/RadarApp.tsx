"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HealthChip } from "@/components/HealthChip";
import { SignalMap } from "@/components/SignalMap";
import {
  fetchFindings,
  fetchFixturePackage,
  fetchHealth,
  fetchScrapePlan,
  runAudit,
  runChaosHeal,
  startWatch,
  stopWatch,
  summarizeAudit,
  type AuditResult,
  type CollectorHealth,
  type Finding,
  type HealEvent,
  type MaintainerSignal,
  type ScrapePlan,
  type ScrapePlanDep,
  type Source,
  type SuggestedBump,
  type UrlCheck,
} from "@/lib/api";

type Phase = "edit" | "preview" | "results";

const TABS: Array<Source | "all"> = ["all", "npm", "github_releases", "chaos"];

const SCAN_OPTS = {
  includeGithub: true,
  includeChaos: false,
  limit: 12,
};

export function RadarApp() {
  const params = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const autoWatch = useRef(false);
  const [phase, setPhase] = useState<Phase>("edit");
  const [tab, setTab] = useState<Source | "all">("all");
  const [health, setHealth] = useState<Record<Source, CollectorHealth>>({
    npm: "idle",
    github_releases: "idle",
    chaos: "idle",
  });
  const [healEvents, setHealEvents] = useState<HealEvent[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [signals, setSignals] = useState<MaintainerSignal[]>([]);
  const [bumps, setBumps] = useState<SuggestedBump[]>([]);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [mock, setMock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageJson, setPackageJson] = useState("");
  const [plan, setPlan] = useState<ScrapePlan | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const refreshMeta = useCallback(async () => {
    try {
      const [h, f] = await Promise.all([fetchHealth(), fetchFindings()]);
      setHealth(h.health);
      setHealEvents(h.heal_events ?? []);
      setWatching(h.watching);
      setMock(h.mock);
      setFindings(f.findings);
    } catch {
      /* API may be down during first paint */
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const pkg = await fetchFixturePackage();
        setPackageJson(pkg);
      } catch {
        setPackageJson('{\n  "dependencies": { "lodash": "4.17.20" }\n}');
      }
      await refreshMeta();
    })();
  }, [refreshMeta]);

  useEffect(() => {
    if (params.get("watch") !== "1" || autoWatch.current || !packageJson) return;
    autoWatch.current = true;
    void (async () => {
      try {
        setBusy(true);
        await startWatch({ packageJson });
        await refreshMeta();
      } finally {
        setBusy(false);
      }
    })();
  }, [params, refreshMeta, packageJson]);

  const applyAudit = (result: AuditResult) => {
    setSignals(result.signals);
    setBumps(result.bumps);
    setHealEvents((prev) => [...prev, ...result.heal_events].slice(-80));
    setHealth(result.health);
    setAuditId(result.audit_id);
    setError(result.errors.join("; ") || null);
    setPhase("results");
  };

  const onScan = async () => {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const next = await fetchScrapePlan({
        packageJson,
        ...SCAN_OPTS,
      });
      setPlan(next);
      setPhase("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await runAudit({
        packageJson,
        ...SCAN_OPTS,
      });
      applyAudit(result);
      await refreshMeta();
        try {
        const s = await summarizeAudit({
          signals: result.signals.map((sig) => ({
            package_name: sig.package_name,
            source: sig.source,
            latest_version: sig.latest_version,
            signal_tags: sig.signal_tags,
          })),
          bumps: result.bumps.map((b) => ({
            package_name: b.package_name,
            current_version: b.current_version,
            suggested_version: b.suggested_version,
            reason: b.reason,
          })),
        });
        setSummary(s.summary ?? localSummary(result.signals, result.bumps));
      } catch {
        setSummary(localSummary(result.signals, result.bumps));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onChaos = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await runChaosHeal();
      applyAudit(result);
      await refreshMeta();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setPackageJson(await file.text());
    setPhase("edit");
  };

  const grouped = useMemo(
    () => groupPackages(signals, bumps),
    [signals, bumps],
  );

  const filteredGroups = useMemo(
    () =>
      tab === "all"
        ? grouped
        : grouped.filter((g) => g.rows.some((r) => r.source === tab)),
    [grouped, tab],
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(62,255,154,0.06),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1100px] flex-col px-5 py-6 md:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="font-display text-lg font-semibold">
              Changelog Radar
            </Link>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Paste a package.json, review scrape URLs, then scan maintainer pages.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(health) as Source[]).map((s) => (
              <HealthChip key={s} source={s} status={health[s]} />
            ))}
            <p className="font-mono text-[10px] text-[var(--muted)]">
              {mock ? "MOCK" : "LIVE"}
              {watching ? " · WATCH ON" : ""}
            </p>
          </div>
        </header>

        <ol className="mt-6 flex flex-wrap gap-2 text-xs">
          {(
            [
              ["edit", "1. Manifest"],
              ["preview", "2. Review URLs"],
              ["results", "3. Results"],
            ] as const
          ).map(([id, label]) => (
            <li
              key={id}
              className={
                phase === id
                  ? "rounded-full bg-[var(--panel)] px-3 py-1 text-[var(--signal)] ring-1 ring-[var(--signal-dim)]"
                  : "rounded-full px-3 py-1 text-[var(--muted)] ring-1 ring-[var(--line)]"
              }
            >
              {label}
            </li>
          ))}
        </ol>

        {error && (
          <p className="mt-4 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        {phase === "edit" && (
          <section className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Paste your package.json
              </h1>
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => void onUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
                >
                  Upload file
                </button>
                <button
                  type="button"
                  disabled={busy || !packageJson.trim()}
                  onClick={() => void onScan()}
                  className="rounded-full bg-[var(--signal)] px-4 py-2 text-sm font-semibold text-[#04110a] disabled:opacity-50"
                >
                  {busy ? "Scanning…" : "Scan"}
                </button>
              </div>
            </div>
            <textarea
              value={packageJson}
              onChange={(e) => setPackageJson(e.target.value)}
              className="h-64 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--signal-dim)]"
            />
          </section>
        )}

        {phase === "preview" && plan && (
          <PreviewStep
            plan={plan}
            busy={busy}
            onBack={() => setPhase("edit")}
            onConfirm={() => void onConfirm()}
          />
        )}

        {phase === "results" && (
          <section className="mt-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {headline(grouped)}
                </h1>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {error
                    ? "Scrape did not return rows. Check collector IDs, or set CHANGELOG_RADAR_MOCK=1."
                    : mock
                      ? "Mock mode — canned maintainer notes so you can demo without Bright Data."
                      : "Live scrape of npm and GitHub release pages."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setPhase("edit")}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
                >
                  Scan another
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      if (watching) await stopWatch();
                      else await startWatch({ packageJson });
                      await refreshMeta();
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
                >
                  {watching ? "Stop watch" : "Start watch"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onChaos()}
                  className="rounded-full border border-[var(--heal)] px-4 py-2 text-sm text-[var(--heal)]"
                >
                  Chaos heal demo
                </button>
              </div>
            </div>

            {summary && (
              <p className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm leading-relaxed text-[var(--text)]">
                {summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {TABS.filter(
                (t) => t === "all" || signals.some((s) => s.source === t),
              ).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={
                    tab === t
                      ? "rounded-full bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--signal)] ring-1 ring-[var(--signal-dim)]"
                      : "rounded-full px-3 py-1.5 text-xs text-[var(--muted)] ring-1 ring-[var(--line)]"
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredGroups.map((g) => (
                <PackageCard key={g.name} pkg={g} />
              ))}
              {!filteredGroups.length && (
                <p className="rounded-xl border border-[var(--line)] px-3 py-8 text-center text-[var(--muted)]">
                  {error
                    ? "Nothing to show — collectors are missing, so live scrape returned no rows."
                    : "No packages in this filter."}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-[var(--muted)] underline-offset-2 hover:underline"
            >
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </button>

            {showAdvanced && (
              <div className="space-y-4">
                {auditId && (
                  <p className="font-mono text-xs text-[var(--muted)]">
                    audit_id: {auditId}
                  </p>
                )}
                <SignalMap signals={signals} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
                    <h2 className="text-sm font-semibold">Findings feed</h2>
                    <ul className="mt-3 max-h-56 space-y-2 overflow-auto text-xs">
                      {findings.map((f) => (
                        <li
                          key={f.id}
                          className="border-b border-[var(--line)] pb-2 text-[var(--muted)]"
                        >
                          <span className="text-[var(--steel)]">{f.mode}</span> ·{" "}
                          {f.signal.package_name} ·{" "}
                          {f.signal.signal_tags.join(",")}
                        </li>
                      ))}
                      {!findings.length && (
                        <li className="text-[var(--muted)]">
                          Empty — start watch or scan.
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
                    <h2 className="text-sm font-semibold">Heal timeline</h2>
                    <ol className="mt-3 max-h-64 space-y-3 overflow-auto border-l border-[var(--line)] pl-4">
                      {[...healEvents].reverse().map((e) => (
                        <li key={e.id} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--heal)]" />
                          <p className="font-mono text-[var(--heal)]">
                            {e.collector} · {e.stage}
                          </p>
                          <p className="mt-1 text-[var(--muted)]">{e.detail}</p>
                          {e.zod_issues?.length ? (
                            <p className="mt-1 text-[var(--danger)]">
                              {e.zod_issues.join(" · ")}
                            </p>
                          ) : null}
                        </li>
                      ))}
                      {!healEvents.length && (
                        <li className="text-[var(--muted)]">
                          Run Chaos heal demo to populate.
                        </li>
                      )}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

type PackageGroup = {
  name: string;
  current: string | null;
  latest: string | null;
  tags: string[];
  bump: SuggestedBump | null;
  quote: string;
  rows: MaintainerSignal[];
};

function groupPackages(
  signals: MaintainerSignal[],
  bumps: SuggestedBump[],
): PackageGroup[] {
  const map = new Map<string, PackageGroup>();
  for (const s of signals) {
    const existing = map.get(s.package_name);
    if (existing) {
      existing.rows.push(s);
      for (const t of s.signal_tags) {
        if (!existing.tags.includes(t)) existing.tags.push(t);
      }
      if (!existing.quote && (s.notice_text || s.changelog_excerpt)) {
        existing.quote = (s.notice_text || s.changelog_excerpt).trim();
      }
      if (!existing.latest) existing.latest = s.latest_version;
    } else {
      const bump = bumps.find((b) => b.package_name === s.package_name) ?? null;
      map.set(s.package_name, {
        name: s.package_name,
        current: bump?.current_version ?? null,
        latest: s.latest_version,
        tags: [...s.signal_tags],
        bump,
        quote: (s.notice_text || s.changelog_excerpt || "").trim(),
        rows: [s],
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    const score = (g: PackageGroup) =>
      (g.tags.includes("security") ? 4 : 0) +
      (g.tags.includes("yanked") ? 3 : 0) +
      (g.tags.includes("deprecation") ? 2 : 0) +
      (g.bump ? 1 : 0);
    return score(b) - score(a) || a.name.localeCompare(b.name);
  });
}

function headline(groups: PackageGroup[]) {
  const warned = groups.filter((g) => g.tags.length > 0).length;
  if (!groups.length) return "Results";
  if (warned === 0) return `${groups.length} packages look clean`;
  return `${warned} of ${groups.length} packages have maintainer warnings`;
}

function localSummary(signals: MaintainerSignal[], bumps: SuggestedBump[]) {
  const groups = groupPackages(signals, bumps);
  const security = groups.filter((g) => g.tags.includes("security"));
  const clean = groups.filter((g) => g.tags.length === 0);
  const parts: string[] = [];
  if (security.length) {
    parts.push(
      `${security.map((g) => g.name).join(", ")} mention a security fix on the maintainer page.`,
    );
  }
  if (bumps.length) {
    parts.push(
      `Suggested bumps: ${bumps
        .map((b) => `${b.package_name} ${b.current_version ?? "?"} → ${b.suggested_version}`)
        .join("; ")}.`,
    );
  }
  if (clean.length) {
    parts.push(
      `${clean.map((g) => g.name).join(", ")} have no tagged warnings.`,
    );
  }
  return parts.join(" ") || "Scan finished. No maintainer warnings tagged.";
}

function PackageCard({ pkg }: { pkg: PackageGroup }) {
  const risky = pkg.tags.includes("security") || pkg.tags.includes("yanked");
  return (
    <article
      className={`rounded-xl border bg-[var(--panel)] p-4 ${
        risky
          ? "border-[var(--danger)]/40"
          : pkg.tags.length
            ? "border-[var(--heal)]/35"
            : "border-[var(--line)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{pkg.name}</h2>
          <p className="mt-1 font-mono text-sm text-[var(--signal)]">
            {pkg.current ?? "?"} → {pkg.latest ?? "?"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pkg.tags.length ? (
            pkg.tags.map((t) => (
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ring-1 ${
                  t === "security" || t === "yanked"
                    ? "text-[var(--danger)] ring-[var(--danger)]/40"
                    : "text-[var(--heal)] ring-[var(--heal)]/40"
                }`}
              >
                {t}
              </span>
            ))
          ) : (
            <span className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)] ring-1 ring-[var(--line)]">
              clean
            </span>
          )}
        </div>
      </div>
      {pkg.quote && (
        <blockquote className="mt-3 border-l-2 border-[var(--line)] pl-3 text-sm leading-relaxed text-[var(--muted)]">
          {pkg.quote}
        </blockquote>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {pkg.rows.map((r) => (
          <a
            key={`${r.source}-${r.url}`}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--steel)] underline-offset-2 hover:underline"
          >
            {r.source === "github_releases" ? "GitHub" : r.source} ·{" "}
            {shortUrl(r.url)}
          </a>
        ))}
      </div>
    </article>
  );
}

function PreviewStep({
  plan,
  busy,
  onBack,
  onConfirm,
}: {
  plan: ScrapePlan;
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            These pages will be scraped
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            One row per dependency. Confirm the URLs look right before we scrape.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onBack}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
          >
            Back
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-full bg-[var(--signal)] px-4 py-2 text-sm font-semibold text-[#04110a] disabled:opacity-50"
          >
            {busy ? "Scraping…" : "Looks correct"}
          </button>
        </div>
      </div>

      {plan.aiNote && (
        <p className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
          {plan.aiNote}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Package</th>
              <th className="px-3 py-2">Version</th>
              <th className="px-3 py-2">npm</th>
              <th className="px-3 py-2">GitHub releases</th>
              {plan.includeChaos && <th className="px-3 py-2">Chaos</th>}
            </tr>
          </thead>
          <tbody>
            {plan.deps.map((d) => (
              <PreviewRow key={d.name} dep={d} aiEnabled={plan.aiEnabled} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PreviewRow({
  dep,
  aiEnabled,
}: {
  dep: ScrapePlanDep;
  aiEnabled: boolean;
}) {
  return (
    <tr className="border-t border-[var(--line)] align-top">
      <td className="px-3 py-3 font-medium">{dep.name}</td>
      <td className="px-3 py-3 font-mono text-xs text-[var(--muted)]">
        {dep.version}
      </td>
      <td className="px-3 py-3">
        <UrlCell url={dep.npmUrl} check={dep.checks?.npm} showCheck={aiEnabled} />
      </td>
      <td className="px-3 py-3">
        {dep.githubReleasesUrl ? (
          <UrlCell
            url={dep.githubReleasesUrl}
            check={dep.checks?.github}
            showCheck={aiEnabled}
          />
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        )}
      </td>
      {dep.chaosUrl ? (
        <td className="px-3 py-3">
          <UrlCell
            url={dep.chaosUrl}
            check={dep.checks?.chaos}
            showCheck={aiEnabled}
          />
        </td>
      ) : null}
    </tr>
  );
}

function UrlCell({
  url,
  check,
  showCheck,
}: {
  url: string;
  check?: UrlCheck;
  showCheck: boolean;
}) {
  return (
    <div className="space-y-1">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-xs text-[var(--steel)] underline-offset-2 hover:underline"
        title={url}
      >
        {shortUrl(url)}
      </a>
      {showCheck && check && <CheckPill check={check} />}
    </div>
  );
}

function CheckPill({ check }: { check: UrlCheck }) {
  const color =
    check.status === "ok"
      ? "text-[var(--signal)] ring-[var(--signal-dim)]"
      : check.status === "likely_wrong"
        ? "text-[var(--danger)] ring-[var(--danger)]/40"
        : "text-[var(--heal)] ring-[var(--heal)]/40";
  return (
    <p className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ring-1 ${color}`}>
      {check.status.replace("_", " ")}
      {check.reason ? ` · ${check.reason}` : ""}
    </p>
  );
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const path =
      u.pathname.length > 36 ? `${u.pathname.slice(0, 33)}…` : u.pathname;
    return `${u.host}${path === "/" ? "" : path}`;
  } catch {
    return url;
  }
}

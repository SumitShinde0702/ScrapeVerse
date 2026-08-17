"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HealthChip } from "@/components/HealthChip";
import { SignalMap } from "@/components/SignalMap";
import {
  fetchFindings,
  fetchFixturePackage,
  fetchHealth,
  runAudit,
  runChaosHeal,
  startWatch,
  stopWatch,
  type AuditResult,
  type CollectorHealth,
  type Finding,
  type HealEvent,
  type MaintainerSignal,
  type Source,
  type SuggestedBump,
} from "@/lib/api";

const TABS: Array<Source | "all"> = ["all", "npm", "github_releases", "chaos"];

export function RadarApp() {
  const params = useSearchParams();
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
    if (params.get("watch") === "1") {
      void (async () => {
        try {
          setBusy(true);
          await startWatch();
          await refreshMeta();
        } finally {
          setBusy(false);
        }
      })();
    }
  }, [params, refreshMeta]);

  const applyAudit = (result: AuditResult) => {
    setSignals(result.signals);
    setBumps(result.bumps);
    setHealEvents((prev) => [...prev, ...result.heal_events].slice(-80));
    setHealth(result.health);
    setAuditId(result.audit_id);
    setError(result.errors.join("; ") || null);
  };

  const onAudit = async (opts: Record<string, unknown> = {}) => {
    setBusy(true);
    setError(null);
    try {
      const result = await runAudit({
        packageJson,
        includeGithub: true,
        includeChaos: true,
        ...opts,
      });
      applyAudit(result);
      await refreshMeta();
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

  const filtered = useMemo(
    () => (tab === "all" ? signals : signals.filter((s) => s.source === tab)),
    [signals, tab],
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(62,255,154,0.06),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--line)] p-5 md:block">
          <Link href="/" className="font-display text-lg font-semibold">
            Changelog Radar
          </Link>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Ops console · Bright Data
          </p>
          <nav className="mt-8 space-y-2 text-sm">
            <p className="text-[var(--signal)]">Radar</p>
            <p className="text-[var(--muted)]">Sources</p>
            <p className="text-[var(--muted)]">Heal log</p>
          </nav>
          <div className="mt-8 space-y-2">
            {(Object.keys(health) as Source[]).map((s) => (
              <HealthChip key={s} source={s} status={health[s]} />
            ))}
          </div>
          <p className="mt-6 font-mono text-[10px] text-[var(--muted)]">
            mode: {mock ? "MOCK" : "LIVE"}
            {watching ? " · WATCH ON" : ""}
          </p>
        </aside>

        <main className="flex-1 p-5 md:p-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Radar
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Reactive audits + proactive watch on maintainer HTML
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onAudit()}
                className="rounded-full bg-[var(--signal)] px-4 py-2 text-sm font-semibold text-[#04110a] disabled:opacity-50"
              >
                {busy ? "Running…" : "Run audit"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    if (watching) await stopWatch();
                    else await startWatch();
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
                onClick={onChaos}
                className="rounded-full border border-[var(--heal)] px-4 py-2 text-sm text-[var(--heal)]"
              >
                Chaos heal demo
              </button>
            </div>
          </header>

          {error && (
            <p className="mt-4 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          {auditId && (
            <p className="mt-3 font-mono text-xs text-[var(--muted)]">
              audit_id: {auditId}
            </p>
          )}

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {TABS.map((t) => (
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

              <div className="overflow-hidden rounded-xl border border-[var(--line)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--muted)]">
                    <tr>
                      <th className="px-3 py-2">Package</th>
                      <th className="px-3 py-2">Source</th>
                      <th className="px-3 py-2">Version</th>
                      <th className="px-3 py-2">Signals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr
                        key={`${s.source}-${s.package_name}-${i}`}
                        className="border-t border-[var(--line)]"
                      >
                        <td className="px-3 py-2 font-medium">{s.package_name}</td>
                        <td className="px-3 py-2 font-mono text-xs text-[var(--muted)]">
                          {s.source}
                        </td>
                        <td className="px-3 py-2 font-mono text-[var(--signal)]">
                          {s.latest_version}
                        </td>
                        <td className="px-3 py-2 text-xs text-[var(--heal)]">
                          {s.signal_tags.join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-[var(--muted)]"
                        >
                          No rows yet. Run an audit.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <SignalMap signals={signals} />
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
                <h2 className="text-sm font-semibold">Suggested bumps</h2>
                <ul className="mt-3 space-y-3">
                  {bumps.map((b, i) => (
                    <li
                      key={`${b.package_name}-${i}`}
                      className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] p-3 text-sm"
                    >
                      <p className="font-mono text-[var(--signal)]">
                        {b.package_name}: {b.current_version ?? "?"} →{" "}
                        {b.suggested_version}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{b.reason}</p>
                    </li>
                  ))}
                  {!bumps.length && (
                    <li className="text-sm text-[var(--muted)]">No bumps yet.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
                <h2 className="text-sm font-semibold">Findings feed</h2>
                <ul className="mt-3 max-h-56 space-y-2 overflow-auto text-xs">
                  {findings.map((f) => (
                    <li
                      key={f.id}
                      className="border-b border-[var(--line)] pb-2 text-[var(--muted)]"
                    >
                      <span className="text-[var(--steel)]">{f.mode}</span> ·{" "}
                      {f.signal.package_name} · {f.signal.signal_tags.join(",")}
                    </li>
                  ))}
                  {!findings.length && (
                    <li className="text-[var(--muted)]">
                      Empty — start watch or audit.
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
          </section>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold">Manifest under audit</h2>
            <textarea
              value={packageJson}
              onChange={(e) => setPackageJson(e.target.value)}
              className="h-40 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--signal-dim)]"
            />
          </section>
        </main>
      </div>
    </div>
  );
}

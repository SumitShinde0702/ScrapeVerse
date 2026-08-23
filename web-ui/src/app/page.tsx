"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HeroMedia } from "@/components/HeroMedia";
import { SmoothScroll } from "@/components/SmoothScroll";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="text-[var(--text)]">
        <Hero />
        <Problem />
        <Solution />
        <Architecture />
        <Tech />
        <Closer />
      </div>
    </SmoothScroll>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between gap-6">
      <p className="font-display text-lg font-semibold tracking-tight md:text-xl">
        Changelog Radar
      </p>
      <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex">
        <a href="#problem" className="transition hover:text-[var(--text)]">
          Problem
        </a>
        <a href="#solution" className="transition hover:text-[var(--text)]">
          Solution
        </a>
        <a href="#architecture" className="transition hover:text-[var(--text)]">
          Architecture
        </a>
        <a href="#tech" className="transition hover:text-[var(--text)]">
          Tech
        </a>
      </nav>
      <Link
        href="/radar"
        className="text-sm text-[var(--muted)] transition hover:text-[var(--signal)]"
      >
        Open radar
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <HeroMedia />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,20,0.28)_0%,rgba(7,11,20,0.62)_52%,rgba(7,11,20,0.96)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,20,0.5)_100%)]" />

      <div className="relative z-10 flex min-h-[100svh] flex-col px-6 py-8 md:px-12">
        <Header />

        <div className="flex flex-1 flex-col justify-end pb-14 pt-24 md:max-w-3xl md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            Changelog Radar
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
          >
            package.json → live npm + GitHub scrapes → security signals before
            CVE databases catch up.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/radar"
              className="rounded-full bg-[var(--signal)] px-6 py-3 text-sm font-semibold text-[#04110a] transition hover:brightness-110"
            >
              Open Radar
            </Link>
            <Link
              href="/radar?watch=1"
              className="rounded-full border border-[var(--line)] bg-black/30 px-6 py-3 text-sm font-medium text-[var(--text)] backdrop-blur-sm transition hover:border-[var(--signal-dim)]"
            >
              Watch a repo
            </Link>
          </motion.div>
        </div>

        <a
          href="#problem"
          className="animate-cue absolute bottom-6 left-6 z-10 font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase md:left-12"
        >
          Scroll
        </a>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section
      id="problem"
      className="landing-sky relative scroll-mt-8 px-6 py-24 md:px-12 md:py-32"
    >
      <div className="landing-grain absolute inset-0" />
      <div className="relative mx-auto max-w-5xl">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-[0.28em] text-[var(--signal)] uppercase"
        >
          Problem
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
        >
          CVE feeds lag. Maintainers already wrote the warning.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          For JS/Node teams: scanners watch NVD and GHSA. The earliest public
          signal is HTML on npm and GitHub Releases — banners, “security fix”
          notes, yanked versions. Frozen CSS scrapers then go hollow when those
          pages restyle.
        </motion.p>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.article
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="border border-[var(--line)] bg-[var(--bg)]/40 p-6"
            >
              <p className="font-display text-4xl font-bold tracking-tight text-[var(--signal)] md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-3 text-sm font-medium leading-snug text-[var(--text)]">
                {stat.label}
              </p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-[var(--steel)]">
                {stat.source}
              </p>
            </motion.article>
          ))}
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item, i) => (
            <motion.li
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <p className="font-mono text-xs text-[var(--signal)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.body}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STATS = [
  {
    value: "~25d",
    label: "Median delay from a public security release to an advisory in vulnerability databases.",
    source: "Endor Labs / CSO Online",
  },
  {
    value: "~18k",
    label: "NVD CVEs stuck Awaiting Analysis at the 2024 peak — scanners that only trust NVD go blind.",
    source: "Talos Intelligence",
  },
  {
    value: "~3%",
    label: "NVD analysis rate at the worst point. A CVE id can exist with no usable metadata.",
    source: "VulnCheck",
  },
];

const PROBLEMS = [
  {
    title: "The signal is HTML.",
    body: "Registry JSON is a version number. It does not give notice_text or changelog_excerpt — the banner and release prose developers actually read.",
  },
  {
    title: "Selectors rot.",
    body: "npm restyles a sidebar; GitHub renames a class. Empty latest_version, HTTP 200. You stored ghosts.",
  },
  {
    title: "Fixing scrapers is a ticket.",
    body: "By the time someone rewrites CSS, the pre-CVE window — the reason to scrape at all — is gone.",
  },
];

function Solution() {
  return (
    <section
      id="solution"
      className="relative scroll-mt-8 px-6 py-24 md:px-12 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, #070b14 0%, #0b1220 40%, #070b14 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-[0.28em] text-[var(--signal)] uppercase"
        >
          Solution
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
        >
          Scrape maintainer pages. Zod is the tripwire. Heal the same collector.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          We do not invent CVEs or replace NVD. We read npm + GitHub HTML now,
          demand a typed row, and when the DOM moves we repair the same{" "}
          <span className="font-mono text-[var(--text)]">c_…</span> id and retry.
        </motion.p>

        <motion.ol
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mt-12 flex flex-col gap-2 border border-[var(--line)] md:flex-row md:divide-x md:divide-[var(--line)]"
        >
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex-1 px-5 py-4">
              <p className="font-mono text-[11px] text-[var(--signal)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 font-mono text-sm text-[var(--text)]">{step}</p>
            </li>
          ))}
        </motion.ol>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {step.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

const PIPELINE = [
  "package.json",
  "npm + GitHub URLs",
  "Scraper Studio",
  "Zod gate",
  "tags + bumps  |  heal → retry",
];

const STEPS = [
  {
    title: "Three collectors, one schema.",
    body: "npmjs.com/package/{name}, github.com/{owner}/{repo}/releases, plus a hosted chaos page. Each returns package_name, latest_version, notice_text, changelog_excerpt, deprecated_or_yanked — described in plain language so Self-Healing can repair extraction.",
  },
  {
    title: "HTTP 200 is not health. Zod is.",
    body: "MaintainerSignalSchema requires latest_version and changelog_excerpt. A restyle that drops a field fails validation even if the collector returned JSON.",
  },
  {
    title: "Tag the prose. Suggest the bump.",
    body: "Scan notice_text + changelog_excerpt for security, breaking, deprecation, yanked. If you are on X and the page shows Y, emit a bump. Same payload via Cursor MCP: audit_dependencies.",
  },
  {
    title: "Heal in place — same c_ id.",
    body: "On Zod miss: ≤1000-char prompt from issue paths → refactor_template → auto-approve → re-trigger /dca/trigger. The collector is mutated, not replaced.",
  },
];

function Architecture() {
  return (
    <section
      id="architecture"
      className="landing-sky relative scroll-mt-8 px-6 py-24 md:px-12 md:py-32"
    >
      <div className="landing-grain absolute inset-0" />
      <div className="relative mx-auto max-w-5xl">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-[0.28em] text-[var(--signal)] uppercase"
        >
          Architecture
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
        >
          Four layers. One scrape loop.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          npm workspaces. The UI never talks to Bright Data directly. Shared
          owns schemas, tagging, and the collector client.
        </motion.p>

        <ol className="mt-14 space-y-3">
          {LAYERS.map((layer, i) => (
            <motion.li
              key={layer.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="grid gap-2 border border-[var(--line)] bg-[var(--bg)]/50 px-5 py-5 md:grid-cols-[11rem_1fr_auto] md:items-baseline md:gap-8"
            >
              <p className="font-mono text-sm text-[var(--signal)]">
                {layer.name}
              </p>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {layer.role}
              </p>
              <p className="font-mono text-[11px] text-[var(--steel)] md:text-right">
                {layer.path}
              </p>
            </motion.li>
          ))}
        </ol>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center font-mono text-xs text-[var(--muted)]"
        >
          POST /dca/trigger → GET /dca/dataset → Zod → (ok: tags) or (fail:
          refactor_template on same c_id)
        </motion.p>
      </div>
    </section>
  );
}

const LAYERS = [
  {
    name: "web-ui",
    path: "Next.js :3000",
    role: "Landing + Radar. Paste package.json, preview URLs, results cards, watch mode, chaos heal demo.",
  },
  {
    name: "mcp-server",
    path: "Express :8787",
    role: "HTTP /api/* plus Cursor MCP stdio: audit_dependencies, get_latest_findings, get_scraper_health, run_chaos_heal_demo.",
  },
  {
    name: "packages/shared",
    path: "Zod + orchestrator",
    role: "MaintainerSignalSchema, signal tags, bump suggestions, Bright Data client, heal prompt builder.",
  },
  {
    name: "Scraper Studio",
    path: "3 collectors",
    role: "npm · github_releases · chaos. Data Collector API + Self-Healing. Product path is DCA — not a generic proxy.",
  },
];

function Tech() {
  return (
    <section
      id="tech"
      className="relative scroll-mt-8 px-6 py-24 md:px-12 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, #070b14 0%, #0b1220 50%, #070b14 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-[0.28em] text-[var(--signal)] uppercase"
        >
          Tech
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
        >
          Bright Data for collection. TypeScript for the rest.
        </motion.h2>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          {TECH_GROUPS.map((group, i) => (
            <motion.div
              key={group.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">
                {group.title}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border border-[var(--line)] px-3 py-1.5 font-mono text-xs text-[var(--text)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TECH_GROUPS = [
  {
    title: "Scraping",
    items: [
      "Bright Data Scraper Studio",
      "Data Collector API",
      "Self-Healing / refactor_template",
      "npm · GitHub Releases · chaos",
    ],
  },
  {
    title: "App",
    items: [
      "Next.js 15",
      "React 19",
      "Tailwind CSS 4",
      "Framer Motion",
      "React Flow",
      "Lenis",
    ],
  },
  {
    title: "API & agents",
    items: ["Express", "MCP stdio", "TypeScript", "npm workspaces"],
  },
  {
    title: "Validation & extras",
    items: [
      "Zod",
      "OpenAI (optional URL review)",
      "Zerops deploy",
      "CHANGELOG_RADAR_MOCK",
    ],
  },
];

function Closer() {
  return (
    <section className="relative px-6 pb-28 pt-8 md:px-12 md:pb-36">
      <div className="mx-auto max-w-5xl border-t border-[var(--line)] pt-16">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl font-display text-3xl font-bold tracking-tight md:text-5xl"
        >
          Read the page. Heal the scraper. Stay ahead of the CVE.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-8"
        >
          <Link
            href="/radar"
            className="inline-flex rounded-full bg-[var(--signal)] px-6 py-3 text-sm font-semibold text-[#04110a] transition hover:brightness-110"
          >
            Open Radar
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

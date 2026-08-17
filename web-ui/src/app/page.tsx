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
        <Technical />
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
        <a href="#technical" className="transition hover:text-[var(--text)]">
          Technical
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
            Read maintainer pages before CVE databases catch up.
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
      className="landing-sky relative scroll-mt-8 px-6 py-28 md:px-12 md:py-36"
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
          CVE feeds are late. The warning is already on the page — and scrapers cannot keep it.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          Maintainers yank versions, stamp deprecation banners on npm, and write
          “security fix” into GitHub Release bodies days before NVD or GHSA mint
          a CVE. That HTML is the earliest public signal. It is also a broken
          data source.
        </motion.p>

        <ol className="mt-16 space-y-12 border-l border-[var(--line)] pl-8 md:pl-12">
          {PROBLEMS.map((item, i) => (
            <motion.li
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <p className="font-mono text-xs text-[var(--signal)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)] md:text-base">
                {item.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    title: "The signal is HTML, not an API contract.",
    body: "npm registry JSON gives a version number. It does not give notice_text — the deprecation or security banner a human wrote on the package page — or changelog_excerpt as rendered on that page. GitHub Releases HTML is what developers actually read; page-level banners and release-body copy are not a stable, scrape-proof schema.",
  },
  {
    title: "Selectors rot. The feed goes hollow.",
    body: "npm restyles a sidebar. GitHub renames a class on the release body. A CSS-selector scraper returns empty latest_version or changelog_excerpt. HTTP 200 still looks healthy. You think you are watching lodash. You are storing ghosts.",
  },
  {
    title: "Layout drift is treated as a ticket, not a runtime event.",
    body: "Typical scrapers fail closed or wait for a human to rewrite CSS. By the time selectors are patched, the pre-CVE window — the whole reason to read maintainer pages — is gone.",
  },
];

function Solution() {
  return (
    <section
      id="solution"
      className="relative scroll-mt-8 px-6 py-28 md:px-12 md:py-36"
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
          Scrape the pages maintainers write. Zod is the tripwire. Bright Data heals the collector in place.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          Changelog Radar does not wait for a CVE id. It fans your package.json
          out to live npm and GitHub Releases HTML, demands a typed row, and
          when the DOM moves it calls Bright Data Self-Healing on the same
          collector id — then retries.
        </motion.p>

        <ol className="mt-16 space-y-10">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="grid gap-3 md:grid-cols-[5.5rem_1fr] md:gap-8"
            >
              <p className="font-display text-3xl font-bold text-[var(--signal)] md:text-4xl">
                {step.n}
              </p>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)] md:text-base">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Manifest in. URLs out.",
    body: "Parse package.json. Each dependency becomes https://www.npmjs.com/package/{name} and, when resolvable, https://github.com/{owner}/{repo}/releases. A third target is a chaos page we host so we can break the DOM on purpose.",
  },
  {
    n: "02",
    title: "Three Scraper Studio collectors pull the HTML.",
    body: "Bright Data collectors — npm, github_releases, chaos — receive [{ url }]. They extract package_name, latest_version, notice_text, changelog_excerpt, deprecated_or_yanked using plain-language field descriptions, not a frozen CSS path.",
  },
  {
    n: "03",
    title: "HTTP 200 is not health. Zod is.",
    body: "Every row is parsed with MaintainerSignalSchema. latest_version and changelog_excerpt must be non-empty; notice_text may be null; deprecated_or_yanked is a boolean. A layout change that drops a field fails validation even if the collector returned JSON.",
  },
  {
    n: "04",
    title: "Tag the prose. Suggest the bump.",
    body: "notice_text + changelog_excerpt are scanned for security, breaking, deprecation, yanked. If you are behind a tagged release, Radar emits a suggested bump. The same payload is a Cursor MCP tool: audit_dependencies.",
  },
  {
    n: "05",
    title: "On Zod miss: heal the same c_ id, then scrape again.",
    body: "We POST a ≤1000-character prompt built from the Zod issue paths into Bright Data’s refactor_template, poll progress, auto-approve the template diff (resume_automation_job { message: true }), re-trigger /dca/trigger, and re-validate. The collector is mutated in place — not replaced.",
  },
];

function Technical() {
  return (
    <section
      id="technical"
      className="landing-sky relative scroll-mt-8 px-6 py-28 md:px-12 md:py-36"
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
          Technical
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
        >
          Bright Data Scraper Studio: Data Collector API plus AI Flow Self-Healing.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          Base URL{" "}
          <span className="font-mono text-[var(--text)]">
            https://api.brightdata.com
          </span>
          . Auth is{" "}
          <span className="font-mono text-[var(--text)]">
            Authorization: Bearer
          </span>{" "}
          with the Bright Data API token. This product path is Scraper Studio
          (DCA) — collection and in-place template repair — not a generic proxy.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-16 border-t border-[var(--line)] pt-10"
        >
          <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">
            Collectors
          </p>
          <ul className="mt-6 divide-y divide-[var(--line)]">
            {COLLECTORS.map((c) => (
              <li
                key={c.env}
                className="grid gap-1 py-5 md:grid-cols-[11rem_1fr_auto] md:items-baseline md:gap-8"
              >
                <p className="font-mono text-sm text-[var(--signal)]">{c.id}</p>
                <p className="text-[15px] leading-relaxed text-[var(--muted)]">
                  {c.desc}
                </p>
                <p className="font-mono text-[11px] text-[var(--steel)] md:text-right">
                  {c.env}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="mt-16 grid gap-16 lg:grid-cols-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
          >
            <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">
              Collection
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Trigger, then poll the dataset.
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
              queue_next=1 queues the job if the crawler is busy. We poll every
              5s for up to 180s until the body is a non-empty JSON array.
            </p>
            <ol className="mt-8 space-y-6 border-l border-[var(--line)] pl-6">
              {COLLECTION.map((row) => (
                <li key={row.path}>
                  <p className="font-mono text-xs text-[var(--signal)]">
                    {row.method}
                  </p>
                  <p className="mt-1 break-all font-mono text-[13px] text-[var(--text)]">
                    {row.path}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {row.note}
                  </p>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">
              Self-healing · AI Flow workflow 2
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Refactor the template. Same collector id.
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
              Zod failures become the heal prompt: missing fields plus
              plain-language re-extract for package_name, latest_version
              (header/tag), notice_text (security/deprecation banner),
              changelog_excerpt (release notes body). Max 1000 characters. The
              job pauses at pending_answer with a before/after template diff; we
              auto-approve it.
            </p>
            <ol className="mt-8 space-y-6 border-l border-[var(--heal)]/40 pl-6">
              {HEAL.map((row) => (
                <li key={row.path}>
                  <p className="font-mono text-xs text-[var(--heal)]">
                    {row.method}
                  </p>
                  <p className="mt-1 break-all font-mono text-[13px] text-[var(--text)]">
                    {row.path}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {row.note}
                  </p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="mt-20"
        >
          <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">
            Heal stages we log
          </p>
          <ol className="mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-8 md:gap-y-4">
            {STAGES.map((stage, i) => (
              <li key={stage} className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-[var(--heal)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-sm text-[var(--text)]">
                  {stage}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Bright Data rewrites selectors against the live DOM. We decide{" "}
            <em className="text-[var(--text)] not-italic">when</em> to heal:
            schema miss, not HTTP status. Proof B renames{" "}
            <span className="font-mono text-[var(--text)]">.version-number</span>{" "}
            and{" "}
            <span className="font-mono text-[var(--text)]">
              .security-notice
            </span>{" "}
            on the chaos page, then runs this loop until Zod goes green.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const COLLECTORS = [
  {
    id: "npm",
    env: "BRIGHT_DATA_COLLECTOR_NPM",
    desc: "npmjs.com/package/{name} — package header, version, deprecation/security banner, changelog excerpt.",
  },
  {
    id: "github_releases",
    env: "BRIGHT_DATA_COLLECTOR_GITHUB",
    desc: "github.com/{owner}/{repo}/releases — newest tag as latest_version, release body as changelog_excerpt, advisory banner as notice_text.",
  },
  {
    id: "chaos",
    env: "BRIGHT_DATA_COLLECTOR_CHAOS",
    desc: "Hosted chaos HTML. Baseline selectors: .package-name, .version-number, .security-notice, .changelog. We break them to prove heal.",
  },
];

const COLLECTION = [
  {
    method: "POST",
    path: "/dca/trigger?collector={c_id}&queue_next=1",
    note: "Body: [{ url }]. Response collection_id (or snapshot_id).",
  },
  {
    method: "GET",
    path: "/dca/dataset?id={collection_id}",
    note: "Poll until a JSON array of rows. Empty array is treated as still building.",
  },
];

const HEAL = [
  {
    method: "POST",
    path: "/dca/collectors/{c_id}/refactor_template",
    note: 'Body: { prompt } — Zod issues + plain-language field map. Mutates this collector, does not mint a new c_ id.',
  },
  {
    method: "GET",
    path: "/dca/collectors/{c_id}/refactor_template/progress",
    note: "Poll until pending_answer | done | completed | ready | failed | error.",
  },
  {
    method: "POST",
    path: "/dca/collectors/{c_id}/resume_automation_job",
    note: "Body: { message: true } to commit the template diff, false to reject.",
  },
];

const STAGES = [
  "validation_failed",
  "heal_started",
  "heal_pending_answer",
  "heal_approved",
  "retry_started",
  "retry_succeeded",
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
          The radar is this loop, visualized.
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

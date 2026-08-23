# Changelog Radar — slide deck + speaker script

Copy **everything below the line** into Claude. Ask it to generate slides (Gamma / Google Slides / pptx / HTML). Keep this file as the source of truth.

---

# CLAUDE PROMPT — START COPYING HERE

You are a presentation designer and speech coach. Turn the brief below into:

1. **A 16-slide deck** (plus optional backup slides). Dark, technical, hackathon-quality. Not a startup pitch with fake metrics.
2. **Speaker notes under every slide** (already written — polish wording, do not invent features).
3. **A timed spoken script** (~9–11 minutes). Conversational. Explain *why*, not just *what*.

## Output format

Produce:

- Slide title
- On-slide bullets (max 5, short)
- Visual direction (layout, diagram, screenshot placeholder)
- Speaker notes (the script for that slide)

Design: deep navy/black (`#070b14`), signal green (`#3DFF9A`), muted gray body text, mono labels. Think radar / maintainer-pages / live scrape — not generic SaaS purple.

Do **not** claim we invent CVEs, replace NVD/GHSA, or scrape with frozen CSS as source of truth. We do **not** swap collector IDs on heal — we mutate the same `c_…` id and retry.

Hackathon: **Into the Scrape-Verse** (WeMakeDevs × Bright Data Scraper Studio).
Product: **Changelog Radar**.
Tagline: **Read what maintainers already wrote — before CVE databases catch up.**

---

# THE BRIEF

## One sentence

Changelog Radar turns a `package.json` into live Bright Data scrapes of npm pages and GitHub Releases, tags security / deprecation / breaking / yanked signals from that HTML, suggests version bumps, and when a site layout breaks the scraper, Bright Data Self-Healing repairs the **same** collector and retries.

## The problem (use these facts, do not inflate)

| Fact | Why it matters |
|------|----------------|
| ~25 days median delay from a public security release to an advisory in public vulnerability databases (Endor Labs / CSO Online) | Scanners stay quiet while the fix is already on GitHub Releases. |
| NVD backlog 2024: thousands of CVEs “Awaiting Analysis” for months (peaks ~18k unenriched; analysis rates near 3% at worst — Talos, VulnCheck) | Tools that only trust NVD metadata go blind even after a CVE id exists. |
| Exploit PoCs can appear minutes after disclosure | Waiting for a polished CVE entry is not a strategy. |

Maintainers speak first, on HTML:

- deprecation / security banners on npmjs.com
- “security fix” in GitHub Release bodies
- yanked / unpublished versions

Registry JSON gives a version number. It does **not** reliably give the human-written notice a developer actually reads.

Why scraping that HTML usually fails quietly:

1. Selectors rot (npm restyles a sidebar; GitHub renames a class) → empty `latest_version` / `changelog_excerpt`.
2. HTTP 200 looks healthy — the job “succeeded,” you stored ghosts.
3. Fixing scrapers is a ticket — by the time someone rewrites CSS, the pre-CVE window is gone.

## The solution pipeline

```
package.json
    │
    ▼
Parse deps → npm URL + GitHub Releases URL (optional chaos demo URL)
    │
    ▼
Bright Data Scraper Studio collectors pull the HTML
    │
    ▼
Zod schema: latest_version + changelog_excerpt required
    │
    ├─ OK  → tag security / deprecation / breaking / yanked
    │         → suggest bumps if you are behind
    │
    └─ FAIL → Bright Data Self-Healing (same collector id)
              → re-scrape → re-validate
```

## What you get / what you don't

**Get:** signals, suggested bumps (`you are on X → latest on page is Y`), heal timeline, watch mode, Cursor MCP (`audit_dependencies`).

**Don't:** invent CVEs; replace NVD/GHSA; treat frozen CSS as truth; replace the collector on heal.

## Bright Data usage (hackathon-critical)

This is a **Scraper Studio (Data Collector API)** product — not a generic proxy demo.

Three collectors:

| Collector | Env | Target |
|-----------|-----|--------|
| npm | `BRIGHT_DATA_COLLECTOR_NPM` | `https://www.npmjs.com/package/{name}` |
| GitHub Releases | `BRIGHT_DATA_COLLECTOR_GITHUB` | `https://github.com/{owner}/{repo}/releases` |
| Chaos (demo) | `BRIGHT_DATA_COLLECTOR_CHAOS` | Hosted chaos page (`CHAOS_PAGE_URL`) |

Each run sends `[{ "url": "…" }]`. Extracted fields (plain language so Self-Healing can repair):

- `package_name`, `url`, `latest_version`, `published_at`
- `deprecated_or_yanked` (boolean)
- `notice_text` (banner; may be null)
- `changelog_excerpt` (required)

Collection loop:

1. `POST /dca/trigger?collector=c_…&queue_next=1`
2. Poll `GET /dca/dataset?id=…`
3. Parse every row with Zod (`MaintainerSignalSchema`)
4. On miss → heal → trigger again → validate again

Self-heal loop (same `c_…`):

1. Build ≤1000-char heal prompt from Zod issue paths
2. `POST …/refactor_template`
3. Poll until template diff
4. Auto-approve (`resume_automation_job`)
5. Re-trigger scrape on the **same** collector
6. Re-validate

## Architecture

```
web-ui (Next.js 15, React 19, Tailwind 4, Framer Motion, React Flow)
   │  HTTP /api/*
   ▼
mcp-server (Express on :8787 + MCP stdio)
   │
   ▼
packages/shared (Zod, orchestrator, Bright Data client, signal tagging)
   │
   ▼
Scraper Studio: npm | github_releases | chaos
```

Monorepo npm workspaces. Deploy: Zerops (api + web). Optional OpenAI for URL-plan review and a short results summary — scraping stays Bright Data + rules either way. Mock mode (`CHANGELOG_RADAR_MOCK=1`) for demos without a key.

MCP tools: `audit_dependencies`, `get_latest_findings`, `get_scraper_health`, `run_chaos_heal_demo`.

## User flow (UI)

1. Paste / upload `package.json`
2. Scan → preview exact URLs (optional OpenAI check that GitHub guesses look right)
3. Looks correct → Bright Data scrapes
4. Results → cards with quotes, tags, suggested bumps + React Flow map
5. Optional: Start watch, or Chaos heal demo

## Demo (~90s live, or narrate from screenshots)

1. Landing — moon-walk video, brand Changelog Radar, CTA Open Radar
2. Radar — Scan → confirm URLs → results (quotes + bumps + map)
3. Chaos heal — chip Healing (orange pulse) → Healthy; timeline Zod fail → heal → retry
4. Cursor — “Audit my package.json for maintainer warnings before CVE databases catch up.” Tool `audit_dependencies` returns the same structured result.

Fixture deps for demo: lodash 4.17.20, express 4.18.2, axios 1.6.0, minimist 1.2.5, semver 7.5.4.

## Learning & growth (honest, technical — not fluffy)

- Treating scraper failure as a **runtime event**, not a backlog ticket
- Zod as a **tripwire**, not just TypeScript-at-runtime
- Bright Data Self-Healing: mutate in place, don’t spin a new collector
- Dual surface: same orchestrator behind a guided UI and an MCP agent
- Pre-CVE is a **time-window problem**, not a “more CVEs” problem
- Next: more ecosystems, persistence beyond in-memory store, tighter GitHub repo resolution, heal-quality evals

---

# SLIDE-BY-SLIDE (build these)

---

## SLIDE 01 — Title

**On slide**

- Changelog Radar
- Read what maintainers already wrote — before CVE databases catch up.
- Into the Scrape-Verse · Bright Data Scraper Studio
- [Your name]

**Visual:** Full-bleed dark. Tiny green radar sweep or a faint npm/GitHub page ghosted in the background. No bullet dump.

**Speaker (~25s)**

Hi — I’m [name]. This is Changelog Radar.

The idea is simple: the earliest public warning about a bad npm package is usually not a CVE. It’s a sentence a maintainer already wrote on a web page. We scrape that page, while it’s still true, and we keep the scraper alive when the page layout moves.

---

## SLIDE 02 — The hook

**On slide**

- Security tools watch CVE feeds.
- Maintainers write the warning first — on HTML.
- Those pages change. Scrapers go hollow.
- We close both gaps.

**Visual:** Two clocks. Left: “GitHub Release: security fix shipped.” Right: “NVD advisory published.” Arrow labeled **~25 days**.

**Speaker (~45s)**

If you run Dependabot, Snyk, or `npm audit`, you are mostly waiting on vulnerability databases. Those databases matter. They are also late.

Endor Labs found a median of about twenty-five days between a public security release and the advisory showing up in public vuln databases. In 2024 the NVD itself had a backlog measured in the thousands of CVEs sitting at “Awaiting Analysis.”

So there is a window where the fix is public, the exploit may already exist, and your scanner is still quiet.

Someone already wrote the warning. It’s on npm as a deprecation banner. It’s in a GitHub Release body that says “security fix.” That’s HTML. That’s what we read.

---

## SLIDE 03 — About the project: what it is

**On slide**

- Input: a `package.json`
- Action: live scrapes of npm + GitHub Releases
- Output: signal tags + suggested bumps
- Survival: Bright Data Self-Healing on the same collector

**Visual:** Horizontal pipeline: `package.json` → URLs → collectors → Zod → tags / bumps.

**Speaker (~40s)**

Changelog Radar is a radar for maintainer pages.

You paste a package.json. We turn each dependency into the npm package URL, and when we can, the GitHub Releases URL. Bright Data Scraper Studio collectors fetch those pages. We don’t trust a 200 OK. We demand a typed row: a latest version and a changelog excerpt, validated with Zod.

If the row is good, we tag it — security, deprecation, breaking, yanked — and if you’re behind, we suggest a bump with a reason you can read.

If the row is bad, we don’t open a ticket. We ask Bright Data to heal that collector in place and we scrape again.

---

## SLIDE 04 — Why this is a scraping problem (not an API problem)

**On slide**

- Registry JSON ≠ the notice a human wrote
- `notice_text` and `changelog_excerpt` live in the DOM
- HTTP 200 + empty fields = silent failure
- Layout drift used to be a ticket. We treat it as a runtime event.

**Visual:** Split. Left: npm registry JSON `{ "version": "4.17.21" }`. Right: npm page banner “This package is deprecated / security.” Caption: **the warning is not in the JSON.**

**Speaker (~50s)**

You might ask: why scrape? Doesn’t npm have an API?

Yes. The registry will give you a version number. It will not reliably give you the banner a maintainer stamped on the package page, or the release-notes prose GitHub actually renders. That’s the earliest signal, and it lives in HTML.

The usual scraper story is brittle CSS selectors. npm restyles a sidebar. GitHub renames a class. Your job still returns 200. `latest_version` is empty. You think you’re watching lodash. You’re storing ghosts.

And the fix is usually a human rewriting selectors overnight — which is exactly when the pre-CVE window is closing.

So the product is two things at once: read the page now, and refuse to die when the DOM moves.

---

## SLIDE 05 — What “good” looks like

**On slide (table)**

| Output | Meaning |
| Signals | `security` · `deprecation` · `breaking` · `yanked` |
| Suggested bumps | you are on X → latest on the page is Y |
| Heal timeline | proof the scraper survived a layout break |
| Watch | rescan on an interval |
| Cursor MCP | same audit from the agent |

Footer: We do **not** invent CVEs. We surface maintainer prose earlier.

**Visual:** A fake result card: package `minimist`, tag **security**, quote from changelog, bump `1.2.5 → …`.

**Speaker (~35s)**

A good run does not dump a wall of JSON. You get quotes from the page, tags that a developer can act on, and a bump suggestion with a reason — “maintainer notes mention a security fix; you are on 1.2.5.”

If we healed, you also get a timeline: validation failed, heal started, approved, retry succeeded. That’s the hackathon proof — not a screenshot of a proxy.

And the same structured result is available inside Cursor through MCP, so an agent can ask for this without opening the UI.

---

## SLIDE 06 — Tech stack (map)

**On slide**

- **web-ui** — Next.js 15, React 19, Tailwind 4, Framer Motion, React Flow
- **mcp-server** — Express API + MCP stdio (`@modelcontextprotocol/sdk`)
- **packages/shared** — Zod schemas, orchestrator, Bright Data client, signal rules
- **Bright Data** — Scraper Studio collectors + Self-Healing (`refactor_template`)
- **Optional** — OpenAI for URL review / summary only
- **Deploy** — Zerops (api :8787 + web :3000)

**Visual:** Layered boxes. UI on top, API in the middle, shared core, collectors at the bottom. Label mock vs live.

**Speaker (~50s)**

This is a TypeScript monorepo.

The UI is Next.js. It’s the guided path: paste a manifest, preview URLs, see cards and a React Flow map of signals.

The API is Express. It also speaks MCP over stdio, so Cursor gets the same tools the UI uses.

Everything important — schemas, the Bright Data client, the scrape-and-heal loop, the tagging — lives in `packages/shared`. That’s deliberate. The UI and the agent cannot drift.

Scraping is Bright Data Scraper Studio, not a random fetch behind a proxy. Optional OpenAI only reviews whether our GitHub URL guesses look right, and writes a short summary. It does not scrape. It does not decide tags. Tags are regexes over maintainer prose, on purpose — deterministic, explainable.

You can run the whole product in mock mode with fixtures if you don’t have a key. Live mode is the real collectors.

---

## SLIDE 07 — Architecture (system)

**On slide**

```
package.json
   → parse deps
   → npm URL + GitHub Releases URL
        → Bright Data collectors
             → Zod gate
                  → enrich tags → suggest bumps → store findings
                  → OR heal same c_… → retry
   → UI cards / watch feed / MCP tools
```

**Visual:** Clean flowchart. Three collector nodes: `npm`, `github_releases`, `chaos`. Health states on the side: idle / scraping / healing / healthy / failed.

**Speaker (~40s)**

Walk top to bottom.

We parse dependencies, cap the set so a demo doesn’t scrape the universe, and fan out URLs.

The orchestrator scrapes npm first, then GitHub Releases, optionally a chaos page we host so we can break the DOM on purpose.

Every row goes through one schema. Pass: enrich and store. Fail: heal that collector, same id, then retry.

Health is first-class in the UI — you can see a chip go from scraping to healing to healthy. That’s not decoration. That’s the product claiming the scraper is still alive.

---

## SLIDE 08 — The Zod tripwire (the interesting bit)

**On slide**

Required:

- `latest_version` (non-empty)
- `changelog_excerpt` (non-empty)
- `package_name`, `url`

Then we derive tags from prose:

- security / CVE / advisory / patch
- deprecation / yanked
- breaking change

Empty excerpt = **invalid**, even if HTTP succeeded.

**Visual:** A Zod-shaped object. One field glowing red: `changelog_excerpt: ""` → `validation_failed`.

**Speaker (~45s)**

This is the design choice I care about most.

Most scrapers treat “the request worked” as success. We treat “the row matches the contract a developer needs” as success.

If `changelog_excerpt` is missing, Zod fails. That failure is the tripwire. We turn the issue paths into a plain-language heal prompt under a thousand characters — Bright Data’s limit — and we send it to Self-Healing.

We describe fields in English on purpose: “latest version from the header or tag,” “notice text from the security or deprecation banner.” Frozen CSS classes are exactly what rot. Plain language is what the healer can re-bind to a new DOM.

---

## SLIDE 09 — Self-healing in place

**On slide**

1. Zod miss → heal prompt from issue paths
2. `POST …/refactor_template`
3. Poll until a template diff
4. Auto-approve
5. Re-trigger **the same** `c_…`
6. Re-validate

Caption: We mutate the collector. We do not mint a new one.

**Visual:** Timeline: `validation_failed` → `heal_started` → `heal_pending_answer` → `heal_approved` → `retry_started` → `retry_succeeded`.

**Speaker (~50s)**

When the tripwire fires, we don’t swap in a backup scraper and hope.

We call Bright Data’s refactor endpoint on that collector. We poll until it proposes a template change. We auto-approve. Then we trigger collection again on the same `c_…` id and run Zod again.

Same collector id is the point. If you create a new scraper every time the DOM moves, you haven’t solved maintenance — you’ve hidden it. Judges for this hackathon specifically care that Self-Healing is used as a runtime loop, not a slide bullet.

The chaos page exists so we can prove this without waiting for npm to redesign. We rename `.version-number` to `#ver` and `.security-notice` to `.alert-box`. The first scrape fails schema. Heal runs. Retry returns a valid row. The chip goes orange, then green.

---

## SLIDE 10 — Two surfaces, one core

**On slide**

| Surface | How you use it |
| Radar UI | Paste → preview URLs → scan → cards + map |
| Watch | Interval rescans, findings feed |
| Cursor MCP | `audit_dependencies` · `get_latest_findings` · `get_scraper_health` · `run_chaos_heal_demo` |

Prompt: *Audit my package.json for maintainer warnings before CVE databases catch up.*

**Visual:** Cursor chat on the right, Radar UI on the left, shared `Orchestrator` in the middle.

**Speaker (~35s)**

The UI is how you demo it to a human. MCP is how it shows up in an agent workflow.

Both call the same orchestrator. If I audit from Cursor, I get an `audit_id`, the same signals, the same bumps, the same heal events. Watch mode is the proactive version — don’t wait for me to paste again; rescan the manifest on an interval and fill a findings feed.

That’s the product shape: reactive audit, proactive watch, self-heal when the page moves, and an agent entry point.

---

## SLIDE 11 — Demo map (before you click)

**On slide**

90 seconds, four beats:

1. Landing
2. Scan a fixture `package.json`
3. Chaos heal
4. Same result from Cursor

**Visual:** Four numbered frames. Tell the audience: “I’ll talk over the live app. If the network hiccups, these screenshots are the same path.”

**Speaker (~15s)**

I’ll run the product. Four beats: the landing, a real audit, a forced heal, then the agent. Watch the health chip and the quotes on the cards — that’s the whole story.

---

## SLIDE 12 — Demo beat A: audit

**On slide (screenshot placeholders)**

- [SHOT: Radar editor with fixture package.json]
- [SHOT: URL preview — npm + GitHub rows]
- [SHOT: Result cards with tags + bump]

Callouts: quotes from the page, not generated CVEs.

**Speaker (live, ~60–90s)**

Open Radar.

This is a sample app: lodash, express, axios, minimist, semver — versions that are behind on purpose.

Scan. Before we spend Bright Data credits, we show the exact URLs. You can reject a bad GitHub guess here. That’s the human in the loop.

Looks correct — now the collectors run. npm pages, GitHub Releases.

Here: tags on the cards. Here’s a suggested bump — you are on this version, the page says that version, and the reason is a sentence from the maintainer, not a CVE id we invented.

The map is the same data, spatial — so you can see which packages lit up.

---

## SLIDE 13 — Demo beat B: chaos heal + MCP

**On slide**

- [SHOT: Health chip Healing → Healthy]
- [SHOT: Heal timeline]
- [SHOT: Cursor tool call `audit_dependencies`]

**Speaker (live, ~45s)**

Chaos heal demo.

We point a collector at a page we control, then we break the selectors. Zod fails. Chip goes healing. Bright Data rewrites the template on the same collector. Retry. Healthy.

That’s Proof B. The scraper did not die when the DOM moved.

Last: in Cursor — “Audit my package.json for maintainer warnings before CVE databases catch up.” Same structured JSON. Same `audit_id`. The agent and the UI are not two products.

---

## SLIDE 14 — Learning

**On slide**

- Failure as a runtime signal, not a Jira ticket
- Schema-first scraping: Zod is the product, not a nicety
- Heal in place > spawn a new collector
- One orchestrator, two clients (UI + MCP)
- The valuable window is *before* the CVE, not instead of it

**Visual:** Five short cards. No stock “teamwork” icons.

**Speaker (~50s)**

What I actually learned building this:

First, most scrapers fail politely. That’s worse than failing loudly. A typed contract at the boundary is how you notice the page moved.

Second, self-healing only counts if you keep the same collector. Otherwise you’ve built a factory for abandoned scrapers.

Third, putting MCP on the same core as the UI forces you to design data, not pages. If an agent can’t consume it, the UI was probably lying.

Fourth, this is not “AI finds vulnerabilities.” We are deliberately not that. We are early readers of text maintainers already published. The growth path is more ecosystems and better proof that heal quality stays high — not a bigger LLM in the loop.

---

## SLIDE 15 — What’s next

**On slide**

- PyPI / crates / Maven maintainer pages
- Durable findings store (not in-memory)
- Better GitHub repo resolution from npm metadata
- Heal evals: break fixtures on a schedule, measure recovery
- Watch as a real always-on service

**Speaker (~25s)**

If we kept going: more package ecosystems, persistence so watch survives a restart, smarter mapping from npm to the right GitHub repo, and a scheduled chaos suite so we know healing still works after Bright Data or the target sites change.

The north star stays the same: maintainer prose, now, with a scraper that doesn’t go hollow.

---

## SLIDE 16 — Close

**On slide**

Changelog Radar

Read the page. Trust the schema. Heal in place.

- Not a CVE database
- Not a frozen-CSS scraper
- A Scraper Studio product that survives layout drift

**Visual:** Tagline + GitHub / live URL / `npm run prove:live` · `npm run prove:heal`

**Speaker (~20s)**

CVE feeds will catch up. Until they do, the warning is already on the page.

We scrape that page. Zod tells us if we actually got it. Bright Data heals the collector when the layout moves.

Happy to take questions — especially on the heal loop or why we didn’t just call the npm API.

---

# OPTIONAL BACKUP SLIDES (if asked)

**B1 — Collection API details**  
trigger → poll dataset → Zod → heal → trigger again.

**B2 — Signal regexes (honesty)**  
Security / breaking / deprecation / yanked are rule-based over `notice_text` + `changelog_excerpt`. Deterministic on purpose.

**B3 — Mock vs live**  
`CHANGELOG_RADAR_MOCK=1` for flow. Live needs three `c_…` ids + chaos URL. Proof scripts write artifacts under `docs/proof/`.

**B4 — What we refuse to claim**  
We don’t replace NVD. We don’t guarantee exploit detection. We don’t scrape behind login. We surface public maintainer HTML earlier.

---

# FULL SPOKEN SCRIPT (9–11 min, no live demo)

Use this if you cannot share the screen. If you *can* demo, skip the italic “imagine” lines and click instead.

---

**[1. Title]**

Hi, I’m [name]. This is Changelog Radar — a project for Into the Scrape-Verse, built on Bright Data Scraper Studio.

One line: we read what maintainers already wrote on npm and GitHub, before CVE databases catch up — and we keep that scraper alive when those sites restyle themselves.

**[2. Hook]**

Most of us treat “is this dependency dangerous?” as a CVE problem. Dependabot, Snyk, npm audit — they are downstream of NVD and GitHub’s advisory database.

Those feeds are important. They are also late. There is research putting the median gap from a public security release to a public advisory at about twenty-five days. In 2024, NVD had a serious analysis backlog. Meanwhile, proof-of-concept exploits can land in minutes.

So if your only signal is a CVE id, you are choosing to be blind during the most useful window.

**[3. What it is]**

Changelog Radar is the opposite shape. You give us a package.json. We don’t wait for a CVE. We go to the pages maintainers actually update: the npm package page, and GitHub Releases.

We scrape them with Bright Data collectors. We validate the result. We tag security, deprecation, breaking, yanked. If you’re on an old version, we suggest the bump and we tell you why — in the maintainer’s words.

**[4. Why scrape]**

Why not the npm registry API? Because the version number is not the warning.

The warning is a banner that says deprecated. A release body that says security fix. A yanked version. That copy is HTML. It is also unstable HTML. Selectors rot. The HTTP status stays 200. You store empty fields and think the watch is working.

That’s the scrape-verse problem this hackathon is about. Not “can I fetch a URL.” Can I keep structured data flowing when the DOM is not a contract.

**[5. Outputs]**

What you take away from a run is not a mystery score. It’s quotes, tags, bumps, and if we had to heal, a timeline that proves we recovered.

We are explicit about what we are not. We do not mint CVE ids. We do not replace NVD. We are an earlier channel: maintainer prose.

**[6. Stack]**

Implementation: TypeScript monorepo. Next.js UI. Express API that also hosts MCP for Cursor. Shared package for Zod, the Bright Data client, and the orchestrator. Deployed as two services on Zerops.

OpenAI is optional and shallow — it checks URL guesses and writes a summary. The scrape and the tags do not depend on it. You can demo the full flow in mock mode.

**[7. Architecture]**

Architecturally it’s a fan-out. Manifest in, URLs out, three collectors — npm, GitHub, and a chaos page we own so we can break it on purpose — then a single Zod schema as the gate.

Health is modeled: idle, scraping, healing, healthy, failed. The UI shows it. MCP can ask for it.

**[8. Zod]**

The interesting engineering is the gate.

We require latest_version and changelog_excerpt. If either is missing, the scrape did not succeed, period. That failure becomes a heal prompt, written in plain language, clipped to a thousand characters, sent to Bright Data Self-Healing.

We describe what the fields mean in English so the healer can re-bind to a new layout instead of us shipping a CSS hotfix.

**[9. Heal]**

Heal means: refactor the template, auto-approve the diff, scrape again, same collector id.

I want to stress same id. Creating a new collector is cheating. The operational story is: this scraper is an asset that gets repaired, not discarded.

We prove it with chaos. Change the class names on a page we host. First collect fails Zod. Heal. Retry succeeds. That’s the demo judges can feel.

**[10. MCP]**

Same core, second door: Cursor. Tools for audit, latest findings, scraper health, and the chaos demo. A developer can stay in the agent and still get structured warnings.

**[11–13. Demo]**

*If live:* Open localhost:3000. Open Radar. Scan fixture. Show URL preview. Show cards and map. Run chaos heal. Show the chip and timeline. Switch to Cursor and run the audit prompt.

*If not live:* Walk the three screenshots. Emphasize quotes, the heal timeline, and the matching MCP payload.

**[14. Learning]**

I learned to treat hollow scrapes as the enemy — not downtime, emptiness. I learned a schema is a product feature. I learned self-heal only counts in place. I learned MCP is a forcing function for honest APIs. And I learned the interesting security window is before the CVE, not a bigger feed of CVEs.

**[15. Next]**

Next would be more ecosystems, a real store for watch mode, better repo resolution, and scheduled heal evals.

**[16. Close]**

Read the page. Trust the schema. Heal in place.

Questions?

---

# DELIVERY NOTES FOR CLAUDE (how to render)

- 16:9. 16 main slides. Backup at the end, hidden.
- One idea per slide. Prefer a diagram over 8 bullets.
- Use the real product name **Changelog Radar**, not ScrapeVerse, on titles. ScrapeVerse is the hackathon / repo.
- Screenshot slots: leave labeled gray frames so the presenter can paste from `localhost:3000` and `/radar`.
- Speaker notes = the script, slightly tightened. Do not add features (no “ML classifier,” no “we block exploits,” no “real-time CVE generation”).
- Timing: slides 1–10 ~6.5 min; demo 11–13 ~2.5 min; 14–16 ~1.5 min.

# CLAUDE PROMPT — END

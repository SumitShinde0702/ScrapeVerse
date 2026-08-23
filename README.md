# Changelog Radar

[![CI](https://github.com/SumitShinde0702/ScrapeVerse/actions/workflows/ci.yml/badge.svg)](https://github.com/SumitShinde0702/ScrapeVerse/actions/workflows/ci.yml)
![Node 20+](https://img.shields.io/badge/node-%3E%3D20-3dff9a)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Zod at edges](https://img.shields.io/badge/validation-Zod-8b5cf6)

**Read what maintainers already wrote — before CVE databases catch up.**

Changelog Radar turns a `package.json` into live scrapes of npm package pages and GitHub Releases. It tags security / deprecation / breaking signals from that HTML, suggests version bumps, and when a site layout breaks the scraper, **Bright Data Self-Healing** repairs the same collector and retries.

Built for the [Into the Scrape-Verse](https://www.wemakedevs.org/hackathons/scrape-verse) hackathon (Bright Data Scraper Studio).

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&center=true&width=620&lines=Paste+package.json;Preview+scrape+URLs;Bright+Data+scrapes+maintainer+pages;Zod+tripwire+%E2%86%92+Self-Heal+%E2%86%92+retry;Structured+signals+%2B+bump+suggestions" alt="Changelog Radar flow" />
</p>

<p align="center">
  <img src="docs/assets/flow.svg" alt="Pipeline diagram" width="720" />
</p>

---

## Monday-morning pickup (60 seconds)

A stranger should be productive in one terminal:

```bash
git clone https://github.com/SumitShinde0702/ScrapeVerse.git
cd ScrapeVerse
npm run setup
npm run dev
```

| Step | What happens |
|------|----------------|
| `npm run setup` | Creates `.env`, installs deps, copies hero assets, builds `shared` |
| `npm run dev` | API on `:8787` + UI on `:3000` |
| `npm run verify` | Same **typecheck + build** as GitHub Actions CI |

**Coding agents:** read [AGENTS.md](AGENTS.md) — conventions, layout, proof commands.  
**Humans:** [CONTRIBUTING.md](CONTRIBUTING.md) — PR checklist, code style.

Live Bright Data after setup: `npm run setup:live` → fill token + `c_…` IDs in `.env` → [docs/setup-collectors.md](docs/setup-collectors.md).

---

## The problem (why this exists)

Modern apps sit on hundreds of npm packages. Security tools mostly watch **CVE feeds** (NVD, GHSA). Those feeds are important — and they are often **late**.

### The lag is real

| Fact | Why it matters |
|------|----------------|
| **~25 days** median delay from a public security release to an advisory in public vulnerability databases ([Endor Labs / CSO Online](https://www.csoonline.com/article/3596697/kicking-dependency-why-cybersecurity-needs-a-better-model-for-handling-oss-vulnerabilities.html)) | Your scanner stays quiet while the fix is already on GitHub Releases. |
| **NVD backlog**: in 2024, thousands of CVEs sat **Awaiting Analysis** for months (peaks above **~18k** unenriched; analysis rates dropped near **3%** at the worst point — [Talos](https://blog.talosintelligence.com/nvd-vulnerability-backlog-the-need-to-know/), [VulnCheck](https://www.vulncheck.com/blog/nvd-backlog-exploitation-lurking)) | Tools that only trust NVD metadata go blind even after a CVE id exists. |
| Exploit PoCs can appear **minutes** after disclosure | Waiting for a polished CVE entry is not a strategy. |

### Maintainers speak first — on HTML pages

Before a CVE id exists, maintainers already:

- stamp **deprecation / security banners** on [npmjs.com](https://www.npmjs.com)
- write **“security fix”** into GitHub Release bodies
- **yank** bad versions

That prose is the earliest public signal. Registry JSON gives you a version number. It does **not** reliably give you the human-written notice a developer actually reads.

### Scraping that HTML usually fails quietly

1. **Selectors rot** — npm restyles a sidebar; GitHub renames a class. The scraper returns empty `latest_version` / `changelog_excerpt`.
2. **HTTP 200 looks healthy** — the job “succeeded,” but you stored ghosts.
3. **Fixing scrapers is a ticket** — by the time someone rewrites CSS, the pre-CVE window is gone.

**One sentence:** teams need the maintainer page *now*, and they need the scraper to stay alive when the DOM moves.

---

## The solution

**Changelog Radar = package.json → Bright Data scrapes → Zod validation → signal tags + bumps → self-heal on failure.**

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

### What you get

| Output | Meaning |
|--------|---------|
| **Signals** | Maintainer prose tagged: `security`, `deprecation`, `breaking`, `yanked` |
| **Suggested bumps** | `you are on X → latest on page is Y` with a short reason |
| **Heal timeline** | Proof the scraper did not die when the DOM broke |
| **Watch mode** | Rescan on an interval (proactive) |
| **Cursor MCP** | Same audit from the agent: `audit_dependencies` |

### What we do **not** do

- We do **not** invent CVEs or replace NVD/GHSA.
- We do **not** scrape with frozen CSS as the source of truth.
- We do **not** replace the collector on heal — we **mutate the same `c_…` id** and retry.

---

## How the scraper is used (Bright Data)

Changelog Radar is a **Scraper Studio (Data Collector API)** product path — not a generic proxy demo.

### Three collectors

| Collector | Env var | Target |
|-----------|---------|--------|
| npm | `BRIGHT_DATA_COLLECTOR_NPM` | `https://www.npmjs.com/package/{name}` |
| GitHub Releases | `BRIGHT_DATA_COLLECTOR_GITHUB` | `https://github.com/{owner}/{repo}/releases` |
| Chaos (demo) | `BRIGHT_DATA_COLLECTOR_CHAOS` | Your hosted chaos page (`CHAOS_PAGE_URL`) |

Each run sends inputs shaped like `[{ "url": "…" }]`. Collectors extract:

- `package_name`
- `url`
- `latest_version`
- `published_at`
- `deprecated_or_yanked` (boolean)
- `notice_text` (banner / advisory copy; may be null)
- `changelog_excerpt` (release / changelog prose)

Fields are described in **plain language** so Self-Healing can repair extraction when the layout changes.

### Collection loop

1. `POST /dca/trigger?collector=c_…&queue_next=1` with the URL list  
2. Poll `GET /dca/dataset?id=…` until rows arrive  
3. Parse every row with **Zod** (`MaintainerSignalSchema`)  
4. On Zod miss → heal pipeline (below) → trigger again → validate again  

### Self-healing loop (same collector id)

1. Build a ≤1000-character heal prompt from Zod issue paths  
2. `POST …/refactor_template`  
3. Poll progress until the job pauses with a template diff  
4. Auto-approve (`resume_automation_job` with approve)  
5. Re-trigger scrape on the **same** `c_…`  
6. Re-validate  

That is the hackathon proof: scrapers that survive layout drift without a human rewriting selectors overnight.

### End-to-end user flow (UI)

1. **Paste / upload** a `package.json`  
2. **Scan** → preview the exact URLs that will be scraped (optional OpenAI check that GitHub guesses look right)  
3. **Looks correct** → Bright Data scrapes  
4. **Results** → per-package cards with quotes, tags, and suggested bumps  
5. Optional: **Start watch** or **Chaos heal demo**  

---

## Architecture

```
web-ui (Next.js)
   │  HTTP /api/*
   ▼
mcp-server (Express API + MCP stdio)
   │
   ▼
packages/shared (Zod, orchestrator, Bright Data client)
   │
   ▼
Scraper Studio collectors: npm | github_releases | chaos
```

| Path | Role |
|------|------|
| `packages/shared` | Schemas, signals, Bright Data client, orchestrator |
| `mcp-server` | HTTP API + Cursor MCP tools |
| `web-ui` | Landing + guided Radar UI |
| `fixtures/chaos-page` | Controllable HTML for heal demos |
| `docs/setup-collectors.md` | Create collectors + redeem credits |

---

## Quick start (mock — no Bright Data key)

Use this to try the product flow with canned maintainer notes.

```bash
npm run setup
npm run dev
```

Or manually:

```bash
cp .env.example .env
npm install
copy public\moon-walk\moon-walk\moon-walk.mp4 web-ui\public\moon-walk.mp4
copy public\moon-walk\moon-walk\moon-walk.jpg web-ui\public\moon-walk.jpg
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Open Radar**.

- **Scan** → review URLs → **Looks correct** → results  
- **Start watch** → proactive rescans  
- **Chaos heal demo** → forced Zod fail → heal timeline  

---

## Live Bright Data mode (real websites)

1. Redeem hackathon credits: Bright Data **Billing** → code **`wemakedevs`** (lowercase)  
2. Install CLI: `npm install -g @brightdata/cli` then `bdata login`  
3. Create collectors — see [docs/setup-collectors.md](docs/setup-collectors.md)  
   (CLI needs **URL + description**; Command Prompt needs **double quotes**)  
4. Put into `.env`:

```env
CHANGELOG_RADAR_MOCK=0
BRIGHT_DATA_API_TOKEN=...
BRIGHT_DATA_COLLECTOR_NPM=c_...
BRIGHT_DATA_COLLECTOR_GITHUB=c_...
BRIGHT_DATA_COLLECTOR_CHAOS=c_...
CHAOS_PAGE_URL=https://your-hosted-chaos-page/
```

5. Restart: `npm run dev` — Radar chip should say **LIVE**, not **MOCK**  
6. Proof scripts:

```bash
npm run prove:live   # Proof A — live collect
npm run prove:heal   # Proof B — heal after DOM break
```

Artifacts: `docs/proof/live-collect/`, `docs/proof/heal/`.

Optional: `OPENAI_API_KEY` for URL review on the preview step and a short results summary (scraping stays Bright Data + rules either way).

---

## Cursor MCP

```json
{
  "mcpServers": {
    "changelog-radar": {
      "command": "node",
      "args": ["mcp-server/dist/mcp.js"],
      "cwd": "C:/Users/sumit/OneDrive/Desktop/ScrapeVerse",
      "env": {
        "CHANGELOG_RADAR_MOCK": "1"
      }
    }
  }
}
```

Build first: `npm run build -w @changelog-radar/shared && npm run build -w @changelog-radar/mcp-server`.

| Tool | Mode |
|------|------|
| `audit_dependencies` | Reactive package.json audit |
| `get_latest_findings` | Proactive feed |
| `get_scraper_health` | Collector + heal status |
| `run_chaos_heal_demo` | Proof B helper |

**Example prompt:** *Audit my package.json for maintainer warnings before CVE databases catch up.*

---

## Demo (~90s)

See [docs/DEMO.md](docs/DEMO.md).

1. Landing — brand **Changelog Radar**  
2. Radar — Scan → confirm URLs → results (quotes + bumps)  
3. Chaos heal — Healing → Healthy + timeline  
4. Cursor MCP — same structured findings  

---

## Bottom line

| Old world | Changelog Radar |
|-----------|-----------------|
| Wait for CVE / NVD enrichment | Read maintainer HTML **now** |
| CSS scrapers go hollow on restyle | Zod tripwire + Bright Data heal **in place** |
| Opaque “audit” dumps | Clear flow: manifest → URLs → scrape → warnings + bumps |
| “Works on my machine” | `npm run setup` + CI `verify` + [AGENTS.md](AGENTS.md) |

## Repo hygiene (Clean Code)

| Artifact | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | LLM / Cursor agent conventions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Human contributor guide |
| [scripts/setup.mjs](scripts/setup.mjs) | Cross-platform bootstrap |
| [scripts/verify.mjs](scripts/verify.mjs) | Local CI parity |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | Typecheck + build on every push |
| `.editorconfig` / `.nvmrc` | Consistent formatting + Node 20 |

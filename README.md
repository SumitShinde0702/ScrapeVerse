# Changelog Radar

Self-healing maintainer-page radar for the [Into the Scrape-Verse](https://www.wemakedevs.org/hackathons/scrape-verse) hackathon (Bright Data Scraper Studio).

**Positioning:** Read npm + GitHub Releases (and a controllable chaos page) before CVE databases catch up. When the DOM moves, Zod fails → Bright Data Self-Healing → retry. Use it **reactively** from Cursor MCP or **proactively** via Watch.

## Architecture

```
web-ui (Next.js) ──HTTP──► mcp-server (Express API + MCP stdio)
                              │
                              ▼
                     packages/shared (Zod, Bright Data client, orchestrator)
                              │
                              ▼
                     Scraper Studio collectors: npm | GitHub | chaos
```

## Quick start (mock mode — no Bright Data key required)

```bash
cp .env.example .env
# leave BRIGHT_DATA_API_TOKEN empty → CHANGELOG_RADAR_MOCK behavior (auto when token missing)

npm install
npm run build -w @changelog-radar/shared

# terminal 1 — API
npm run dev:api

# terminal 2 — UI (copy hero video first)
copy public\moon-walk\moon-walk\moon-walk.mp4 web-ui\public\moon-walk.mp4
copy public\moon-walk\moon-walk\moon-walk.jpg web-ui\public\moon-walk.jpg
npm run dev:ui
```

Open [http://localhost:3000](http://localhost:3000) (moon-walk landing) → **Open Radar**.

- **Run audit** — scrape fixture deps (mock rows tagged with security signals)
- **Start watch** — proactive rescan + findings feed
- **Chaos heal demo** — forced Zod failure → heal timeline → retry success

### Proof scripts

```bash
npm run prove:live   # Proof A
npm run prove:heal   # Proof B (chaos heal pipeline)
```

Artifacts land in `docs/proof/live-collect/` and `docs/proof/heal/`.

## Live Bright Data mode

1. Redeem credits: Bright Data billing → code `wemakedevs` (lowercase)
2. Follow [docs/setup-collectors.md](docs/setup-collectors.md) to create three collectors
3. Deploy `fixtures/chaos-page/` publicly; set `CHAOS_PAGE_URL`
4. Fill `.env` collector IDs + `BRIGHT_DATA_API_TOKEN`
5. Set `CHANGELOG_RADAR_MOCK=0`
6. Re-run `prove:live` / `prove:heal`

For a **real DOM heal**: edit hosted chaos HTML (rename `.version-number` / `.security-notice`), then scrape with live `c_chaos`.

## Cursor MCP

Add to Cursor MCP settings:

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

Build MCP first: `npm run build -w @changelog-radar/shared && npm run build -w @changelog-radar/mcp-server`.

### Tools

| Tool | Mode |
|------|------|
| `audit_dependencies` | Reactive package.json audit |
| `get_latest_findings` | Proactive feed |
| `get_scraper_health` | Collector + heal status |
| `run_chaos_heal_demo` | Proof B helper |

**Example prompt:** *Audit my package.json for maintainer warnings before CVE databases catch up.*

## Demo script (~90s)

See [docs/DEMO.md](docs/DEMO.md). Short version:

1. Landing — moon-walk hero, brand **Changelog Radar**
2. Radar — Run audit → npm + GitHub rows + bumps
3. Chaos heal demo → orange Healing → green + timeline
4. Cursor MCP `audit_dependencies` → same structured findings

## Repo map

| Path | Role |
|------|------|
| `packages/shared` | Zod schemas, Bright Data client, orchestrator |
| `mcp-server` | HTTP API + MCP stdio |
| `web-ui` | Landing + radar UI |
| `fixtures/chaos-page` | Controllable heal demo HTML |
| `docs/setup-collectors.md` | Day 0 Bright Data setup |

## UI stack

Taste-oriented tokens (Syne / IBM Plex, signal green), moon-walk hero, shadcn-like ops chrome, React Flow signal map. Aceternity/React Bits used sparingly via motion + heal pulse.

# Day 0 — Bright Data collectors

Changelog Radar needs three Scraper Studio collectors. Redeem hackathon credits with code `wemakedevs` (lowercase) in Bright Data billing.

## 1. Create collectors

Fastest path (CLI inside Cursor / Claude Code):

```bash
bdata login
# or: export BRIGHT_DATA_API_TOKEN=...

bdata scraper create "Scrape npm package pages. Input: url. Output JSON fields: package_name, url, latest_version, published_at, deprecated_or_yanked (boolean), notice_text, changelog_excerpt. Prefer plain-language extraction so Self-Healing can repair selectors."

bdata scraper create "Scrape GitHub Releases pages (github.com/owner/repo/releases). Input: url. Same output fields as npm collector. latest_version = newest release tag; changelog_excerpt = release body text; notice_text = security/advisory banner if any."

bdata scraper create "Scrape the Changelog Radar chaos demo page. Input: url. Extract package_name from .package-name, latest_version from .version-number, notice_text from .security-notice, changelog_excerpt from .changelog. deprecated_or_yanked false unless notice says deprecated."
```

Copy the three `c_...` IDs into `.env`:

```
BRIGHT_DATA_API_TOKEN=...
BRIGHT_DATA_COLLECTOR_NPM=c_...
BRIGHT_DATA_COLLECTOR_GITHUB=c_...
BRIGHT_DATA_COLLECTOR_CHAOS=c_...
CHAOS_PAGE_URL=https://<your-deployed-chaos-page>/
```

## 2. Host the chaos page

Deploy `fixtures/chaos-page/` (static) so Bright Data can reach it, e.g. Vercel / Netlify / GitHub Pages. Set `CHAOS_PAGE_URL`.

## 3. Proof A

```bash
cp .env.example .env
# fill tokens
npm install
npm run prove:live
```

Pass = npm + GitHub (+ chaos) return Zod-valid rows under `docs/proof/live-collect/`.

## 4. Proof B (heal)

1. Baseline: chaos scrape succeeds.
2. Edit hosted HTML: rename `.version-number` → `#ver`, `.security-notice` → `.alert-box`.
3. `npm run prove:heal`
4. Save artifacts in `docs/proof/heal/`.

Without credentials, set `CHANGELOG_RADAR_MOCK=1` to exercise the pipeline with fixtures.

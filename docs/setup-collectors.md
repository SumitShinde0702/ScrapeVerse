# Day 0 — Bright Data collectors

Changelog Radar needs three Scraper Studio collectors. Redeem hackathon credits with code `wemakedevs` (lowercase) in Bright Data billing.

## 1. Create collectors

Install the Bright Data CLI first (Windows):

```bash
npm install -g @brightdata/cli
```

Or skip the global install and prefix every command with `npx -p @brightdata/cli`.

Then log in and create three collectors. Current CLI syntax is **URL first, then description**. Each create can take 5–15 minutes.

Command Prompt (use **double quotes** — single quotes do not group arguments in cmd):

```bat
bdata login

bdata scraper create https://www.npmjs.com/package/lodash "Extract package_name, url, latest_version, published_at, deprecated_or_yanked as boolean, notice_text, and changelog_excerpt from this npm package page using plain-language extraction." --name changelog-radar-npm

bdata scraper create https://github.com/lodash/lodash/releases "Extract package_name, url, latest_version as the newest release tag, published_at, deprecated_or_yanked as boolean, notice_text, and changelog_excerpt from this GitHub Releases page." --name changelog-radar-github
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

# Contributing

Thanks for helping make Changelog Radar readable on a Monday morning.

## Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- npm 10+

## First run (60 seconds)

```bash
git clone https://github.com/SumitShinde0702/ScrapeVerse.git
cd ScrapeVerse
npm run setup
npm run dev
```

Open http://localhost:3000/radar — **Scan → Looks correct**.

Windows: `powershell -File scripts/setup.ps1`  
macOS/Linux: `bash scripts/setup.sh`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run setup` | Create `.env`, install, copy hero assets, build shared |
| `npm run setup:live` | Same + set `CHANGELOG_RADAR_MOCK=0` |
| `npm run verify` | Typecheck + build (matches CI) |
| `npm run dev` | API + UI together |
| `npm run prove:live` | Bright Data live collect proof |
| `npm run prove:heal` | Self-heal proof |

## Code style

- **TypeScript strict** in all packages
- **Zod** for every external payload boundary
- Prefer **explicit errors** at HTTP handlers (`400` + `{ error }`) over silent catches
- UI: keep Radar flow as **edit → preview → results**; hide ops panels behind Advanced
- No drive-by refactors — smallest diff that solves the task

## Pull requests

1. Branch from `main`
2. `npm run verify` must pass
3. Describe **why**, not just what
4. If you touch Bright Data collectors, update `docs/setup-collectors.md`

## Agents

LLM coding agents should read [AGENTS.md](AGENTS.md) before editing.

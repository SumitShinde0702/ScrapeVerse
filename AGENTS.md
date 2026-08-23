# Agent guide (Cursor / Claude / Codex)

This repo is a **monorepo** built to be picked up on Monday. Follow these rules when editing.

## One-command bootstrap

```bash
npm run setup    # .env, deps, shared build, hero assets
npm run dev      # API :8787 + UI :3000
npm run verify   # same checks as CI
```

Live Bright Data: fill `.env` from `.env.example`, run `npm run setup:live`, then `docs/setup-collectors.md`.

## Layout

| Path | Responsibility |
|------|----------------|
| `packages/shared` | **Single source of truth**: Zod schemas, signal tagging, Bright Data client, orchestrator |
| `mcp-server` | HTTP API + MCP stdio; thin routes, no business logic duplication |
| `web-ui` | Next.js UI; calls API via `/api/*` proxy |
| `fixtures/` | Demo `package.json` + chaos HTML |
| `scripts/` | Setup + verify (cross-platform) |

## Clean-code rules

1. **Validate at the edges** — external data (Bright Data rows, `package.json`) must pass Zod in `packages/shared` before use.
2. **No duplicate types** — import from `@changelog-radar/shared` or `web-ui/src/lib/api.ts` (UI mirror only).
3. **Fail open for optional AI** — missing `OPENAI_API_KEY` must not break preview or audit.
4. **Small diffs** — match existing naming (`MaintainerSignal`, `auditPackageJson`, `scrapeAndValidate`).
5. **No secrets in git** — `.env` is ignored; document keys in `.env.example` only.

## Common tasks

| Task | Command |
|------|---------|
| Mock demo | `CHANGELOG_RADAR_MOCK=1` + `npm run dev` |
| Proof live scrape | `npm run prove:live` |
| Proof self-heal | `npm run prove:heal` |
| MCP server | `npm run build -w @changelog-radar/mcp-server && node mcp-server/dist/mcp.js` |

## MCP config

Copy `docs/cursor-mcp.example.json` into Cursor settings. Build shared + mcp-server first.

## Before opening a PR

```bash
npm run verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

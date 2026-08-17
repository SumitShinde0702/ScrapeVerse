# Demo script (≈90 seconds)

1. **Landing** — open `http://localhost:3000`. Moon-walk full-bleed video; brand **Changelog Radar**; CTA Open Radar.
2. **Reactive audit** — Run audit. Show npm + GitHub (+ chaos) rows, signal tags, suggested bumps, React Flow map.
3. **Proactive watch** — Start watch; findings feed fills; mention MCP `get_latest_findings`.
4. **Self-heal** — Chaos heal demo. Health chip goes Healing (orange pulse) → Healthy; heal timeline shows Zod fail → heal → retry.
5. **Agent** — In Cursor: “Audit my package.json for maintainer warnings before CVE databases catch up.” Tool `audit_dependencies` returns the same structured result / `audit_id`.

## Live Bright Data (judges)

Follow `docs/setup-collectors.md`. Set collectors in `.env`, `CHANGELOG_RADAR_MOCK=0`, deploy chaos page, then:

- `npm run prove:live`
- Edit chaos HTML selectors on the hosted page
- `npm run prove:heal` (or Chaos heal demo with live collector)

# YouTube demo — 3:00 max

Hackathon field: **YouTube video demo link**. Upload **unlisted**, paste the URL. Hard cap **3:00**. Aim to finish speaking at **2:50** so YouTube never truncates you.

Record **1080p 16:9**, browser zoom **90%**, hide bookmarks. Prefer **LIVE** chip if collectors work; otherwise **MOCK** is fine if you say so in one clause. **Jump-cut** every Bright Data wait — never sit on a spinner.

Do **not** cover Watch mode. Four beats only: about → architecture → Radar audit → chaos heal. Learning is two sentences at the end.

---

## YouTube metadata (paste on upload)

**Title**

Changelog Radar — maintainer-page radar with Bright Data Self-Healing (Into the Scrape-Verse)

**Description**

Changelog Radar turns a package.json into live Bright Data Scraper Studio scrapes of npm and GitHub Releases. Zod validates the row. On layout drift we heal the same collector id and retry — we do not replace NVD, and we do not invent CVEs.

Into the Scrape-Verse (WeMakeDevs × Bright Data Scraper Studio)

0:00 About
0:32 Tech stack and architecture
1:00 Demo — scan + results
1:55 Demo — chaos self-heal
2:40 Learning

**Visibility:** Unlisted (or Public).  
**Cards / end screen:** none required.

---

## Runtime (do not exceed)

| Clock | Section | On screen |
|------:|---------|-----------|
| 0:00–0:32 | About the project | Landing (`/`) |
| 0:32–1:00 | Tech stack and architecture | Landing `#technical` |
| 1:00–1:55 | Demo — audit | `/radar` scan → cards |
| 1:55–2:40 | Demo — heal | Chaos heal chip + timeline |
| 2:40–2:55 | Learning | Stay on healed UI, or cut to landing closer |
| 2:55–3:00 | End | Title + repo / live URL |

Spoken ~140 words/min. Full script below is **~390 words ≈ 2:50**.

---

## Before you hit record

```bash
npm run dev
```

1. Open `http://localhost:3000` — moon-walk hero should play.
2. Open Radar once, confirm fixture `package.json` loads (lodash / express / axios / minimist / semver).
3. Do a **dry-run Scan → Looks correct** so you know how long the wait is. You will **cut that wait** in the edit.
4. Dry-run **Chaos heal demo** once so the timeline is familiar.
5. Close extra tabs. Cursor can stay in a second window if you have 10 seconds left; it is optional, not required.

Mic: phone as a lav, or headset. Room tone 2 seconds at the start for noise reduction.

---

## Teleprompter (read this)

Record voice **while** you click, or do a voice-over in the edit. Either works. Do not improvise extra features.

### 0:00 About — landing hero

Click: stay on `/`. Let the hero sit. Do not scroll yet.

> This is Changelog Radar. It reads what maintainers already wrote — on npm pages and GitHub Releases — before CVE databases catch up.
>
> Security scanners wait on NVD and GHSA. That feed is often weeks late. Maintainers already stamped the warning: a deprecation banner, a yanked version, a release body that says security fix. That warning is HTML, not a CVE id.
>
> We turn a package.json into Bright Data scrapes of those pages, tag the prose, and suggest version bumps. When the site layout breaks the scraper, we don't open a ticket. Bright Data Self-Healing repairs the same collector, and we retry.

### 0:32 Architecture — scroll `#technical`

Click: scroll to **Technical**. Pause on the collectors list, then the two columns (Collection / Self-healing).

> Stack: Next.js UI, Express API plus Cursor MCP, shared TypeScript core with Zod.
>
> Three Scraper Studio collectors: npm, GitHub Releases, and a chaos page we host so we can break the DOM on purpose.
>
> Every row must pass Zod — latest version and changelog excerpt required. HTTP 200 is not health. If validation fails, we send a plain-language heal prompt, auto-approve the template diff, and scrape again on the same collector id. We mutate the scraper. We do not mint a new one.

### 1:00 Demo — Open Radar, scan

Click: **Open Radar**. Fixture JSON should already be there. **Scan**. Show the URL preview (npm + GitHub). Click **Looks correct**.

**Edit:** cut from spinner → results. Do not narrate the wait.

On results, hover one card with a **security** or **deprecation** tag. Point at a suggested bump. Briefly show the React Flow map.

> Paste a package.json. We preview the exact URLs before we scrape — human in the loop.
>
> Here's the result: quotes from the page, tags — security, deprecation, breaking, yanked — and a bump: you are on this version, the page says that version, and the reason is the maintainer's sentence. Not a CVE we invented.
>
> Same data on the map.

### 1:55 Demo — chaos heal

Click: **Chaos heal demo** (or the heal control in Radar).

**Edit:** cut so the chip is visibly **Healing** (orange), then **Healthy**. Hold the heal timeline: `validation_failed` → `heal_started` → `heal_approved` → `retry_succeeded`.

> Proof the scraper survives layout drift. We point a collector at a page we control, break the selectors, Zod fails — that's the tripwire — Bright Data rewrites the template on the same id, we retry, we're healthy. That's the product.

### 2:40 Learning

Stop clicking. Face the same screen.

> What I learned: a hollow scrape is worse than downtime — Zod has to be the tripwire. Self-heal only counts if you keep the same collector. And the useful window is before the CVE, not instead of it.
>
> Changelog Radar — thanks.

### 2:55 End card (optional, 5s, no talk)

Full screen text:

```
Changelog Radar
Read maintainer pages before CVE databases catch up.
```

---

## Shot list (editor)

| # | Footage | Duration in timeline | Notes |
|---|---------|----------------------|--------|
| 1 | Landing hero | 0:00–0:32 | Audio from teleprompter “About” |
| 2 | Technical section scroll | 0:32–1:00 | Slow scroll; don't race |
| 3 | Radar editor + Scan | 1:00–1:18 | Show fixture deps |
| 4 | URL preview | 1:18–1:28 | npm + github rows visible |
| 5 | **CUT** scrape wait | 0s in final | Discard |
| 6 | Result cards + one bump | 1:28–1:48 | Cursor highlights a tag |
| 7 | Signal map | 1:48–1:55 | One pan, don't play with nodes |
| 8 | Chaos heal — Healing chip | 1:55–2:10 | Must see orange |
| 9 | **CUT** heal wait | 0s in final | Discard |
| 10 | Healthy + timeline | 2:10–2:40 | Zoom timeline if tiny |
| 11 | Talking / still UI | 2:40–2:55 | Learning lines |
| 12 | End card | 2:55–3:00 | Optional |

If heal finishes instantly in mock, **pause on the timeline** and keep talking — don't skip beat 10.

---

## Optional 8-second MCP insert (only if you finish early)

If the cut is under **2:40**, insert before Learning:

Screen: Cursor chat.

Prompt to paste:

```
Audit my package.json for maintainer warnings before CVE databases catch up.
```

Say:

> Same audit from Cursor MCP — tool `audit_dependencies` — same structured result.

If including this **drops Watch, not heal**. Heal is the hackathon proof.

---

## Captions to burn in (large, lower-third)

Keep each on screen only during that beat:

1. `CVE feeds are late. Maintainers already wrote the warning.`
2. `package.json → Bright Data collectors → Zod → tags + bumps`
3. `On Zod fail: heal the same collector, then retry`
4. `Chaos demo: layout break → Healing → Healthy`

Do not cover the health chip or the heal timeline with captions.

---

## What you must not say

- We invent or assign CVE ids
- We replace NVD / GHSA / `npm audit`
- We scrape with frozen CSS as the source of truth
- We create a **new** collector on heal
- Watch mode, unless you have leftover time (you won't)

---

## If something breaks while recording

| Problem | Fix in the edit |
|---------|------------------|
| Scrape hangs | Jump to a previous successful results screen; say “live collect” over it |
| MOCK chip showing | One honest line: “This pass is mock fixtures; the heal loop is the same path as live.” |
| Chaos heal too fast | Freeze last frame of the timeline for 8s and read the heal paragraph |
| Over 3:00 | Delete map (1:48–1:55), then end card. Never delete heal. |

---

## Submit

1. Export **H.264, 1080p, ≤3:00**.
2. Upload to YouTube → **Unlisted**.
3. Wait until processing finishes (the link 404s if you copy too early).
4. Paste the `https://youtu.be/…` or `https://www.youtube.com/watch?v=…` URL into the form field **YouTube video demo link**.

#!/usr/bin/env node
/**
 * Cross-platform first-run setup. Safe to run multiple times.
 * Usage: node scripts/setup.mjs [--live]
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const live = process.argv.includes("--live");

function log(msg) {
  console.log(`\x1b[36m[setup]\x1b[0m ${msg}`);
}

function fail(msg) {
  console.error(`\x1b[31m[setup]\x1b[0m ${msg}`);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: root,
    shell: process.platform === "win32",
    ...opts,
  });
  if (r.status !== 0) fail(`${cmd} ${args.join(" ")} failed`);
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) fail(`Node 20+ required (found ${process.version})`);

const envPath = join(root, ".env");
const envExample = join(root, ".env.example");
if (!existsSync(envPath)) {
  copyFileSync(envExample, envPath);
  log("Created .env from .env.example");
} else {
  log(".env already exists — left unchanged");
}

if (live) {
  let env = readFileSync(envPath, "utf8");
  if (!env.includes("CHANGELOG_RADAR_MOCK=0")) {
    env = env.replace(/CHANGELOG_RADAR_MOCK=\d/g, "CHANGELOG_RADAR_MOCK=0");
    if (!env.includes("CHANGELOG_RADAR_MOCK=")) {
      env += "\nCHANGELOG_RADAR_MOCK=0\n";
    }
    writeFileSync(envPath, env);
    log("Set CHANGELOG_RADAR_MOCK=0 — add Bright Data token + collector IDs next");
  }
}

const assets = [
  [
    join(root, "public", "moon-walk", "moon-walk", "moon-walk.mp4"),
    join(root, "web-ui", "public", "moon-walk.mp4"),
  ],
  [
    join(root, "public", "moon-walk", "moon-walk", "moon-walk.jpg"),
    join(root, "web-ui", "public", "moon-walk.jpg"),
  ],
];

for (const [src, dest] of assets) {
  if (!existsSync(src)) {
    log(`Skip asset (missing source): ${src}`);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  if (!existsSync(dest)) {
    copyFileSync(src, dest);
    log(`Copied ${dest.replace(root, ".")}`);
  }
}

log("Installing dependencies…");
run("npm", ["install"]);

log("Building shared package…");
run("npm", ["run", "build", "-w", "@changelog-radar/shared"]);

console.log("");
log("Done. Next:");
console.log("  npm run dev          → http://localhost:3000/radar");
console.log("  npm run verify       → typecheck + full build (CI)");
if (!live) {
  console.log("  npm run setup:live   → flip .env to live Bright Data mode");
  console.log("  docs/setup-collectors.md → create c_… collector IDs");
}

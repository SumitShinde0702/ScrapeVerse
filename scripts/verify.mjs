#!/usr/bin/env node
/** CI-local parity: typecheck + build all workspaces. */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args) {
  console.log(`\n\x1b[36m[verify]\x1b[0m ${label}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// mcp-server imports @changelog-radar/shared via dist/*.d.ts — build shared first.
run("build shared (workspace type declarations)", "npm", [
  "run",
  "build",
  "-w",
  "@changelog-radar/shared",
]);
run("typecheck shared", "npm", ["run", "typecheck", "-w", "@changelog-radar/shared"]);
run("typecheck mcp-server", "npm", [
  "run",
  "typecheck",
  "-w",
  "@changelog-radar/mcp-server",
]);
run("typecheck web-ui", "npx", [
  "tsc",
  "-p",
  "web-ui/tsconfig.json",
  "--noEmit",
]);
run("build mcp-server", "npm", ["run", "build", "-w", "@changelog-radar/mcp-server"]);
run("build web-ui", "npm", ["run", "build", "-w", "@changelog-radar/web-ui"]);
console.log("\n\x1b[32m[verify]\x1b[0m OK");

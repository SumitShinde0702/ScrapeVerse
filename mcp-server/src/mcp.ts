#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { orchestrator } from "./runtime.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixturesPkg = path.join(root, "fixtures", "package.json");

const server = new Server(
  { name: "changelog-radar", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "audit_dependencies",
      description:
        "Audit package.json dependencies against live maintainer pages (npm + GitHub Releases) via Bright Data Scraper Studio. Returns pre-CVE signals and suggested bumps.",
      inputSchema: {
        type: "object",
        properties: {
          packageJson: {
            type: "string",
            description: "Raw package.json contents. Defaults to fixtures if omitted.",
          },
          includeGithub: { type: "boolean", default: true },
          includeChaos: { type: "boolean", default: false },
          forceChaosBreak: {
            type: "boolean",
            description: "Force chaos layout-break + heal demo path",
          },
          limit: { type: "number", default: 8 },
        },
      },
    },
    {
      name: "get_latest_findings",
      description:
        "Return proactive/reactive findings stored by Changelog Radar Watch.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", default: 20 },
        },
      },
    },
    {
      name: "get_scraper_health",
      description: "Collector health + recent self-heal events",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "run_chaos_heal_demo",
      description:
        "Run Proof B path: simulate chaos page layout break, trigger heal, retry.",
      inputSchema: {
        type: "object",
        properties: {
          chaosUrl: { type: "string" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name;
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;

  if (name === "audit_dependencies") {
    const packageJson =
      typeof args.packageJson === "string"
        ? args.packageJson
        : fs.readFileSync(fixturesPkg, "utf8");
    const result = await orchestrator.auditPackageJson(packageJson, {
      mode: "reactive",
      includeGithub: args.includeGithub !== false,
      includeChaos: Boolean(args.includeChaos),
      forceChaosBreak: Boolean(args.forceChaosBreak),
      limit: typeof args.limit === "number" ? args.limit : 8,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }

  if (name === "get_latest_findings") {
    const limit = typeof args.limit === "number" ? args.limit : 20;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ findings: orchestrator.store.list(limit) }, null, 2),
        },
      ],
    };
  }

  if (name === "get_scraper_health") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              health: orchestrator.getHealth(),
              heal_events: orchestrator.getHealLog(),
              watching: orchestrator.isWatching(),
              mock: orchestrator.client.mock,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "run_chaos_heal_demo") {
    const packageJson = fs.readFileSync(fixturesPkg, "utf8");
    const result = await orchestrator.auditPackageJson(packageJson, {
      mode: "reactive",
      includeGithub: false,
      includeChaos: true,
      forceChaosBreak: true,
      chaosUrl: typeof args.chaosUrl === "string" ? args.chaosUrl : undefined,
      limit: 3,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);

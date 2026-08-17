import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Orchestrator } from "@changelog-radar/shared";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

export const orchestrator = new Orchestrator();
await orchestrator.init();

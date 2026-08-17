import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Finding } from "./schemas.js";

export class FindingsStore {
  private findings: Finding[] = [];
  private readonly filePath: string;

  constructor(dataDir = path.resolve(process.cwd(), ".data")) {
    this.filePath = path.join(dataDir, "findings.json");
  }

  async load() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      this.findings = JSON.parse(raw) as Finding[];
    } catch {
      this.findings = [];
    }
  }

  async persist() {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.findings, null, 2), "utf8");
  }

  async addMany(items: Omit<Finding, "id" | "at">[]) {
    const stamped = items.map((item) => ({
      ...item,
      id: randomUUID(),
      at: new Date().toISOString(),
    }));
    this.findings = [...stamped, ...this.findings].slice(0, 500);
    await this.persist();
    return stamped;
  }

  list(limit = 50): Finding[] {
    return this.findings.slice(0, limit);
  }

  clear() {
    this.findings = [];
    return this.persist();
  }
}

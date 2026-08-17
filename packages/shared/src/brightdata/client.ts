import type { BrightDataConfig } from "../config.js";
import type { Source } from "../schemas.js";

export type TriggerInput = { url: string };

export class BrightDataError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "BrightDataError";
  }
}

export class BrightDataClient {
  constructor(private readonly config: BrightDataConfig) {}

  get mock() {
    return this.config.mock;
  }

  collectorId(source: Source): string | undefined {
    return this.config.collectors[source];
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.config.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  async triggerCollection(
    source: Source,
    inputs: TriggerInput[],
  ): Promise<string> {
    const collector = this.collectorId(source);
    if (!collector) {
      throw new BrightDataError(`No collector configured for ${source}`);
    }
    const url = `${this.config.baseUrl}/dca/trigger?collector=${encodeURIComponent(collector)}&queue_next=1`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(inputs),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new BrightDataError(
        `trigger failed for ${source}`,
        res.status,
        body,
      );
    }
    const collectionId =
      (body as { collection_id?: string }).collection_id ??
      (body as { snapshot_id?: string }).snapshot_id;
    if (!collectionId) {
      throw new BrightDataError("trigger response missing collection_id", res.status, body);
    }
    return collectionId;
  }

  async pollDataset(
    collectionId: string,
    opts: { timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<unknown[]> {
    const timeoutMs = opts.timeoutMs ?? 180_000;
    const intervalMs = opts.intervalMs ?? 5_000;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const url = `${this.config.baseUrl}/dca/dataset?id=${encodeURIComponent(collectionId)}`;
      const res = await fetch(url, { headers: this.headers() });
      const body = await res.json().catch(() => ({}));
      if (Array.isArray(body) && body.length > 0) return body;
      if (Array.isArray(body) && body.length === 0) {
        // empty may mean still building or no rows — keep polling briefly
      }
      await sleep(intervalMs);
    }
    throw new BrightDataError(
      `dataset poll timed out for ${collectionId}`,
      undefined,
      { collectionId },
    );
  }

  /** Trigger self-healing refactor (AI Flow API) */
  async triggerHeal(source: Source, prompt: string): Promise<unknown> {
    const collector = this.collectorId(source);
    if (!collector) {
      throw new BrightDataError(`No collector configured for ${source}`);
    }
    const clipped = prompt.slice(0, 1000);
    const url = `${this.config.baseUrl}/dca/collectors/${encodeURIComponent(collector)}/refactor_template`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ prompt: clipped }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new BrightDataError(`heal trigger failed for ${source}`, res.status, body);
    }
    return body;
  }

  async pollHealProgress(
    source: Source,
    opts: { timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<{ status: string; raw: unknown }> {
    const collector = this.collectorId(source);
    if (!collector) {
      throw new BrightDataError(`No collector configured for ${source}`);
    }
    const timeoutMs = opts.timeoutMs ?? 180_000;
    const intervalMs = opts.intervalMs ?? 5_000;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const url = `${this.config.baseUrl}/dca/collectors/${encodeURIComponent(collector)}/refactor_template/progress`;
      const res = await fetch(url, { headers: this.headers() });
      const body = await res.json().catch(() => ({}));
      const status = String((body as { status?: string }).status ?? "unknown");
      if (
        status === "pending_answer" ||
        status === "done" ||
        status === "completed" ||
        status === "ready" ||
        status === "failed" ||
        status === "error"
      ) {
        return { status, raw: body };
      }
      await sleep(intervalMs);
    }
    throw new BrightDataError(`heal progress timed out for ${source}`);
  }

  async approveHeal(source: Source, approve = true): Promise<unknown> {
    const collector = this.collectorId(source);
    if (!collector) {
      throw new BrightDataError(`No collector configured for ${source}`);
    }
    const url = `${this.config.baseUrl}/dca/collectors/${encodeURIComponent(collector)}/resume_automation_job`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ message: approve }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new BrightDataError(`heal approve failed for ${source}`, res.status, body);
    }
    return body;
  }

  async scrape(source: Source, inputs: TriggerInput[]): Promise<unknown[]> {
    const id = await this.triggerCollection(source, inputs);
    return this.pollDataset(id);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

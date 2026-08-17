"use client";

import { cn } from "@/lib/api";
import type { CollectorHealth, Source } from "@/lib/api";

const labels: Record<CollectorHealth, string> = {
  idle: "Idle",
  scraping: "Scraping",
  healing: "Healing",
  healthy: "Healthy",
  failed: "Failed",
};

export function HealthChip({
  source,
  status,
}: {
  source: Source;
  status: CollectorHealth;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
        status === "healing" && "animate-heal border-[var(--heal)] text-[var(--heal)]",
        status === "healthy" && "border-[var(--signal-dim)] text-[var(--signal)]",
        status === "scraping" && "border-[var(--steel)] text-[var(--steel)]",
        status === "failed" && "border-[var(--danger)] text-[var(--danger)]",
        status === "idle" && "border-[var(--line)] text-[var(--muted)]",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "healing" && "bg-[var(--heal)]",
          status === "healthy" && "bg-[var(--signal)]",
          status === "scraping" && "bg-[var(--steel)]",
          status === "failed" && "bg-[var(--danger)]",
          status === "idle" && "bg-[var(--muted)]",
        )}
      />
      <span className="font-mono uppercase tracking-wide">{source}</span>
      <span>{labels[status]}</span>
    </div>
  );
}

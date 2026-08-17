import { z } from "zod";

export const SourceSchema = z.enum(["npm", "github_releases", "chaos"]);
export type Source = z.infer<typeof SourceSchema>;

export const SignalTagSchema = z.enum([
  "security",
  "breaking",
  "deprecation",
  "yanked",
]);
export type SignalTag = z.infer<typeof SignalTagSchema>;

export const CollectorHealthSchema = z.enum([
  "idle",
  "scraping",
  "healing",
  "healthy",
  "failed",
]);
export type CollectorHealth = z.infer<typeof CollectorHealthSchema>;

/** Unified row returned by all Scraper Studio collectors + Zod gate */
export const MaintainerSignalSchema = z.object({
  source: SourceSchema,
  package_name: z.string().min(1),
  url: z.string().url(),
  latest_version: z.string().min(1),
  published_at: z.string().nullable().optional().default(null),
  deprecated_or_yanked: z.boolean().default(false),
  notice_text: z.string().nullable().optional().default(null),
  changelog_excerpt: z.string().min(1),
  signal_tags: z.array(SignalTagSchema).default([]),
});

export type MaintainerSignal = z.infer<typeof MaintainerSignalSchema>;

export const SuggestedBumpSchema = z.object({
  package_name: z.string(),
  current_version: z.string().nullable(),
  suggested_version: z.string(),
  reason: z.string(),
  source: SourceSchema,
  signal_tags: z.array(SignalTagSchema),
});

export type SuggestedBump = z.infer<typeof SuggestedBumpSchema>;

export const HealEventSchema = z.object({
  id: z.string(),
  at: z.string(),
  collector: SourceSchema,
  stage: z.enum([
    "validation_failed",
    "heal_started",
    "heal_pending_answer",
    "heal_approved",
    "retry_started",
    "retry_succeeded",
    "retry_failed",
  ]),
  detail: z.string(),
  zod_issues: z.array(z.string()).optional(),
});

export type HealEvent = z.infer<typeof HealEventSchema>;

export const FindingSchema = z.object({
  id: z.string(),
  at: z.string(),
  mode: z.enum(["reactive", "proactive"]),
  signal: MaintainerSignalSchema,
  bump: SuggestedBumpSchema.nullable().optional(),
});

export type Finding = z.infer<typeof FindingSchema>;

export const AuditResultSchema = z.object({
  audit_id: z.string(),
  started_at: z.string(),
  finished_at: z.string(),
  mode: z.enum(["reactive", "proactive"]),
  signals: z.array(MaintainerSignalSchema),
  bumps: z.array(SuggestedBumpSchema),
  heal_events: z.array(HealEventSchema),
  health: z.record(SourceSchema, CollectorHealthSchema),
  errors: z.array(z.string()).default([]),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

import { Suspense } from "react";
import { RadarApp } from "./RadarApp";

export default function RadarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
          Loading radar…
        </div>
      }
    >
      <RadarApp />
    </Suspense>
  );
}

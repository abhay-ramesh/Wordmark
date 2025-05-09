"use client";

import { VersionHistory } from "@/components/custom/VersionHistory";
import { useVersionTracking } from "@/lib/hooks/useVersionTracking";

export function VersionHistoryWrapper() {
  // Apply the version tracking hook
  useVersionTracking();

  // Render the version history UI
  return (
    <div className="hidden w-full max-w-full md:block">
      <VersionHistory />
    </div>
  );
}

// src/app/(main)/(dashboard)/index/integrations/integrations-content.tsx
"use client";

import { TwilioConfigCard } from "@/features/integrations/components/TwilioConfigCard";

type Workspace = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export function IntegrationsContent({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect third-party services to power messaging and automation.
        </p>
      </div>
      <TwilioConfigCard workspaces={workspaces} />
    </div>
  );
}

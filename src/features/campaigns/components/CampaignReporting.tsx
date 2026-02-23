"use client";

import { ReportingPage } from "./reporting/ReportingPage";

export function CampaignReporting({
  workspaceId,
  basePath = "/index",
}: {
  workspaceId?: string;
  basePath?: string;
}) {
  return <ReportingPage workspaceId={workspaceId} basePath={basePath} />;
}

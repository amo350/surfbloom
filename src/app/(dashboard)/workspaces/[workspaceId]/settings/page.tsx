import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/lib/auth-utils";
import { prefetchWorkspace } from "@/features/workspaces/server/prefetch";
import { SettingsContent } from "./settings-context";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const SettingsPage = async ({ params }: Props) => {
  await requireAuth();
  const { workspaceId } = await params;
  await prefetchWorkspace(workspaceId);

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-6">
        {/* Left column - 75% width (3 of 4 columns) */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <HydrateClient>
                <ErrorBoundary fallback={<div>Error loading settings</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <SettingsContent workspaceId={workspaceId} />
                  </Suspense>
                </ErrorBoundary>
              </HydrateClient>
            </CardContent>
          </Card>
        </div>

        {/* Right column - 25% width (1 of 4 columns) */}
        <div className="col-span-1">
          {/* Future: Additional settings cards */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

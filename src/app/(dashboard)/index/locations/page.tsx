import { SearchParams } from "nuqs";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  WorkspacesContainer,
  WorkspacesError,
  WorkspacesList,
  WorkspacesLoading,
  WorkspacesPageHeader,
} from "@/features/workspaces/components/workspaces";
import { workspacesParamsLoader } from "@/features/workspaces/server/params-loader";
import { prefetchWorkspaces } from "@/features/workspaces/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const LocationsPage = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await workspacesParamsLoader(searchParams);
  prefetchWorkspaces(params);

  return (
    <>
      <HydrateClient>
        <Suspense fallback={null}>
          <WorkspacesPageHeader />
        </Suspense>
      </HydrateClient>
      <WorkspacesContainer>
        <HydrateClient>
          <ErrorBoundary fallback={<WorkspacesError />}>
            <Suspense fallback={<WorkspacesLoading />}>
              <WorkspacesList />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </WorkspacesContainer>
    </>
  );
};

export default LocationsPage;

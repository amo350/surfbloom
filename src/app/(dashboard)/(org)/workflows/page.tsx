import { SearchParams } from "nuqs";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  WorkflowsContainer,
  WorkflowsError,
  WorkflowsList,
  WorkflowsLoading,
  WorkflowsPageHeader,
} from "@/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const WorkFlowPage = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await workflowsParamsLoader(searchParams);
  prefetchWorkflows(params);

  return (
    <>
      <HydrateClient>
        <Suspense fallback={null}>
          <WorkflowsPageHeader />
        </Suspense>
      </HydrateClient>
      <WorkflowsContainer>
        <HydrateClient>
          <ErrorBoundary fallback={<WorkflowsError />}>
            <Suspense fallback={<WorkflowsLoading />}>
              <WorkflowsList />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </WorkflowsContainer>
    </>
  );
};

export default WorkFlowPage;

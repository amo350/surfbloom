import { redirect } from "next/navigation";
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
import { prisma } from "@/lib/prisma";
import { HydrateClient } from "@/trpc/server";

type Props = {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

const WorkFlowPage = async ({ params, searchParams }: Props) => {
  const session = await requireAuth();
  const { workspaceId } = await params;
  const membership = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });

  if (!membership) {
    redirect("/index/locations");
  }

  const queryParams = await workflowsParamsLoader(searchParams);
  prefetchWorkflows({ ...queryParams, workspaceId });

  return (
    <>
      <HydrateClient>
        <Suspense fallback={null}>
          <WorkflowsPageHeader workspaceId={workspaceId} />
        </Suspense>
      </HydrateClient>
      <WorkflowsContainer workspaceId={workspaceId}>
        <HydrateClient>
          <ErrorBoundary fallback={<WorkflowsError />}>
            <Suspense fallback={<WorkflowsLoading />}>
              <WorkflowsList workspaceId={workspaceId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </WorkflowsContainer>
    </>
  );
};

export default WorkFlowPage;

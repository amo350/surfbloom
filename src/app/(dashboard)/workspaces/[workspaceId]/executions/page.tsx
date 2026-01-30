import { SearchParams } from "nuqs";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";
import {
  ExecutionsContainer,
  ExecutionsError,
  ExecutionsList,
  ExecutionsLoading,
  ExecutionsPageHeader,
} from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { HydrateClient } from "@/trpc/server";

type Props = {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

const ExecutionsPage = async ({ params, searchParams }: Props) => {
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

  const queryParams = await executionsParamsLoader(searchParams);
  prefetchExecutions({ ...queryParams, workspaceId });

  return (
    <>
      <HydrateClient>
        <Suspense fallback={null}>
          <ExecutionsPageHeader />
        </Suspense>
      </HydrateClient>
      <ExecutionsContainer workspaceId={workspaceId}>
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionsList workspaceId={workspaceId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </ExecutionsContainer>
    </>
  );
};

export default ExecutionsPage;

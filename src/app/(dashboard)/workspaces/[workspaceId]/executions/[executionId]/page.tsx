import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { ExecutionView } from "@/features/executions/components/execution";
import {
  ExecutionsError,
  ExecutionsLoading,
} from "@/features/executions/components/executions";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    workspaceId: string;
    executionId: string;
  }>;
};

const ExecutionId = async ({ params }: PageProps) => {
  const session = await requireAuth();
  const { workspaceId, executionId } = await params;

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

  prefetchExecution(executionId);

  return (
    <>
      <AppHeader>
        <AppHeaderTitle title="Execution Details" />
      </AppHeader>
      <div className="p-4 md:px-10 md:py-6 flex-1 overflow-auto">
        <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8">
          <HydrateClient>
            <ErrorBoundary fallback={<ExecutionsError />}>
              <Suspense fallback={<ExecutionsLoading />}>
                <ExecutionView executionId={executionId} />
              </Suspense>
            </ErrorBoundary>
          </HydrateClient>
        </div>
      </div>
    </>
  );
};

export default ExecutionId;

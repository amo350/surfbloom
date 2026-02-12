import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import EditorHeader from "@/features/editor/components/EditorHeader";
import {
  Editor,
  EditorError,
  EditorLoading,
} from "@/features/editor/components/editor";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { HydrateClient } from "@/trpc/server";

type PageProps = {
  params: Promise<{
    workspaceId: string;
    workflowId: string;
  }>;
};

const WorkflowId = async ({ params }: PageProps) => {
  const session = await requireAuth();
  const { workflowId, workspaceId } = await params;

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

  prefetchWorkflow(workflowId, workspaceId);
  return (
    <HydrateClient>
      <div className="flex flex-col h-full">
        <ErrorBoundary fallback={<EditorError />}>
          <Suspense fallback={<EditorLoading />}>
            <EditorHeader workflowId={workflowId} workspaceId={workspaceId} />
            <div className="flex-1 relative">
              <Editor workflowId={workflowId} workspaceId={workspaceId} />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
};

export default WorkflowId;

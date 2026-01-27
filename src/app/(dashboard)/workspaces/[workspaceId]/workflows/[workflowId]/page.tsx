import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
  Editor,
  EditorError,
  EditorLoading,
} from "@/features/editor/components/editor";
import EditorHeader from "@/features/editor/components/EditorHeader";

type PageProps = {
  params: Promise<{
    workspaceId: string;
    workflowId: string;
  }>;
};

const WorkflowId = async ({ params }: PageProps) => {
  await requireAuth();
  const { workflowId, workspaceId } = await params;

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

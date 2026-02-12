"use client";

import { formatDistanceToNow } from "date-fns";
import { PlusIcon, WorkflowIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderTitle,
} from "@/components/AppHeader";
import {
  EmptyView,
  EntityContainer,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/EntityComponents";
import { Button } from "@/components/ui/button";
import type { Workflow } from "@/generated/prisma/client";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useWorkflowsParams } from "../hooks/use-workflows-params";

type WorkspaceProps = {
  workspaceId: string;
};

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  );
};

export const WorkflowsList = ({ workspaceId }: WorkspaceProps) => {
  const workflows = useSuspenseWorkflows(workspaceId);

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflows) => workflows.id}
      renderItem={(workflow) => (
        <WorkflowItem data={workflow} workspaceId={workspaceId} />
      )}
      emptyView={<WorkflowsEmpty workspaceId={workspaceId} />}
    />
  );
};

export const WorkflowsPageHeader = ({ workspaceId }: WorkspaceProps) => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  const handleCreate = () => {
    createWorkflow.mutate(
      { workspaceId },
      {
        onSuccess: (data) => {
          router.push(`/workspaces/${workspaceId}/workflows/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
      },
    );
  };

  return (
    <>
      {modal}
      <AppHeader>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={createWorkflow.isPending}
        >
          <PlusIcon className="size-4" />
          New Workflow
        </Button>
        <div className="ml-auto">
          <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search workflows"
          />
        </div>
      </AppHeader>
    </>
  );
};

export const WorkflowsPagination = ({ workspaceId }: WorkspaceProps) => {
  const workflows = useSuspenseWorkflows(workspaceId);
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const WorkflowsContainer = ({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId: string;
}) => {
  return (
    <EntityContainer
      pagination={<WorkflowsPagination workspaceId={workspaceId} />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..." />;
};
export const WorkflowsError = () => {
  return <ErrorView message="Error Loading workflows..." />;
};

export const WorkflowsEmpty = ({ workspaceId }: WorkspaceProps) => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(
      { workspaceId },
      {
        onError: (error) => {
          handleError(error);
        },
        onSuccess: (data) => {
          router.push(`/workspaces/${workspaceId}/workflows/${data.id}`);
        },
      },
    );
  };

  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="You have yet to create any workflows. Get started by creating your fist workflow"
      />
    </>
  );
};

export const WorkflowItem = ({
  data,
  workspaceId,
}: {
  data: Workflow;
  workspaceId: string;
}) => {
  const removeWorkflow = useRemoveWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id, workspaceId });
  };
  return (
    <EntityItem
      href={`/workspaces/${workspaceId}/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
};

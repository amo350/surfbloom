"use client";

import {
  AppHeader,
  AppHeaderTitle,
} from "@/components/AppHeader";
import {
  EmptyView,
  EntityContainer,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/EntityComponents";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import type { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

type WorkspaceProps = {
  workspaceId: string;
};

export const ExecutionsList = ({ workspaceId }: WorkspaceProps) => {
  const executions = useSuspenseExecutions(workspaceId);

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => (
        <ExecutionItem data={execution} />
      )}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsPageHeader = () => {
  return (
    <AppHeader>
      <AppHeaderTitle
        title="Executions"
        description="View your workflow execution history"
      />
    </AppHeader>
  );
};

export const ExecutionsPagination = ({ workspaceId }: WorkspaceProps) => {
  const executions = useSuspenseExecutions(workspaceId);
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId: string;
}) => {
  return (
    <EntityContainer pagination={<ExecutionsPagination workspaceId={workspaceId} />}>
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
  return <EmptyView message="You done have any workflows to show" />;
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string;
      name: string;
      workspaceId: string;
    };
  };
}) => {
  const duration = data.completeAt
    ? Math.round(
        (new Date(data.completeAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000,
      )
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}
      {duration !== null && <> &bull; Took {duration}s </>}
    </>
  );
  return (
    <EntityItem
      href={`/workspaces/${data.workflow.workspaceId}/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};

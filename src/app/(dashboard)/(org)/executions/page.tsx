import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import {
  ExecutionsContainer,
  ExecutionsError,
  ExecutionsList,
  ExecutionsLoading,
  ExecutionsPageHeader,
} from "@/features/executions/components/executions";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Executions = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await executionsParamsLoader(searchParams);
  prefetchExecutions(params);
  return (
    <>
      <ExecutionsPageHeader />
      <ExecutionsContainer>
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionsList />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </ExecutionsContainer>
    </>
  );
};

export default Executions;

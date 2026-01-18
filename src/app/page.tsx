"use client";

import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import LogoutButton from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HomePage = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const queryCleint = useQueryClient();

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job Q");
      },
    })
  );

  const testDis = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("Ai Working");
    }}))

  return (
    <>
      protected server component
      {JSON.stringify(data, null, 2)}
      <Button disabled={testDis.isPending} onClick={() => testDis.mutate()}>
        Test Ai
      </Button>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <LogoutButton />
    </>
  );
};

export default HomePage;

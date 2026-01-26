"use client";

import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();

  const testAI = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: () => {
        toast.success("success");
      },
      onError: ({ message }) => {
        toast.error(message);
      },
    }),
  );

  return (
    <>
      <AppHeader>
        <AppHeaderTitle title="Subscription" description="Manage your subscription" />
      </AppHeader>
      <div className="p-6">
        <Button onClick={() => testAI.mutate()}>Click to test subscription</Button>
      </div>
    </>
  );
};

export default Page;

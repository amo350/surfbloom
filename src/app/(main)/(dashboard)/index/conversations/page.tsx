import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ConversationsView } from "@/features/chatbot/components/conversations/ConversationsView";
import { Loader2 } from "lucide-react";

const ConversationsPage = async () => {
  await requireAuth();

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ConversationsView />
      </Suspense>
    </HydrateClient>
  );
};

export default ConversationsPage;

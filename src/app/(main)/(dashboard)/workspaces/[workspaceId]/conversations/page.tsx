import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ConversationsView } from "@/features/chatbot/components/conversations/ConversationsView";
import { Loader2 } from "lucide-react";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const WorkspaceConversationsPage = async ({ params }: Props) => {
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

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ConversationsView workspaceId={workspaceId} />
      </Suspense>
    </HydrateClient>
  );
};

export default WorkspaceConversationsPage;

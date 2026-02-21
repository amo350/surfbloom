import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/features/campaigns/lib/unsubscribe";
import { UnsubscribeClient } from "./unsubscribe-client";

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const contactId = verifyUnsubscribeToken(token);

  if (!contactId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-sm mx-auto text-center p-8">
          <p className="text-lg font-semibold">Invalid Link</p>
          <p className="text-sm text-muted-foreground mt-2">
            This unsubscribe link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const contact = await prisma.chatContact.findUnique({
    where: { id: contactId },
    select: {
      id: true,
      optedOut: true,
      workspace: { select: { name: true } },
    },
  });

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-sm mx-auto text-center p-8">
          <p className="text-lg font-semibold">Not Found</p>
          <p className="text-sm text-muted-foreground mt-2">
            This contact could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <UnsubscribeClient
      token={token}
      businessName={contact.workspace.name}
      alreadyOptedOut={contact.optedOut}
    />
  );
}

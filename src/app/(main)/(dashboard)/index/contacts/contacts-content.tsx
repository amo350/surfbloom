"use client";

import { useQuery } from "@tanstack/react-query";
import { ContactsList } from "@/features/contacts/components/ContactList";
import { useTRPC } from "@/trpc/client";

export function ContactsContent({ workspaceId }: { workspaceId?: string }) {
  const trpc = useTRPC();
  const { data: workspaces } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );

  return (
    <div className="h-full flex flex-col">
      <ContactsList
        workspaceId={workspaceId}
        workspaces={workspaces?.items?.map((ws: any) => ({
          id: ws.id,
          name: ws.name,
        }))}
      />
    </div>
  );
}

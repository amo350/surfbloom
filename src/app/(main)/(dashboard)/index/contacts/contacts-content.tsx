"use client";

import { useQuery } from "@tanstack/react-query";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { ContactsList } from "@/features/contacts/components/ContactList";
import { useTRPC } from "@/trpc/client";

export function ContactsContent({ workspaceId }: { workspaceId?: string }) {
  const trpc = useTRPC();
  const { data: workspaces } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title="Contacts" />
      </AppHeader>
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

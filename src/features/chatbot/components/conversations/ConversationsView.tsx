// src/features/chatbot/components/conversations/ConversationsView.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ContactPanel } from "@/features/contacts/components/ContactPanel";
import { CreateContactDialogControlled } from "@/features/contacts/components/CreateContactDialog";
import { PromoteContactDialog } from "@/features/contacts/components/PromoteContactDialog";
import { useTRPC } from "@/trpc/client";
import { useRoom } from "../../hooks/use-chatbot";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationMessenger } from "./ConversationMessenger";
import { ConversationsFilterSidebar } from "./ConversationsFilterSidebar";
import { ConversationsSidebar } from "./ConversationsSidebar";
import { FeedbackViewer } from "./FeedbackViewer";
import { SmsMessenger } from "./SmsMessenger";

export function ConversationsView({ workspaceId }: { workspaceId?: string }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "mine" | "unassigned">("all");
  const [channel, setChannel] = useState<
    "all" | "webchat" | "sms" | "feedback"
  >("all");
  const [stage, setStage] = useState<string | undefined>(undefined);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [contactPanelId, setContactPanelId] = useState<string | null>(null);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [promoteContact, setPromoteContact] = useState<{
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null>(null);
  const trpc = useTRPC();
  const { data: workspacesData } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );
  const { data: room } = useRoom(selectedRoomId);

  // Auto-update contact panel when switching conversations
  useEffect(() => {
    if (contactPanelId) {
      setContactPanelId(room?.contact?.id ?? null);
    }
  }, [contactPanelId, room?.contact?.id]);

  const renderMessenger = () => {
    if (!selectedRoomId || !room) return null;
    switch (room.channel) {
      case "sms":
        return (
          <SmsMessenger
            roomId={selectedRoomId}
            contactPhone={room.contact?.phone || "Unknown"}
          />
        );
      case "feedback":
        return (
          <FeedbackViewer
            roomId={selectedRoomId}
            contactEmail={room.contact?.email}
            contactPhone={room.contact?.phone}
          />
        );
      default:
        return <ConversationMessenger roomId={selectedRoomId} />;
    }
  };

  return (
    <div className="flex h-full">
      <ConversationsFilterSidebar
        workspaceId={workspaceId}
        view={view}
        onViewChange={setView}
        stage={stage}
        onStageChange={setStage}
        categoryIds={categoryIds}
        onCategoryChange={setCategoryIds}
        channel={channel}
        onChannelChange={setChannel}
      />
      <ConversationsSidebar
        workspaceId={workspaceId}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        view={view}
        channel={channel}
        stage={stage}
        categoryIds={categoryIds}
      />
      {/* Right: Header + Messenger + optional Contact Panel */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col min-w-0">
          {selectedRoomId && room ? (
            <>
              <ConversationHeader
                room={room}
                onContactClick={(contactId) =>
                  setContactPanelId(
                    contactPanelId === contactId ? null : contactId,
                  )
                }
                onUnknownContactClick={() => {
                  if (room?.contact?.id) {
                    setPromoteContact({
                      id: room.contact.id,
                      firstName: room.contact.firstName,
                      lastName: room.contact.lastName,
                      email: room.contact.email,
                      phone: room.contact.phone,
                    });
                  } else {
                    setShowCreateContact(true);
                  }
                }}
              />
              <div className="flex-1 min-h-0">{renderMessenger()}</div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

        {/* Contact panel — slides in from right */}
        {contactPanelId && (
          <ContactPanel
            contactId={contactPanelId}
            onClose={() => setContactPanelId(null)}
          />
        )}
      </div>

      <CreateContactDialogControlled
        open={showCreateContact}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateContact(false);
          }
        }}
        workspaceId={room?.workspaceId ?? undefined}
        workspaces={workspacesData?.items}
      />
      <PromoteContactDialog
        open={!!promoteContact}
        onOpenChange={(open) => {
          if (!open) setPromoteContact(null);
        }}
        contact={promoteContact}
      />
    </div>
  );
}

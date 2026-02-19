// src/features/chatbot/components/conversations/ConversationsView.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ContactPanel } from "@/features/contacts/components/ContactPanel";
import { CreateContactDialogControlled } from "@/features/contacts/components/CreateContactDialog";
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
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [contactPanelId, setContactPanelId] = useState<string | null>(null);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const trpc = useTRPC();
  const { data: workspacesData } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );
  const { data: room } = useRoom(selectedRoomId);

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
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
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
        categoryId={categoryId}
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
                onUnknownContactClick={() => setShowCreateContact(true)}
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
        onOpenChange={setShowCreateContact}
        workspaceId={room?.workspaceId ?? undefined}
        workspaces={workspacesData?.items}
      />
    </div>
  );
}

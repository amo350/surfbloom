// src/features/chatbot/components/conversations/ConversationsView.tsx
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
  const [promoteContactId, setPromoteContactId] = useState<string | null>(null);
  const [promoteInitialValues, setPromoteInitialValues] = useState<{
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    stage?: string | null;
    notes?: string | null;
  } | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: workspacesData } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );
  const { data: room } = useRoom(selectedRoomId);

  // Auto-update contact panel when switching conversations
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run when room contact changes
  useEffect(() => {
    if (contactPanelId) {
      setContactPanelId(room?.contact?.id ?? null);
    }
  }, [room?.contact?.id]);

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
                onUnknownContactClick={() => {
                  if (room?.contact?.id) {
                    setPromoteContactId(room.contact.id);
                    setPromoteInitialValues({
                      firstName: room.contact.firstName,
                      lastName: room.contact.lastName,
                      email: room.contact.email,
                      phone: room.contact.phone,
                      stage: room.contact.stage,
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
        open={showCreateContact || !!promoteContactId}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateContact(false);
            setPromoteContactId(null);
            setPromoteInitialValues(null);
          }
        }}
        workspaceId={room?.workspaceId ?? undefined}
        workspaces={workspacesData?.items}
        promoteContactId={promoteContactId}
        promoteInitialValues={promoteInitialValues ?? undefined}
        onPromoteSuccess={() => {
          if (selectedRoomId) {
            queryClient.invalidateQueries({
              queryKey: trpc.chatbot.getRoom.queryKey({ roomId: selectedRoomId }),
            });
          }
        }}
      />
    </div>
  );
}

// src/features/chatbot/components/conversations/ConversationsView.tsx
"use client";

import { useState } from "react";
import { useRoom } from "../../hooks/use-chatbot";
import { ConversationMessenger } from "./ConversationMessenger";
import { ConversationsSidebar } from "./ConversationsSidebar";
import { FeedbackViewer } from "./FeedbackViewer";
import { SmsMessenger } from "./SmsMessenger";

export function ConversationsView({ workspaceId }: { workspaceId?: string }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { data: room } = useRoom(selectedRoomId);

  const renderMessenger = () => {
    if (!selectedRoomId || !room) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          Select a conversation to start messaging.
        </div>
      );
    }

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
      <ConversationsSidebar
        workspaceId={workspaceId}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
      />
      <div className="flex-1">{renderMessenger()}</div>
    </div>
  );
}

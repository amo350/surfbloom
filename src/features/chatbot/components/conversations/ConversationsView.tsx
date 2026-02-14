"use client";

import { useState } from "react";
import { ConversationsSidebar } from "@/features/chatbot/components/conversations/ConversationsSidebar";
import { ConversationMessenger } from "@/features/chatbot/components/conversations/ConversationMessenger";

type Props = {
  workspaceId?: string;
};

export function ConversationsView({ workspaceId }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar — room list + filters */}
      <ConversationsSidebar
        workspaceId={workspaceId}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
      />

      {/* Messenger — messages + input */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoomId ? (
          <ConversationMessenger roomId={selectedRoomId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

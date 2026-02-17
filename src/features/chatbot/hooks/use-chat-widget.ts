"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────

const chatMessageSchema = z.object({
  content: z.string().optional(),
  image: z.any().optional(),
});

type ChatMessageForm = z.infer<typeof chatMessageSchema>;

// ─── Types ────────────────────────────────────────────────

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  link?: string;
  createdAt?: Date;
};

type BotConfig = {
  domainId: string;
  domainName: string;
  chatBot: {
    id: string;
    icon: string | null;
    welcomeMessage: string | null;
    headerText: string | null;
    themeColor: string | null;
    bubbleTransparent?: boolean;
    helpdesk: boolean;
  } | null;
  helpDeskItems: { id: string; question: string; answer: string }[];
  filterQuestions: { id: string; question: string }[];
  locations?: { id: string; name: string; imageUrl: string | null }[];
};

// ─── Helpers ──────────────────────────────────────────────

function postToParent(message: string) {
  if (window.parent !== window) {
    window.parent.postMessage(message, document.referrer || "*");
  }
}

// ─── Hook ─────────────────────────────────────────────────

export const useChatWidget = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatMessageForm>({
    resolver: zodResolver(chatMessageSchema),
  });

  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const [botConfig, setBotConfig] = useState<BotConfig | undefined>();
  const [botOpened, setBotOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [domainId, setDomainId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationPromptShown, setLocationPromptShown] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [emailAsks, setEmailAsks] = useState(0);
  const [realTime, setRealTime] = useState<
    { chatroom: string; mode: boolean } | undefined
  >(undefined);

  // Toggle open/close
  const onToggleBot = () => setBotOpened((prev) => !prev);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when chats change
  useEffect(() => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  }, [chats]);

  // Resize iframe when opened/closed (matches Corinna: 550x800 open, 80x80 closed)
  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 450 : 80,
        height: botOpened ? 580 : 80,
      }),
    );
  }, [botOpened]);

  // Listen for domain ID from parent (plain string via postMessage — Corinna pattern)
  // biome-ignore lint/correctness/useExhaustiveDependencies: register listener once; loadBotConfig is stable
  useEffect(() => {
    let limitRequest = 0;

    const handler = (e: MessageEvent) => {
      const botId = e.data;
      if (limitRequest < 1 && typeof botId === "string") {
        // Ignore our own JSON messages (dimensions)
        try {
          JSON.parse(botId);
          return;
        } catch {
          // Not JSON — it's the domain ID
          loadBotConfig(botId);
          limitRequest++;
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Load bot config from API (mirrors onGetCurrentChatBot)
  const loadBotConfig = async (id: string) => {
    setDomainId(id);
    try {
      const res = await fetch(
        `/api/chatbot/config?domainId=${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw new Error("Failed to load config");

      const config: BotConfig = await res.json();
      setBotConfig(config);

      if (config.chatBot?.welcomeMessage) {
        setChats([
          {
            role: "assistant",
            content: config.chatBot.welcomeMessage,
          },
        ]);
      }

      // Auto-assign if only 1 location
      if (config.locations?.length === 1) {
        setSelectedLocation(config.locations[0].id);
        setLocationPromptShown(true);
      }

      setLoading(false);
    } catch (err) {
      console.error("[SurfBloom] Failed to load chatbot config:", err);
      setLoading(false);
    }
  };

  // Send message (mirrors onStartChatting / onAiChatBotAssistant)
  const onSendMessage = handleSubmit(async (values) => {
    if (!domainId) return;

    const content = values.content?.trim();

    // TODO: Phase later — image upload via Uploadthing
    // if (values.image?.[0]) {
    //   const uploaded = await startUpload([values.image[0]]);
    //   if (uploaded?.[0]?.url) { ... }
    // }

    if (!content) return;

    reset();

    // Add user message to chat (when not in real-time mode)
    if (!realTime?.mode) {
      setChats((prev) => [
        ...prev,
        { role: "user", content, createdAt: new Date() },
      ]);
    }

    setIsAiTyping(true);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId,
          message: content,
          chatHistory: chats.map((c) => ({ role: c.role, content: c.content })),
          selectedLocation,
          contactEmail,
          emailAsks,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setIsAiTyping(false);

      if (data.contactEmail) {
        setContactEmail(data.contactEmail);
      }

      if (data.live) {
        setRealTime({
          chatroom: data.chatRoom,
          mode: true,
        });
      } else if (data.response) {
        setChats((prev) => [
          ...prev,
          {
            role: data.response.role,
            content: data.response.content,
            link: data.response.link,
            createdAt: new Date(),
          },
        ]);

        if (data.emailAsked) {
          setEmailAsks((prev) => prev + 1);
        }

        // Show location selector after email capture
        if (data.showLocationSelector && !locationPromptShown) {
          const locations = botConfig?.locations || [];
          if (locations.length === 1) {
            setSelectedLocation(locations[0].id);
            setLocationPromptShown(true);
          } else if (locations.length > 1) {
            setShowLocationPicker(true);
          } else {
            setLocationPromptShown(true);
          }
        }
      }
    } catch (err) {
      console.error("[SurfBloom] Failed to send message:", err);
      setIsAiTyping(false);
      setChats((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          createdAt: new Date(),
        },
      ]);
    }
  });

  const onSelectLocation = (locationId: string) => {
    setSelectedLocation(locationId);
    setLocationPromptShown(true);
    setShowLocationPicker(false);

    const location = botConfig?.locations?.find((l) => l.id === locationId);
    const locationName = location?.name || "that location";

    setChats((prev) => [
      ...prev,
      { role: "user", content: locationName, createdAt: new Date() },
      {
        role: "assistant",
        content: `Great, I'll be helping you with our ${locationName} location. What can I do for you?`,
        createdAt: new Date(),
      },
    ]);
  };

  return {
    botOpened,
    onToggleBot,
    onSendMessage,
    chats,
    setChats,
    register,
    isAiTyping,
    messageWindowRef,
    botConfig,
    loading,
    errors,
    realTime,
    selectedLocation,
    setSelectedLocation,
    locationPromptShown,
    setLocationPromptShown,
    onSelectLocation,
    showLocationPicker,
  };
};

"use client";

import { forwardRef, useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ChatMessage } from "../../hooks/use-chat-widget";
import { MessageBubble } from "../shared/MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

type HelpDeskItem = {
  id: string;
  question: string;
  answer: string;
};

type ChatWindowProps = {
  onClose: () => void;
  domainName: string;
  botIcon?: string | null;
  headerText?: string | null;
  themeColor?: string | null;
  chats: ChatMessage[];
  helpDeskItems: HelpDeskItem[];
  isAiTyping: boolean;
  register: UseFormRegister<any>;
  onSendMessage: (e: React.FormEvent) => void;
  errors: FieldErrors;
  realtimeMode?: { chatroom: string; mode: boolean };
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

function toRgba(color: string, alpha: number): string {
  const hex = color.trim();
  const shortMatch = /^#([0-9a-fA-F]{3})$/.exec(hex);
  const longMatch = /^#([0-9a-fA-F]{6})$/.exec(hex);

  if (shortMatch) {
    const [r, g, b] = shortMatch[1]
      .split("")
      .map((c) => Number.parseInt(c + c, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (longMatch) {
    const value = longMatch[1];
    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return color;
}

export const ChatWindow = forwardRef<HTMLDivElement, ChatWindowProps>(
  (
    {
      onClose,
      domainName,
      botIcon,
      headerText,
      themeColor,
      chats,
      helpDeskItems,
      isAiTyping,
      register,
      onSendMessage,
      errors,
      realtimeMode,
      setChats,
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState<"chat" | "helpdesk">("chat");
    const accentColor = themeColor || "#14b8a6";
    const accentSoft = toRgba(accentColor, 0.14);

    return (
      <div className="relative flex h-[520px] w-[390px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div
          className="group/header flex shrink-0 items-center gap-3 border-b border-black/10 px-4 py-3.5 text-white"
          style={{ backgroundColor: accentColor }}
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/35">
            {botIcon ? (
              <img
                src={botIcon}
                alt="Bot"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/30 to-white/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 47 47"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.8297 20.6851H30.3231"
                    stroke="white"
                    strokeWidth="4.45582"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.6488 35.9713L30.2267 41.6771C31.4989 42.5253 33.2145 41.6193 33.2145 40.0772V35.9713C38.9974 35.9713 42.8526 32.1161 42.8526 26.3332V14.7675C42.8526 8.98464 38.9974 5.12939 33.2145 5.12939H13.9383C8.15541 5.12939 4.30017 8.98464 4.30017 14.7675V26.3332C4.30017 32.1161 8.15541 35.9713 13.9383 35.9713H21.6488Z"
                    stroke="white"
                    strokeWidth="4.45582"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold leading-tight text-white">
              {headerText || "Sales Rep"}
            </h3>
            <p className="mt-0.5 truncate text-xs text-white/85">
              {domainName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 opacity-0 transition-all hover:bg-white/25 group-hover/header:opacity-100"
            aria-label="Close chat"
          >
            <svg
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-white">
          {/* Tabs */}
          {helpDeskItems.length > 0 && (
            <div className="shrink-0 px-3 pb-1.5 pt-2">
              <div className="grid grid-cols-2 rounded-xl bg-black/[0.05] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`rounded-[10px] py-2 text-xs font-semibold transition-colors ${
                    activeTab === "chat"
                      ? "bg-white shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
                      : "text-muted-foreground hover:bg-white/60"
                  }`}
                  style={
                    activeTab === "chat" ? { color: accentColor } : undefined
                  }
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("helpdesk")}
                  className={`rounded-[10px] py-2 text-xs font-semibold transition-colors ${
                    activeTab === "helpdesk"
                      ? "bg-white shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
                      : "text-muted-foreground hover:bg-white/60"
                  }`}
                  style={
                    activeTab === "helpdesk"
                      ? { color: accentColor }
                      : undefined
                  }
                >
                  Help Desk
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === "chat" ? (
            <>
              <div
                ref={ref}
                className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[#f7f9fb] px-3 py-3"
              >
{chats.map((chat, i) => (
                <MessageBubble
                  key={chat.createdAt ? `${chat.role}-${chat.createdAt}` : `msg-${i}`}
                    role={chat.role}
                    content={chat.content}
                    link={chat.link}
                    createdAt={chat.createdAt}
                    botIcon={botIcon}
                  />
                ))}
                {isAiTyping && <TypingIndicator />}
              </div>

              <form
                onSubmit={onSendMessage}
                className="shrink-0 border-t border-black/10 bg-white px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    {...register("content")}
                    type="text"
                    placeholder="Type your message..."
                    autoComplete="off"
                    className="h-10 flex-1 rounded-xl border border-black/10 bg-[#f2f4f6] px-3.5 text-sm outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-transform hover:scale-[1.03]"
                    style={{ backgroundColor: accentColor }}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <div className="hidden">
                  <input
                    {...register("image")}
                    type="file"
                    id="bot-image"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7f9fb] px-3 py-3">
              <div>
                <h3 className="text-sm font-bold">Help Desk</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Browse from a list of questions people usually ask.
                </p>
              </div>
              <div className="h-px bg-border/40" />
              {helpDeskItems.map((item) => (
                <HelpDeskAccordion key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="flex shrink-0 justify-center border-t border-black/5 bg-white py-2">
            <p className="text-[10px] text-gray-400">Powered by SurfBloom</p>
          </div>
        </div>
      </div>
    );
  },
);

ChatWindow.displayName = "ChatWindow";

function HelpDeskAccordion({
  item,
}: {
  item: { id: string; question: string; answer: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-3.5 py-3 text-left text-sm font-medium transition-colors hover:bg-black/[0.03]"
      >
        <span className="flex-1 pr-2">{item.question}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="border-t border-black/10 px-3.5 pb-3 pt-2.5 text-xs leading-relaxed text-muted-foreground">
          {item.answer}
        </div>
      )}
    </div>
  );
}

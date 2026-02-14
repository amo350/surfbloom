"use client";

import { formatDistanceToNow } from "date-fns";

type Props = {
  role: "USER" | "ASSISTANT" | "user" | "assistant";
  content: string;
  link?: string;
  createdAt?: Date | string;
  botIcon?: string | null;
};

function isImageUrl(content: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(content.trim());
}

export function MessageBubble({
  role,
  content,
  link,
  createdAt,
  botIcon,
}: Props) {
  const isUser = role === "USER" || role === "user";
  const timestamp = createdAt ? new Date(createdAt) : new Date();
  const isImage = isImageUrl(content);

  return (
    <div
      className={`flex items-end gap-2 px-3 ${
        isUser ? "self-end flex-row-reverse" : "self-start flex-row"
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="h-7 w-7 rounded-full shrink-0 overflow-hidden">
          {botIcon ? (
            <img
              src={botIcon}
              alt="Bot"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <svg
                width="14"
                height="14"
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
      )}

      {isUser && (
        <div className="h-7 w-7 rounded-full shrink-0 bg-muted flex items-center justify-center">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}

      {/* Content */}
      <div
        className={`max-w-[75%] flex flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span className="text-[10px] text-muted-foreground/50">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>

        {isImage ? (
          <div className="rounded-xl overflow-hidden w-48 aspect-square">
            <img
              src={content}
              alt="Shared image"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "rounded-br-sm bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                : "rounded-bl-sm bg-muted/60"
            }`}
          >
            {content.replace("(complete)", " ")}
            {link && (
              <>
                {" "}
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold"
                >
                  Your Link
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0">
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
      <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Ban } from "lucide-react";

export function UnsubscribeClient({
  token,
  businessName,
  alreadyOptedOut,
}: {
  token: string;
  businessName: string;
  alreadyOptedOut: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(
    alreadyOptedOut ? "done" : "idle",
  );

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-sm mx-auto text-center p-8">
        {status === "done" ? (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold">
              {alreadyOptedOut ? "Already Unsubscribed" : "Unsubscribed"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You will no longer receive messages from{" "}
              <span className="font-medium">{businessName}</span>.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Ban className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-lg font-semibold">Unsubscribe</p>
            <p className="text-sm text-muted-foreground mt-2">
              Stop receiving messages from{" "}
              <span className="font-medium">{businessName}</span>?
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={status === "loading"}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {status === "loading" ? "Processing..." : "Unsubscribe"}
            </button>
            <p className="text-[11px] text-muted-foreground mt-4">
              You can also reply STOP to any message to unsubscribe.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

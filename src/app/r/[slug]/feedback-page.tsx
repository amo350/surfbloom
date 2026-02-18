// src/app/r/[slug]/feedback-page.tsx
"use client";

import { useState } from "react";
import { ThumbsUp, Send, Loader2, ArrowLeft, X } from "lucide-react";
import Image from "next/image";

type Workspace = {
  id: string;
  name: string;
  imageUrl: string | null;
  googleReviewUrl: string | null;
  feedbackHeading: string | null;
  feedbackMessage: string | null;
  phone: string | null;
};

export function FeedbackPage({
  workspace,
  slug,
}: {
  workspace: Workspace;
  slug: string;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleReviewClick = async () => {
    await fetch("/api/feedback/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id, path: "review" }),
    }).catch(() => {});

    const reviewUrl =
      workspace.googleReviewUrl || "https://google.com";
    if (reviewUrl) {
      window.location.href = reviewUrl;
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);

    try {
      await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          slug,
          name: name.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          message: message.trim(),
        }),
      });
    } catch {
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-dvh relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Wave shapes */}
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.06]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: "40%" }}
        >
          <path
            fill="#0369a1"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,133.3C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.04]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: "30%" }}
        >
          <path
            fill="#0369a1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8 safe-area-inset">
        <div className="w-full max-w-sm">
          {/* ─── Default View ──────────────────────────── */}
          {!showFeedback && !submitted && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              {/* Business identity */}
              <div className="text-center mb-8">
                {workspace.imageUrl ? (
                  <div className="mx-auto h-20 w-20 rounded-2xl overflow-hidden mb-4 shadow-lg ring-4 ring-white/40">
                    <Image
                      src={workspace.imageUrl}
                      alt={workspace.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mx-auto h-20 w-20 rounded-2xl mb-4 shadow-lg ring-4 ring-white/40 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {workspace.name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <h1
                  className="text-2xl font-bold text-white drop-shadow-sm"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {workspace.name}
                </h1>
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h2
                  className="text-xl font-semibold text-white/95"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {workspace.feedbackHeading || "How was your experience?"}
                </h2>
                {workspace.feedbackMessage && (
                  <p className="text-sm text-white/70 mt-2 leading-relaxed max-w-[280px] mx-auto">
                    {workspace.feedbackMessage}
                  </p>
                )}
              </div>

              {/* ── Big Review CTA (fallback URL for testing when none set) ────────────────────── */}
              <button
                  type="button"
                  onClick={handleReviewClick}
                  className="w-full group active:scale-[0.98] transition-all duration-200"
                >
                  <div
                    className="rounded-2xl p-6 shadow-xl border border-white/20"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Thumbs up circle */}
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className="h-16 w-16 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                        }}
                      >
                        <ThumbsUp
                          className="h-7 w-7 text-white"
                          strokeWidth={2.5}
                        />
                      </div>

                      <div className="text-center">
                        <p
                          className="text-lg font-semibold text-slate-800"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          Leave us a review
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          We'd love to hear about your experience
                        </p>
                      </div>

                      {/* Google stars hint */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300"
                            style={{
                              transitionDelay: `${star * 40}ms`,
                            }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>

              {/* ── Concerns Section ──────────────────── */}
              <div className="mt-8 text-center">
                <p className="text-sm text-white/60">
                  Had a concern?{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/feedback/track", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          workspaceId: workspace.id,
                          path: "feedback",
                        }),
                      }).catch(() => {});
                      setShowFeedback(true);
                    }}
                    className="text-white/90 font-medium underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-colors"
                  >
                    Reach out to us directly
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ─── Feedback Form ─────────────────────────── */}
          {showFeedback && !submitted && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
              {/* Back / close */}
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="mb-4 flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div
                className="rounded-2xl p-6 shadow-xl border border-white/20"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="mb-5">
                  <h2
                    className="text-lg font-semibold text-slate-800"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    We'd like to make it right
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Share your experience and our team will follow up with you
                    personally.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all"
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleFeedbackSubmit}
                    disabled={submitting || !message.trim()}
                    className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                      boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Thank You View ────────────────────────── */}
          {submitted && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
              <div
                className="rounded-2xl p-8 shadow-xl border border-white/20 text-center w-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Animated checkmark */}
                <div
                  className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-5"
                  style={{
                    background:
                      "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2
                  className="text-xl font-semibold text-slate-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Thank you
                </h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-[260px] mx-auto">
                  We appreciate you sharing your experience. A member of our
                  team will follow up with you soon.
                </p>

                {workspace.phone && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Need immediate help?
                    </p>
                    <a
                      href={`tel:${workspace.phone}`}
                      className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      {workspace.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <p className="text-[10px] text-white/30 text-center tracking-wide">
            Powered by SurfBloom
          </p>
        </div>
      </div>
    </div>
  );
}

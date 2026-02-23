"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import Image from "next/image";

type SurveyQuestion = {
  id: string;
  order: number;
  type: "nps" | "star" | "multiple_choice" | "free_text" | "yes_no" | string;
  text: string;
  required: boolean;
  options: unknown;
};

type SurveyData = {
  id: string;
  name: string;
  slug: string;
  status: string;
  thankYouMessage: string;
  reviewThreshold: number;
  taskThreshold: number;
  reviewUrl: string | null;
  questions: SurveyQuestion[];
};

type WorkspaceBranding = {
  id: string;
  name: string;
  imageUrl: string | null;
} | null;

type CompletionResult = {
  success: boolean;
  score: number | null;
  npsCategory: string | null;
  reviewRedirect: string | null;
};

export default function PublicSurveyPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const contactId = searchParams.get("c");
  const workspaceId = searchParams.get("w");
  const campaignId = searchParams.get("cam");
  const isPreview = searchParams.get("preview") === "true";

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceBranding>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [surveyError, setSurveyError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completion, setCompletion] = useState<CompletionResult | null>(null);

  const [freeTextDraft, setFreeTextDraft] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      setLoadingSurvey(true);
      setSurveyError(null);

      try {
        const qs = new URLSearchParams();
        if (workspaceId) qs.set("w", workspaceId);
        const res = await fetch(`/api/surveys/${slug}/respond?${qs.toString()}`);
        if (!res.ok) {
          setSurveyError("Survey not found or inactive.");
          setLoadingSurvey(false);
          return;
        }
        const json = await res.json();
        setSurvey(json.survey);
        setWorkspace(json.workspace ?? null);
      } catch (err) {
        console.error("[PublicSurveyPage] Failed to load survey", err);
        setSurveyError("Unable to load survey right now.");
      } finally {
        setLoadingSurvey(false);
      }
    };

    run();
  }, [slug, workspaceId]);

  const question = survey?.questions[currentIndex] ?? null;
  const progress = useMemo(() => {
    if (!survey || survey.questions.length === 0) return 0;
    return ((currentIndex + 1) / survey.questions.length) * 100;
  }, [survey, currentIndex]);

  const isInvalidLink = !isPreview && (!contactId || !workspaceId);

  const saveAnswer = async (payload: {
    questionId: string;
    answerText?: string | null;
    answerNumber?: number | null;
    answerChoice?: string | null;
  }) => {
    if (!survey) return;

    if (isPreview) {
      const lastQuestion = currentIndex >= survey.questions.length - 1;
      if (lastQuestion) {
        setCompletion({
          success: true,
          score: null,
          npsCategory: null,
          reviewRedirect: null,
        });
      } else {
        setCurrentIndex((i) => i + 1);
        setFreeTextDraft("");
      }
      return;
    }

    if (!contactId || !workspaceId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${survey.slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          workspaceId,
          campaignId,
          ...payload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      const data = await res.json();
      if (!enrollmentId && data.enrollmentId) {
        setEnrollmentId(data.enrollmentId);
      }

      const lastQuestion = currentIndex >= survey.questions.length - 1;
      if (lastQuestion) {
        const completeRes = await fetch(`/api/surveys/${survey.slug}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: data.enrollmentId || enrollmentId,
          }),
        });

        if (!completeRes.ok) {
          throw new Error("Completion failed");
        }
        const completionData = (await completeRes.json()) as CompletionResult;
        setCompletion(completionData);
      } else {
        setCurrentIndex((i) => i + 1);
        setFreeTextDraft("");
      }
    } catch (err) {
      console.error("[PublicSurveyPage] Failed to save response", err);
      const detail =
        err instanceof Error && err.message ? ` (${err.message})` : "";
      setSurveyError(`We couldn't save that response. Please try again.${detail}`);
    } finally {
      setSubmitting(false);
      setCompleting(false);
    }
  };

  const completeFreeText = async () => {
    if (!question) return;
    if (!freeTextDraft.trim()) return;
    setCompleting(true);
    await saveAnswer({
      questionId: question.id,
      answerText: freeTextDraft.trim(),
    });
  };

  const completionView = (() => {
    if (!survey || !completion) return null;
    const score = completion.score;

    if (
      score != null &&
      score >= survey.reviewThreshold &&
      (completion.reviewRedirect || survey.reviewUrl)
    ) {
      return {
        title: "We're glad you had a great experience!",
        message: "Would you mind sharing it publicly?",
        ctaLabel: "Leave us a Google Review",
        ctaUrl: completion.reviewRedirect || survey.reviewUrl || undefined,
      };
    }

    if (score != null && score <= survey.taskThreshold) {
      return {
        title: "We're sorry to hear that.",
        message: "Our team will follow up with you.",
      };
    }

    return {
      title: "Thank you!",
      message: survey.thankYouMessage || "Thank you for your feedback!",
    };
  })();

  if (loadingSurvey) {
    return (
      <main
        className="min-h-dvh flex items-center justify-center"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 28%, #7dd3fc 55%, #fef3c7 78%, #fff7ed 100%)",
        }}
      >
        <div className="rounded-2xl border border-white/35 bg-white/80 p-5 shadow-lg backdrop-blur">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-600" />
          <p className="mt-2 text-xs text-slate-600">Loading your survey...</p>
        </div>
      </main>
    );
  }

  if (surveyError) {
    return (
      <main
        className="min-h-dvh flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 28%, #7dd3fc 55%, #fef3c7 78%, #fff7ed 100%)",
        }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/35 bg-white/85 p-5 text-center shadow-lg backdrop-blur">
          <h1 className="text-base font-semibold text-slate-900">
            Aloha, we hit a wave
          </h1>
          <p className="mt-1 text-sm text-slate-600">{surveyError}</p>
        </div>
      </main>
    );
  }

  if (isInvalidLink) {
    return (
      <main
        className="min-h-dvh flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 28%, #7dd3fc 55%, #fef3c7 78%, #fff7ed 100%)",
        }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/35 bg-white/85 p-5 text-center shadow-lg backdrop-blur">
          <h1 className="text-base font-semibold text-slate-900">Invalid link</h1>
          <p className="mt-1 text-sm text-slate-600">
            Missing contact or workspace identifier.
          </p>
        </div>
      </main>
    );
  }

  if (!survey || survey.questions.length === 0) {
    return (
      <main
        className="min-h-dvh flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 28%, #7dd3fc 55%, #fef3c7 78%, #fff7ed 100%)",
        }}
      >
        <div className="w-full max-w-md rounded-2xl border border-white/35 bg-white/85 p-5 text-center shadow-lg backdrop-blur">
          <p className="text-sm text-slate-700">No questions are available.</p>
        </div>
      </main>
    );
  }

  if (completion && completionView) {
    return (
      <main
        className="min-h-dvh relative overflow-hidden flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 28%, #7dd3fc 55%, #fef3c7 78%, #fff7ed 100%)",
        }}
      >
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.08]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: "30%" }}
        >
          <path
            fill="#0369a1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L0,320Z"
          />
        </svg>

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/35 bg-white/88 p-6 text-center shadow-xl backdrop-blur">
          {workspace?.imageUrl ? (
            <Image
              src={workspace.imageUrl}
              alt={workspace.name}
              width={48}
              height={48}
              className="mx-auto h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
              {workspace?.name?.[0]?.toUpperCase() ?? "S"}
            </div>
          )}
          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            {completionView.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{completionView.message}</p>
          {completion.score != null && (
            <p className="mt-2 text-xs text-slate-500">
              Score: {completion.score.toFixed(1)}/10
            </p>
          )}
          {completionView.ctaUrl && (
            <a
              href={completionView.ctaUrl}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-medium text-white shadow-sm"
            >
              {completionView.ctaLabel}
            </a>
          )}
          <p className="mt-5 text-[10px] tracking-wide text-slate-500">
            Powered by SurfBloom
          </p>
        </div>
      </main>
    );
  }

  const options = Array.isArray(question?.options)
    ? (question.options as string[])
    : [];

  return (
    <main
      className="min-h-dvh relative overflow-hidden"
      style={{
        background:
          "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 28%, #7dd3fc 55%, #fef3c7 78%, #fff7ed 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-16 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute top-24 -right-16 h-56 w-56 rounded-full bg-cyan-100/35 blur-2xl" />
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.08]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: "34%" }}
        >
          <path
            fill="#075985"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,133.3C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,320L0,320Z"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
        <div className="rounded-2xl border border-white/35 bg-white/72 p-3 shadow-md backdrop-blur">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full bg-linear-to-r from-cyan-500 to-sky-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-600">
            Question {currentIndex + 1} of {survey.questions.length}
          </p>
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-center">
          <div className="rounded-3xl border border-white/35 bg-white/88 px-4 py-5 shadow-xl backdrop-blur">
            <div className="mb-5 text-center">
            {workspace?.imageUrl ? (
              <Image
                src={workspace.imageUrl}
                alt={workspace.name}
                width={40}
                height={40}
                className="mx-auto h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200/80 text-xs font-semibold text-slate-700">
                {workspace?.name?.[0]?.toUpperCase() ?? "S"}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {workspace?.name ?? "Survey"}
            </p>
            <h1 className="mt-2 text-xl font-semibold leading-tight text-slate-900">
              {question?.text}
            </h1>
          </div>

          <div className="space-y-2.5">
            {question?.type === "nps" && (
              <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      saveAnswer({
                        questionId: question.id,
                        answerNumber: i,
                      })
                    }
                    className="h-11 rounded-xl border border-sky-100 bg-white/95 text-sm font-medium text-slate-700 shadow-sm active:scale-[0.98] disabled:opacity-60"
                  >
                    {i}
                  </button>
                ))}
              </div>
            )}

            {question?.type === "star" && (
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      saveAnswer({
                        questionId: question.id,
                        answerNumber: i,
                      })
                    }
                    className="rounded-xl bg-white/95 p-2.5 shadow-sm active:scale-[0.98] disabled:opacity-60"
                  >
                    <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>
            )}

            {question?.type === "yes_no" && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    saveAnswer({
                      questionId: question.id,
                      answerText: "yes",
                      answerNumber: 10,
                    })
                  }
                  className="h-11 rounded-xl border border-emerald-200 bg-white/95 text-sm font-medium text-slate-800 shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    saveAnswer({
                      questionId: question.id,
                      answerText: "no",
                      answerNumber: 0,
                    })
                  }
                  className="h-11 rounded-xl border border-rose-200 bg-white/95 text-sm font-medium text-slate-800 shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  No
                </button>
              </div>
            )}

            {question?.type === "multiple_choice" && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      saveAnswer({
                        questionId: question.id,
                        answerChoice: opt,
                      })
                    }
                    className="w-full rounded-xl border border-sky-100 bg-white/95 px-4 py-3 text-left text-sm text-slate-800 shadow-sm active:scale-[0.99] disabled:opacity-60"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {question?.type === "free_text" && (
              <div className="space-y-2">
                <textarea
                  value={freeTextDraft}
                  onChange={(e) => setFreeTextDraft(e.target.value)}
                  rows={4}
                  placeholder="Type your answer..."
                  className="w-full rounded-xl border border-sky-100 bg-white/95 px-3 py-2.5 text-sm text-slate-800 outline-none shadow-sm"
                />
                <button
                  type="button"
                  onClick={completeFreeText}
                  disabled={!freeTextDraft.trim() || submitting || completing}
                  className="h-11 w-full rounded-xl bg-sky-700 text-sm font-medium text-white shadow-sm disabled:opacity-60"
                >
                  {submitting || completing ? "Saving..." : "Continue"}
                </button>
              </div>
            )}
          </div>
          </div>
          <p className="pt-4 text-center text-[10px] tracking-wide text-white/80">
            SurfBloom
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import Image from "next/image";
import {
  evaluateDisplayCondition,
  type DisplayCondition,
  type DisplayConditionAnswer,
} from "@/features/surveys/shared/display-conditions";

type SurveyQuestion = {
  id: string;
  order: number;
  type: "nps" | "star" | "multiple_choice" | "free_text" | "yes_no" | string;
  text: string;
  required: boolean;
  options: unknown;
  displayCondition?: DisplayCondition | null;
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

type AnsweredResponse = DisplayConditionAnswer;

function shouldShowQuestion(
  question: SurveyQuestion,
  answeredResponses: Map<string, AnsweredResponse>,
): boolean {
  if (!question.displayCondition) return true;
  const answer = answeredResponses.get(question.displayCondition.questionId);
  return evaluateDisplayCondition(question.displayCondition, answer);
}

function getEligibleQuestionIndexes(
  questions: SurveyQuestion[],
  answeredResponses: Map<string, AnsweredResponse>,
): number[] {
  return questions
    .map((question, index) =>
      shouldShowQuestion(question, answeredResponses) ? index : -1,
    )
    .filter((index) => index >= 0);
}

function getNextEligibleQuestionIndex(
  questions: SurveyQuestion[],
  currentIndex: number,
  answeredResponses: Map<string, AnsweredResponse>,
): number | null {
  for (let i = currentIndex + 1; i < questions.length; i++) {
    if (shouldShowQuestion(questions[i], answeredResponses)) {
      return i;
    }
  }
  return null;
}

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
  const [answeredResponses, setAnsweredResponses] = useState<
    Map<string, AnsweredResponse>
  >(new Map());

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
        setCurrentIndex(0);
        setAnsweredResponses(new Map());
        setCompletion(null);
        setEnrollmentId(null);
      } catch (err) {
        console.error("[PublicSurveyPage] Failed to load survey", err);
        setSurveyError("Unable to load survey right now.");
      } finally {
        setLoadingSurvey(false);
      }
    };

    run();
  }, [slug, workspaceId]);

  useEffect(() => {
    if (!survey || completion) return;
    const currentQuestion = survey.questions[currentIndex];
    if (!currentQuestion || shouldShowQuestion(currentQuestion, answeredResponses)) {
      return;
    }
    const nextEligible = getNextEligibleQuestionIndex(
      survey.questions,
      Math.max(0, currentIndex - 1),
      answeredResponses,
    );
    if (nextEligible != null) {
      setCurrentIndex(nextEligible);
    }
  }, [survey, completion, currentIndex, answeredResponses]);

  const question = survey?.questions[currentIndex] ?? null;
  const eligibleIndexes = useMemo(
    () => (survey ? getEligibleQuestionIndexes(survey.questions, answeredResponses) : []),
    [survey, answeredResponses],
  );
  const eligiblePosition = useMemo(
    () => Math.max(0, eligibleIndexes.indexOf(currentIndex)),
    [eligibleIndexes, currentIndex],
  );
  const progress = useMemo(() => {
    if (eligibleIndexes.length === 0) return 0;
    return ((eligiblePosition + 1) / eligibleIndexes.length) * 100;
  }, [eligibleIndexes, eligiblePosition]);

  const isInvalidLink = !isPreview && (!contactId || !workspaceId);

  const saveAnswer = async (payload: {
    questionId: string;
    answerText?: string | null;
    answerNumber?: number | null;
    answerChoice?: string | null;
  }) => {
    if (!survey) return;
    const nextResponses = new Map(answeredResponses);
    nextResponses.set(payload.questionId, {
      answerNumber: payload.answerNumber,
      answerChoice: payload.answerChoice,
      answerText: payload.answerText,
    });

    if (isPreview) {
      setAnsweredResponses(nextResponses);
      const nextQuestionIndex = getNextEligibleQuestionIndex(
        survey.questions,
        currentIndex,
        nextResponses,
      );
      if (nextQuestionIndex == null) {
        setCompletion({
          success: true,
          score: null,
          npsCategory: null,
          reviewRedirect: null,
        });
      } else {
        setCurrentIndex(nextQuestionIndex);
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

      setAnsweredResponses(nextResponses);
      const nextQuestionIndex = getNextEligibleQuestionIndex(
        survey.questions,
        currentIndex,
        nextResponses,
      );
      if (nextQuestionIndex == null) {
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
        setCurrentIndex(nextQuestionIndex);
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
        className="min-h-dvh relative overflow-hidden flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
        }}
      >
        <div className="rounded-2xl border border-white/25 bg-white/90 p-5 shadow-lg backdrop-blur">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-600" />
          <p className="mt-2 text-xs text-slate-600">Loading survey...</p>
        </div>
      </main>
    );
  }

  if (surveyError) {
    return (
      <main
        className="min-h-dvh relative overflow-hidden flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
        }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-white/25 bg-white/90 p-6 text-center shadow-xl backdrop-blur">
          <h1 className="text-lg font-semibold text-slate-900">We hit a snag</h1>
          <p className="mt-1 text-sm text-slate-600">{surveyError}</p>
        </div>
      </main>
    );
  }

  if (isInvalidLink) {
    return (
      <main
        className="min-h-dvh relative overflow-hidden flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
        }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-white/25 bg-white/90 p-6 text-center shadow-xl backdrop-blur">
          <h1 className="text-lg font-semibold text-slate-900">Invalid link</h1>
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
        className="min-h-dvh relative overflow-hidden flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
        }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-white/25 bg-white/90 p-6 text-center shadow-xl backdrop-blur">
          <p className="text-sm text-slate-700">No questions are available.</p>
        </div>
      </main>
    );
  }

  if (completion && completionView) {
    return (
      <main
        className="min-h-dvh relative overflow-hidden flex items-center justify-center px-5 py-8"
        style={{
          background:
            "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full opacity-[0.06]"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{ height: "40%" }}
          >
            <path
              fill="#0369a1"
              d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,133.3C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,320L0,320Z"
            />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/92 p-6 text-center shadow-xl backdrop-blur">
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
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
            >
              {completionView.ctaLabel}
            </a>
          )}
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
          "linear-gradient(165deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #e0f2fe 75%, #fff7ed 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.06]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: "40%" }}
        >
          <path
            fill="#0369a1"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,133.3C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,320L0,320Z"
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
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L0,320Z"
          />
        </svg>
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        {isPreview && (
          <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-100/90 px-4 py-2 text-center shadow-sm">
            <p className="text-xs font-medium text-amber-800">
              Preview Mode — responses will not be saved
            </p>
          </div>
        )}

        <div className="text-center mb-7">
          {workspace?.imageUrl ? (
            <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden mb-3 shadow-lg ring-4 ring-white/40">
              <Image
                src={workspace.imageUrl}
                alt={workspace.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto h-16 w-16 rounded-2xl mb-3 shadow-lg ring-4 ring-white/40 bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {(workspace?.name ?? "S")[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <p className="text-2xl font-bold text-white drop-shadow-sm">
            {workspace?.name ?? "Survey"}
          </p>
          <p className="text-sm text-white/75 mt-1">{survey.name}</p>
        </div>

        <div className="mb-4 rounded-xl border border-white/20 bg-white/90 p-3 shadow-md backdrop-blur">
          <div className="h-1.5 rounded-full bg-slate-200/90 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-sky-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5">
            {eligiblePosition + 1} of {Math.max(eligibleIndexes.length, 1)}
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/20 p-6 shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="space-y-5">
            <div className="text-center">
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
            <h1 className="mt-3 text-xl font-semibold leading-tight text-slate-900">
              {question?.text}
            </h1>
            {question?.required && (
              <p className="mt-1 text-[10px] text-rose-500">Required</p>
            )}
          </div>

          <div className="space-y-2.5">
            {question?.type === "nps" && (
              <div>
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
                    className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 active:scale-[0.98] disabled:opacity-60"
                  >
                    {i}
                  </button>
                ))}
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-[10px] text-slate-500">Not likely</span>
                  <span className="text-[10px] text-slate-500">Very likely</span>
                </div>
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
                    className="rounded-xl p-2.5 transition-transform hover:scale-105 active:scale-[0.98] disabled:opacity-60"
                  >
                    <Star className="h-8 w-8 fill-amber-400 text-amber-400 drop-shadow-sm" />
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
                  className="h-12 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-medium text-emerald-700 shadow-sm active:scale-[0.98] disabled:opacity-60"
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
                  className="h-12 rounded-xl border border-rose-300 bg-rose-50 text-sm font-medium text-rose-700 shadow-sm active:scale-[0.98] disabled:opacity-60"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none shadow-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={completeFreeText}
                  disabled={!freeTextDraft.trim() || submitting || completing}
                  className="h-11 w-full rounded-xl bg-teal-600 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
                >
                  {submitting || completing ? "Saving..." : "Continue"}
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/40 mt-8">
          Powered by SurfBloom
        </p>
      </div>
      </div>
    </main>
  );
}

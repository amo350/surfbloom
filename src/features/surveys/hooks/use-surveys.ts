"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";
import { useTRPC } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterInputs = inferRouterInputs<AppRouter>;
type SurveyStatus = RouterInputs["surveys"]["getSurveys"]["status"];
type ResponseStatus = RouterInputs["surveys"]["getResponses"]["status"];

// ─── Survey CRUD ────────────────────────────────────────

export const useSurveys = (status?: SurveyStatus) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.surveys.getSurveys.queryOptions({
      status,
    }),
  );
};

export const useSurvey = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.surveys.getSurvey.queryOptions({ id: id ?? "" }),
    enabled: !!id,
  });
};

export const useCreateSurvey = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.createSurvey.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurveys.queryKey() });
      },
    }),
  );
};

export const useUpdateSurvey = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.updateSurvey.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurveys.queryKey() });
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurvey.queryKey() });
      },
    }),
  );
};

export const useDeleteSurvey = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.deleteSurvey.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurveys.queryKey() });
      },
    }),
  );
};

// ─── Question CRUD ──────────────────────────────────────

export const useAddQuestion = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.addQuestion.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurvey.queryKey() });
      },
    }),
  );
};

export const useUpdateQuestion = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.updateQuestion.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurvey.queryKey() });
      },
    }),
  );
};

export const useDeleteQuestion = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.deleteQuestion.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurvey.queryKey() });
      },
    }),
  );
};

export const useReorderQuestions = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.surveys.reorderQuestions.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.surveys.getSurvey.queryKey() });
      },
    }),
  );
};

// ─── Stats & Responses ──────────────────────────────────

export const useSurveyStats = (surveyId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.surveys.getSurveyStats.queryOptions({ surveyId: surveyId ?? "" }),
    enabled: !!surveyId,
  });
};

export const useSurveyResponses = (
  surveyId: string | null,
  status?: ResponseStatus,
  page: number = 1,
) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.surveys.getResponses.queryOptions({
      surveyId: surveyId ?? "",
      status,
      page,
    }),
    enabled: !!surveyId,
  });
};

export const useQuestionBreakdown = (surveyId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.surveys.getQuestionBreakdown.queryOptions({ surveyId: surveyId ?? "" }),
    enabled: !!surveyId,
  });
};

export const useScoreDistribution = (surveyId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.surveys.getScoreDistribution.queryOptions({ surveyId: surveyId ?? "" }),
    enabled: !!surveyId,
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

// ─── QUERIES ─────────────────────────────────────────

export const useTemplates = (filters?: {
  category?: string;
  search?: string;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.templates.getTemplates.queryOptions({
      category: filters?.category,
      search: filters?.search,
    }),
  );
};

export const useTemplate = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.templates.getTemplate.queryOptions({ id: id! }),
    enabled: !!id,
  });
};

export const useTemplateCategories = () => {
  const trpc = useTRPC();
  return useQuery(trpc.templates.getCategories.queryOptions());
};

// ─── MUTATIONS ───────────────────────────────────────

export const useCreateTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.templates.createTemplate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.templates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.templates.updateTemplate.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.templates.getTemplates.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.templates.getTemplate.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};

export const useDeleteTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.templates.deleteTemplate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.templates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useDuplicateTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.templates.duplicateTemplate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.templates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useTemplateStats = () => {
  const trpc = useTRPC();
  return useQuery(trpc.templates.getTemplateStats.queryOptions());
};

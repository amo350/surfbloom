import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useEmailTemplates = (filters?: {
  category?: string;
  search?: string;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.emailTemplates.getTemplates.queryOptions({
      category: filters?.category,
      search: filters?.search,
    }),
  );
};

export const useEmailTemplate = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.emailTemplates.getTemplate.queryOptions({ id: id! }),
    enabled: !!id,
  });
};

export const useCreateEmailTemplate = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.emailTemplates.createTemplate.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: trpc.emailTemplates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateEmailTemplate = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.emailTemplates.updateTemplate.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: trpc.emailTemplates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteEmailTemplate = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.emailTemplates.deleteTemplate.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: trpc.emailTemplates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useDuplicateEmailTemplate = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.emailTemplates.duplicateTemplate.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: trpc.emailTemplates.getTemplates.queryKey(),
        });
      },
    }),
  );
};

export const useEmailCategories = () => {
  const trpc = useTRPC();
  return useQuery(trpc.emailTemplates.getCategories.queryOptions());
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useContacts = (filters: {
  workspaceId?: string;
  search?: string;
  stage?: string;
  source?: string;
  categoryId?: string;
  page: number;
  pageSize?: number;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.contacts.getContacts.queryOptions({
      ...filters,
      page: filters.page,
      pageSize: filters.pageSize || 20,
    } as any),
  );
};

export const useContact = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.contacts.getContact.queryOptions({ id: id! }),
    enabled: !!id,
  });
};

export const useActivities = (contactId: string | null, page: number = 1) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.contacts.getActivities.queryOptions({
      contactId: contactId!,
      page,
      pageSize: 20,
    }),
    enabled: !!contactId,
  });
};

export const useCreateContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.createContact.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.updateContact.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContact.queryKey({ id: data.id }),
        });
      },
    }),
  );
};

export const useDeleteContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.deleteContact.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
      },
    }),
  );
};

export const useCategories = (
  workspaceId: string | undefined,
  search?: string,
) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.contacts.getCategories.queryOptions({
      workspaceId: workspaceId!,
      search,
    }),
    enabled: !!workspaceId,
  });
};

export const useCreateCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.createCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getCategories.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.deleteCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getCategories.queryKey(),
        });
      },
    }),
  );
};

export const useAddCategoryToContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.addCategoryToContact.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContact.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
      },
    }),
  );
};

export const useRemoveCategoryFromContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.removeCategoryFromContact.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContact.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
      },
    }),
  );
};

export const useBatchCreateContacts = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.batchCreate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
      },
    }),
  );
};

export const usePromoteToContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.contacts.promoteToContact.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.contacts.getContacts.queryKey(),
        });
      },
    }),
  );
};

export const useExportContacts = (filters: {
  workspaceId?: string;
  stage?: string;
  source?: string;
  categoryId?: string;
  enabled?: boolean;
}) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.contacts.exportContacts.queryOptions({
      workspaceId: filters.workspaceId,
      stage: filters.stage as any,
      source: filters.source as any,
      categoryId: filters.categoryId,
    }),
    enabled: filters.enabled ?? false,
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useSequences = (filters?: {
  workspaceId?: string;
  status?: string;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.sequences.getSequences.queryOptions({
      workspaceId: filters?.workspaceId,
      status: filters?.status as any,
    }),
  );
};

export const useSequence = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.sequences.getSequence.queryOptions({ id: id! }),
    enabled: !!id,
  });
};

export const useCreateSequence = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.createSequence.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequences.queryKey() });
      },
    }),
  );
};

export const useUpdateSequence = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.updateSequence.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequences.queryKey() });
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
      },
    }),
  );
};

export const useDeleteSequence = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.deleteSequence.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequences.queryKey() });
      },
    }),
  );
};

export const useAddStep = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.addStep.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
      },
    }),
  );
};

export const useUpdateStep = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.updateStep.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
      },
    }),
  );
};

export const useDeleteStep = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.deleteStep.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
      },
    }),
  );
};

export const useReorderSteps = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.reorderSteps.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
      },
    }),
  );
};

export const useEnrollments = (
  sequenceId: string | null,
  status?: string,
  page: number = 1,
) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.sequences.getEnrollments.queryOptions({
      sequenceId: sequenceId!,
      status: status as any,
      page,
    }),
    enabled: !!sequenceId,
  });
};

export const useContactEnrollments = (contactId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.sequences.getContactEnrollments.queryOptions({ contactId: contactId! }),
    enabled: !!contactId,
  });
};

export const useStepStats = (sequenceId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.sequences.getStepStats.queryOptions({ sequenceId: sequenceId! }),
    enabled: !!sequenceId,
  });
};

export const useEnrollContacts = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.enrollContacts.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
        qc.invalidateQueries({ queryKey: trpc.sequences.getEnrollments.queryKey() });
      },
    }),
  );
};

export const useStopEnrollment = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.stopEnrollment.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
        qc.invalidateQueries({ queryKey: trpc.sequences.getEnrollments.queryKey() });
      },
    }),
  );
};

export const useEnrollByAudience = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.sequences.enrollByAudience.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.sequences.getSequence.queryKey() });
        qc.invalidateQueries({ queryKey: trpc.sequences.getEnrollments.queryKey() });
      },
    }),
  );
};

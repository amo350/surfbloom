import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

// ─── Domains ──────────────────────────────────────────────

export const useDomains = () => {
  const trpc = useTRPC();
  return useQuery(trpc.chatbot.getDomains.queryOptions());
};

export const useAddDomain = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.addDomain.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getDomains.queryFilter().queryKey,
        });
        toast.success("Domain added");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

export const useUpdateDomain = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.updateDomain.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getDomains.queryFilter().queryKey,
        });
        toast.success("Domain updated");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

export const useRemoveDomain = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.removeDomain.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getDomains.queryFilter().queryKey,
        });
        toast.success("Domain removed");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

// ─── Chatbot Config ───────────────────────────────────────

export const useChatBotConfig = (domainId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.chatbot.getConfig.queryOptions({ domainId }));
};

export const useUpdateChatBotConfig = (domainId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.updateConfig.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getConfig.queryFilter({ domainId }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getDomains.queryFilter().queryKey,
        });
        toast.success("Settings saved");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

// ─── Help Desk ────────────────────────────────────────────

export const useHelpDeskItems = (domainId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.chatbot.getHelpDeskItems.queryOptions({ domainId }));
};

export const useCreateHelpDeskItem = (domainId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.createHelpDeskItem.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getHelpDeskItems.queryFilter({ domainId })
            .queryKey,
        });
        toast.success("Question added");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

export const useDeleteHelpDeskItem = (domainId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.deleteHelpDeskItem.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getHelpDeskItems.queryFilter({ domainId })
            .queryKey,
        });
        toast.success("Question removed");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

// ─── Filter Questions ─────────────────────────────────────

export const useFilterQuestions = (domainId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.chatbot.getFilterQuestions.queryOptions({ domainId }));
};

export const useCreateFilterQuestion = (domainId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.createFilterQuestion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getFilterQuestions.queryFilter({ domainId })
            .queryKey,
        });
        toast.success("Question added");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

export const useDeleteFilterQuestion = (domainId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.deleteFilterQuestion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getFilterQuestions.queryFilter({ domainId })
            .queryKey,
        });
        toast.success("Question removed");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

// ─── Conversations ────────────────────────────────────────

export const useConversations = (filters: {
  domainId?: string;
  workspaceId?: string;
  live?: boolean;
  tab?: "unread" | "all" | "expired" | "starred";
  page: number;
  pageSize?: number;
  channel?: "all" | "webchat" | "sms" | "feedback";
  view?: "all" | "mine" | "unassigned";
  stage?: string;
  categoryIds?: string[];
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.chatbot.getConversations.queryOptions({
      ...filters,
      tab: filters.tab || "all",
      channel: filters.channel || "all",
      view: filters.view || "all",
    }),
  );
};

export const useMessages = (roomId: string | null, page: number = 1) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.chatbot.getMessages.queryOptions({
      roomId: roomId!,
      page,
      pageSize: 12,
    }),
    enabled: !!roomId,
  });
};

export const useRoom = (roomId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.chatbot.getRoom.queryOptions({ roomId: roomId! }),
    enabled: !!roomId,
  });
};

export const useSendMessage = (roomId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.sendMessage.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getMessages.queryFilter({ roomId }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getConversations.queryFilter().queryKey,
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

export const useMarkSeen = (roomId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.markSeen.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getConversations.queryFilter().queryKey,
        });
      },
    }),
  );
};

export const useUpdateRoom = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.updateRoom.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getConversations.queryFilter().queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getRoom.queryFilter().queryKey,
        });
        toast.success("Conversation updated");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
};

export const useSmsMessages = (chatRoomId: string | null, page: number = 1) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.chatbot.getSmsMessages.queryOptions({
      chatRoomId: chatRoomId!,
      page,
      pageSize: 12,
    }),
    enabled: !!chatRoomId,
  });
};

export const useSendSmsReply = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.chatbot.sendSmsReply.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatbot.getSmsMessages.queryKey({
            chatRoomId: variables.roomId,
            page: 1,
            pageSize: 12,
          }),
        });
      },
    }),
  );
};

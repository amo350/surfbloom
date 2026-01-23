import { channel, topic } from "@inngest/realtime"

export const xAiChannel = channel('xAi-execution')
    .addTopic(
        topic('status').type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>()
    )

import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";

type HttpRequestData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
};

export const HttpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    //publish loading state for manual trigger

    if (!data.endpoint) {
        throw new NonRetriableError("No endpoint configured");
    }

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET";

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            if (data.body) {
                options.body = data.body
            }
        }
        const response = await ky(endpoint, options)
        const contentType = response.headers.get("content-type")
        const responseData = contentType?.includes("application/json")
            ? await response.json() : await response.text()

        return {
            ...context,
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            }
        }
    })

    // const result = await step.run("http-request", async () => context);

    //success state for trigger
    return result;
};

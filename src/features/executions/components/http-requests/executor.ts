import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";

type HttpRequestData = {
    variableName?: string;
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
    if (!data.variableName) {
        throw new NonRetriableError("Variable name not configured");
    }

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET";

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            if (data.body) {
                options.body = data.body;
                options.headers = {
                    "Content-Type": "application/json"
                }
            }
        }
        const response = await ky(endpoint, options)
        const contentType = response.headers.get("content-type")
        const responseData = contentType?.includes("application/json")
            ? await response.json() : await response.text()

        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            },
        };

        if (data.variableName) {
            return {
                ...context,
                [data.variableName]: responsePayload,
            };
        }
        //fallback
        return {
            ...context,
            ...responsePayload,
        };
    });

    // const result = await step.run("http-request", async () => context);

    //success state for trigger
    return result;
};

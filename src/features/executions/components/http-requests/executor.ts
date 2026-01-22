import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString;
})

type HttpRequestData = {
    variableName: string;
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
    if (!data.method) {
        throw new NonRetriableError("Method not configured");
    }

    const result = await step.run("http-request", async () => {
        //http://...
        const endpoint = Handlebars.compile(data.endpoint)(context);
        console.log("Endpoint", { endpoint });

        const method = data.method;

        const options: KyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method)) {
            const resolved = Handlebars.compile(data.body || '{}')(context)
            JSON.parse(resolved)
            if (data.body) {
                options.body = resolved;
                options.headers = {
                    "Content-Type": "application/json",
                };
            }
        }
        const response = await ky(endpoint, options);
        const contentType = response.headers.get("content-type");
        const responseData = contentType?.includes("application/json")
            ? await response.json()
            : await response.text();

        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            },
        };

        return {
            ...context,
            [data.variableName]: responsePayload,
        };
    });

    // const result = await step.run("http-request", async () => context);

    //success state for trigger
    return result;
};

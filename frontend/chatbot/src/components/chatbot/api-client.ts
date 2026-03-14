import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const publicApiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL ?? "http://127.0.0.1:8000",
    timeout: 30000,
});

type SendMessageRequest = {
    prompt: string;
    tenant_id: string;
    history: { role: string; content: string }[];
    top_k?: number;
};

export type SourceDoc = {
    name: string;
    url: string;
};

type SendMessageResponse = {
    answer: string;
    sources?: SourceDoc[];
};

export const useSendMessage = () => {
    return useMutation({
        mutationFn: async (data: SendMessageRequest) => {
            const res = await publicApiClient.post<SendMessageResponse>("/api/query", {
                prompt: data.prompt,
                tenant_id: data.tenant_id,
                history: data.history,
                top_k: 5
            });
            return res.data;
        },
    });
};

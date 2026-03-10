import { useMutation } from "@tanstack/react-query";
import apiClient from "../services/api-client";

type SendMessageRequest = {
  prompt: string;
};

type SendMessageResponse = {
  answer: string;
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const res = await apiClient.post<SendMessageResponse>("/query", data);

      return res.data;
    },
  });
};

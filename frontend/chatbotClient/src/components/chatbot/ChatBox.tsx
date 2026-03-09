import { useState } from "react";
import ChatInput, { type ChatFormData } from "./ChatInput";
import ChatMessages, { type Message } from "./ChatMessages";
import TypingIndicator from "./TypingIndicator";
import { useSendMessage } from "../../hooks/useSendMessage";

const INITIAL_MESSAGE: Message = {
  content:
    "👋 Hi! I'm the MediCarePlus AI assistant. Ask me about appointments, doctors, services, or location.",
  role: "bot",
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [error, setError] = useState("");

  const sendMessageMutation = useSendMessage();

  const onSubmit = ({ prompt }: ChatFormData) => {
    setError("");

    // optimistic user message
    setMessages((prev) => [...prev, { content: prompt, role: "user" }]);

    sendMessageMutation.mutate(
      { prompt },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { content: data.message, role: "bot" },
          ]);
        },
        onError: () => {
          setError("Something went wrong.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 gap-3 overflow-y-auto mb-4">
        <ChatMessages messages={messages} />

        {sendMessageMutation.isPending && <TypingIndicator />}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <ChatInput onSubmit={onSubmit} />
    </div>
  );
};

export default ChatBot;

import { useState, useEffect } from "react";
import ChatInput, { type ChatFormData } from "./ChatInput";
import ChatMessages, { type Message } from "./ChatMessages";
import TypingIndicator from "./TypingIndicator";
import { useSendMessage } from "./api-client";


const INITIAL_MESSAGE: Message = {
  content: "👋 Γεια σας! Είμαι ο Ψηφιακός Βοηθός. Ρωτήστε με για διαδικασίες, έγγραφα ή τοποθεσίες του οργανισμού.",
  role: "bot",
};

interface ChatBotProps {
  uid: string;
}

const ChatBot = ({ uid }: ChatBotProps) => {
  const [error, setError] = useState("");
  const sendMessageMutation = useSendMessage();
  const STORAGE_KEY = `docatlas_chat_${uid}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [INITIAL_MESSAGE];
      }
    }
    return [INITIAL_MESSAGE];
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, STORAGE_KEY]);

  const onSubmit = ({ prompt }: ChatFormData) => {
    setError("");
const recentHistory = messages.slice(-4).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    // Optimistic user message
    setMessages((prev) => [...prev, { content: prompt, role: "user" }]);

    // Καλούμε το mutation και περνάμε το prompt ΚΑΙ το uid
    sendMessageMutation.mutate(
      { prompt, tenant_id: uid, history: recentHistory },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { content: data.answer, role: "bot" },
          ]);
        },
        onError: () => {
          setError("Υπήρξε ένα πρόβλημα στην επικοινωνία. Δοκιμάστε ξανά.");
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
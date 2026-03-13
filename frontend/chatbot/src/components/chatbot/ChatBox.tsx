import { useState, useEffect } from "react";
import ChatInput, { type ChatFormData } from "./ChatInput";
import ChatMessages, { type Message } from "./ChatMessages";
import TypingIndicator from "./TypingIndicator";
import ChatbotHeader from "./ChatbotHeader";
import { useSendMessage } from "./api-client";

const INITIAL_MESSAGE: Message = {
  content: "👋 Γεια σας! Είμαι ο Ψηφιακός Βοηθός. Ρωτήστε με για διαδικασίες, έγγραφα ή τοποθεσίες.",
  role: "bot",
};

interface ChatBotProps {
  uid: string;
  onClose: () => void;
}

const ChatBot = ({ uid, onClose }: ChatBotProps) => {
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

  // delete chat history from session storage and reset messages to initial state
  const handleClearChat = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setMessages([INITIAL_MESSAGE]);
    setError("");
  };

  const onSubmit = ({ prompt }: ChatFormData) => {
    setError("");
    let cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    if (cleanPrompt.length > 500) {
      cleanPrompt = cleanPrompt.substring(0, 500);
    }

    const recentHistory = messages.slice(-4).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    setMessages((prev) => [...prev, { content: cleanPrompt, role: "user" }]);

    sendMessageMutation.mutate(
      { prompt: cleanPrompt, tenant_id: uid, history: recentHistory },
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
    <div className="flex flex-col h-full bg-white">
      <ChatbotHeader onClose={onClose} onClear={handleClearChat} />
      <div className="flex-1 overflow-y-auto p-4 [scrollbar-gutter:stable]">
        <ChatMessages messages={messages} />
        {sendMessageMutation.isPending && (
          <div className="mt-4">
            <TypingIndicator />
          </div>
        )}
        {error && <p className="mt-2 text-red-500 text-xs font-medium text-center">{error}</p>}
      </div>

      <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
        <ChatInput onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default ChatBot;
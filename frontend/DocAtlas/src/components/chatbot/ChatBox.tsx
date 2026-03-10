import { useState } from "react";
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
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [error, setError] = useState("");
  const sendMessageMutation = useSendMessage();

  
  const onSubmit = ({ prompt }: ChatFormData) => {
    setError("");
    
    // Optimistic user message
    setMessages((prev) => [...prev, { content: prompt, role: "user" }]);

    // Καλούμε το mutation και περνάμε το prompt ΚΑΙ το uid
    sendMessageMutation.mutate(
      { prompt, tenant_id: uid },
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
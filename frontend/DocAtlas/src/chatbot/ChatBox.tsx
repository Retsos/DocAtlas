import { useState } from "react";
import ChatInput, { type ChatFormData } from "./ChatInput";
import ChatMessages, { type Message } from "./ChatMessages";
import TypingIndicator from "./TypingIndicator";

const INITIAL_MESSAGE: Message = {
  content:
    "👋 Hi! I'm the MediCarePlus AI assistant. Ask me about appointments, doctors, services, or location.",
  role: "bot",
};

/* Mock API */
const mockChatApi = (prompt: string): Promise<{ message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: `You said: "${prompt}". This is a mock AI response.`,
      });
    }, 1500);
  });
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async ({ prompt }: ChatFormData) => {
    try {
      setMessages((prev) => [...prev, { content: prompt, role: "user" }]);
      setIsBotTyping(true);
      setError("");

      const data = await mockChatApi(prompt);

      setMessages((prev) => [...prev, { content: data.message, role: "bot" }]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 gap-3 overflow-y-auto mb-4">
        <ChatMessages messages={messages} />
        {isBotTyping && <TypingIndicator />}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <ChatInput onSubmit={onSubmit} />
    </div>
  );
};

export default ChatBot;

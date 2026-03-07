import { useState } from "react";
import ChatInput, { type ChatFormData } from "./ChatInput";
import type { Message } from "./ChatMessages";
import ChatMessages from "./ChatMessages";
import TypingIndicator from "./TypingIndicator";

// --- Mock API Function ---
const mockChatApi = (prompt: string): Promise<{ message: string }> => {
  return new Promise((resolve, reject) => {
    // Adjust this delay (ms) to test your loading/typing UI
    const delay = 2000;

    setTimeout(() => {
      // Logic for a simple mock response
      if (prompt.toLowerCase().includes("error")) {
        reject(new Error("Simulated API failure"));
      } else {
        resolve({
          message: `You said: "${prompt}". This is a mocked response!`,
        });
      }
    }, delay);
  });
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async ({ prompt }: ChatFormData) => {
    try {
      setMessages((prev) => [...prev, { content: prompt, role: "user" }]);
      setIsBotTyping(true);
      setError("");

      // Using the mock instead of axios
      const data = await mockChatApi(prompt);

      setMessages((prev) => [...prev, { content: data.message, role: "bot" }]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong, try again!");
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
        <ChatMessages messages={messages} />
        {isBotTyping && <TypingIndicator />}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <ChatInput onSubmit={onSubmit} />
    </div>
  );
};

export default ChatBot;

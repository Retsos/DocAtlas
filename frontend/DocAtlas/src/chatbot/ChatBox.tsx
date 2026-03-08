import { useState } from "react";
import ChatInput, { type ChatFormData } from "./ChatInput";
import ChatMessages, { type Message } from "./ChatMessages";
import TypingIndicator from "./TypingIndicator";

const INITIAL_MESSAGE: Message = {
  content: "👋 Γεια σας! Είμαι ο Ψηφιακός Βοηθός. Ρωτήστε με για διαδικασίες, έγγραφα ή τοποθεσίες του οργανισμού.",
  role: "bot",
};

/* Ο Ψεύτικος Αγγελιοφόρος - Τώρα κουβαλάει και τη σφραγίδα (uid) */
const mockChatApi = (prompt: string, uid: string): Promise<{ message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: `[Διαβάζω τα αρχεία του Νοσοκομείου με ID: ${uid}]... Απάντηση: Έλαβες την πληροφορία για το "${prompt}".`,
      });
    }, 1500);
  });
};

/* 1. Ορίζουμε αυστηρά ότι το ChatBot ΑΠΑΙΤΕΙ το uid */
interface ChatBotProps {
  uid: string;
}

const ChatBot = ({ uid }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async ({ prompt }: ChatFormData) => {
    try {
      setMessages((prev) => [...prev, { content: prompt, role: "user" }]);
      setIsBotTyping(true);
      setError("");

      // 2. Στέλνουμε την ερώτηση ΜΑΖΙ με το ιερό βουλοκέρι
      const data = await mockChatApi(prompt, uid);

      setMessages((prev) => [...prev, { content: data.message, role: "bot" }]);
    } catch (err) {
      console.error(err);
      setError("Το δίκτυο λύγισε. Δοκιμάστε ξανά.");
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
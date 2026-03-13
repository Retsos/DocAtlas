import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export type Message = {
  content: string;
  role: "user" | "bot";
};

type Props = {
  messages: Message[];
};

const ChatMessages = ({ messages }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`px-4 py-2.5 max-w-[80%] rounded-2xl shadow-sm text-sm ${
            message.role === "user"
              ? "bg-cyan-700 text-white self-end rounded-br-sm"
              : "bg-gray-100 text-slate-800 self-start rounded-bl-sm border border-gray-200"
          }`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={bottomRef} className="h-px" />
    </div>
  );
};

export default ChatMessages;
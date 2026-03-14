import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { type SourceDoc } from "./api-client";

export type Message = {
  content: string;
  role: "user" | "bot";
  sources?: SourceDoc[];
};

type Props = {
  messages: Message[];
};

const ChatMessages = ({ messages }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastBotMessage = [...messages].reverse().find((m) => m.role === "bot");
    if (lastBotMessage) {
      console.log("[CHAT UI] last bot message sources:", lastBotMessage.sources);
    }
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

          {message.role === "bot" && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300/80">
              <span className="text-[11px] font-bold text-gray-500 mb-2 block uppercase tracking-wider">
                Σχετικά Έγγραφα
              </span>
              <div className="flex flex-col gap-1.5">
                {message.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-cyan-700 bg-white border border-cyan-100 px-2.5 py-1.5 rounded-md hover:bg-cyan-50 hover:border-cyan-200 transition-all w-fit shadow-sm"
                    title={source.name}
                  >
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.586a6 6 0 108.486 8.486L20.5 13"
                      ></path>
                    </svg>
                    <span className="truncate max-w-[220px] font-medium">{source.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} className="h-px" />
    </div>
  );
};

export default ChatMessages;

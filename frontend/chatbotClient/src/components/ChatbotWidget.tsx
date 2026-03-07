import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "bot",
    content:
      "👋 Hi! I'm the MediCarePlus AI assistant. I can help you with information about our services, doctors, appointments, and more. How can I help you today?",
  },
];

const BOT_RESPONSES: Record<string, string> = {
  appointment:
    "To book an appointment, you can call us at (555) 123-4567 or visit our front desk. Would you like me to help with anything else?",
  hours:
    "Our regular hours are Mon–Fri 8 AM–8 PM and Sat 9 AM–5 PM. Our Emergency department is open 24/7.",
  services:
    "We offer Cardiology, Neurology, Pediatrics, Orthopedics, Ophthalmology, and General Medicine. Which service interests you?",
  doctors:
    "Our team includes Dr. Sarah Mitchell (Cardiology), Dr. James Park (Neurology), Dr. Maria Santos (Pediatrics), and Dr. Robert Chen (Orthopedics).",
  emergency:
    "For emergencies, please call 911 or come directly to our Emergency Department, open 24/7.",
  insurance:
    "We accept most major insurance plans. Please contact our billing department at (555) 123-4568 for specific coverage questions.",
  location:
    "We're located at 123 Medical Drive, Health City. Free parking is available in our visitor lot.",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return "Thank you for your question! For specific medical inquiries, I'd recommend speaking with one of our specialists. Is there anything else I can help with — like appointments, services, or directions?";
}

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(
      () => {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: getBotResponse(text),
        };
        setMessages((m) => [...m, botMsg]);
        setTyping(false);
      },
      800 + Math.random() * 600,
    );
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-foreground" />
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">
                    MediCare Assistant
                  </p>
                  <p className="text-xs text-primary-foreground/70">
                    Powered by AI Knowledge Base
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-chat-bot text-chat-bot-foreground rounded-bl-md"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="bg-chat-bot rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-chat-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-chat-bounce"
                      style={{ animationDelay: "200ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-chat-bounce"
                      style={{ animationDelay: "400ms" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {["Services", "Doctors", "Appointment", "Hours"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      setTimeout(() => {
                        setInput("");
                        const userMsg: Message = {
                          id: Date.now().toString(),
                          role: "user",
                          content: s,
                        };
                        setMessages((m) => [...m, userMsg]);
                        setTyping(true);
                        setTimeout(() => {
                          setMessages((m) => [
                            ...m,
                            {
                              id: (Date.now() + 1).toString(),
                              role: "bot",
                              content: getBotResponse(s),
                            },
                          ]);
                          setTyping(false);
                        }, 800);
                      }, 50);
                    }}
                    className="px-3 py-1.5 text-xs rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our services..."
                  className="flex-1 bg-secondary text-secondary-foreground placeholder:text-muted-foreground rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;

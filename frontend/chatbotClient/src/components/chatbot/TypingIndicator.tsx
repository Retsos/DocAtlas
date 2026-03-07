import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 justify-start items-end mb-4">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-accent-foreground" />
      </div>

      <div className="bg-chat-bot px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;

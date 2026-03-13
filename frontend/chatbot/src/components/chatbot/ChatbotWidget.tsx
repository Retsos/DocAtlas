import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBot from "./ChatBox";

interface ChatbotWidgetProps {
  uid?: string;
}

const ChatbotWidget = ({ uid = "local-preview" }: ChatbotWidgetProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-700 shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[540px] rounded-2xl bg-transparent shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <ChatBot uid={uid} onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;

import { Bot, X } from "lucide-react";

interface Props {
  setOpen: (value: boolean) => void;
}

const ChatbotHeader = ({ setOpen }: Props) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-cyan-700 text-white">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span className="text-sm font-semibold">DockAtlas Assistant</span>
      </div>

      <button onClick={() => setOpen(false)}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ChatbotHeader;

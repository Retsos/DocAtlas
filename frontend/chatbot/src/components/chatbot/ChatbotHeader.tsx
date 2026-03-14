import { Bot, X, Trash2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onClear: () => void;
}

const ChatbotHeader = ({ onClose, onClear }: Props) => {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 py-3 bg-cyan-700 text-white rounded-t-2xl">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span className="text-sm font-semibold tracking-wide">Βοηθός DocAtlas</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onClear}
          title="Εκκαθάριση συνομιλίας"
          className="text-cyan-200 hover:text-white transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          title="Κλείσιμο"
          className="text-cyan-200 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatbotHeader;

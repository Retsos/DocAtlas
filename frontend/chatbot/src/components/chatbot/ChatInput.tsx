import { useForm } from "react-hook-form";
import { ArrowUp } from "lucide-react";
import { Button } from "../ui/button";

export type ChatFormData = {
  prompt: string;
};

type Props = {
  onSubmit: (data: ChatFormData) => void;
};

const ChatInput = ({ onSubmit }: Props) => {
  const { register, handleSubmit, reset, watch } = useForm<ChatFormData>({
    mode: "onChange",
    defaultValues: { prompt: "" },
  });

  // Παρακολουθούμε την τρέχουσα τιμή για να αποτρέπουμε κενά μηνύματα.
  const promptValue = watch("prompt");
  const isValid = promptValue.trim().length > 0;

  const submit = handleSubmit((data) => {
    if (!isValid) return;
    reset({ prompt: "" });
    onSubmit(data);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isValid) {
        submit();
      }
    }
  };

  const { ref, ...rest } = register("prompt");

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border border-gray-200 p-2 rounded-2xl bg-white focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600 transition-all shadow-sm"
    >
      <textarea
        {...rest}
        ref={ref}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ρωτήστε για τις υπηρεσίες μας..."
        className="flex-1 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 py-2 text-sm text-slate-800 min-h-[40px] max-h-32 overflow-y-auto [scrollbar-gutter:stable]"
      />

      <Button
        type="submit"
        disabled={!isValid}
        className="shrink-0 mb-0.5 rounded-full w-10 h-10 bg-cyan-700 hover:bg-cyan-800 transition-colors cursor-pointer"
        title="Αποστολή"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </Button>
    </form>
  );
};

export default ChatInput;

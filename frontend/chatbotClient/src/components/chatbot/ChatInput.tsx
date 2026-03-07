import type { KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { FaArrowUp } from "react-icons/fa";
import { Button } from "../ui/button";

export type ChatFormData = {
  prompt: string;
};

type Props = {
  onSubmit: (data: ChatFormData) => void;
};

const ChatInput = ({ onSubmit }: Props) => {
  const { register, handleSubmit, reset, formState } = useForm<ChatFormData>();

  const submit = handleSubmit((data) => {
    reset({ prompt: "" });
    onSubmit(data);
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={handleKeyDown}
      className="flex items-center gap-2 border p-2 rounded-2xl"
    >
      <textarea
        rows={1}
        {...register("prompt", {
          required: true,
          validate: (data) => data.trim().length > 0,
        })}
        className="flex-1 resize-none border-0 focus:outline-none leading-tight h-10"
        placeholder="Ask about our services..."
      />

      <Button
        disabled={!formState.isValid}
        className="self-end rounded-full w-9 h-9 bg-cyan-700"
      >
        <FaArrowUp />
      </Button>
    </form>
  );
};

export default ChatInput;

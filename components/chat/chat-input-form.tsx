"use client";

import { SendIcon } from "lucide-react";
import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputFormProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e?: FormEvent) => void;
  isLoading: boolean;
}

export default function ChatInputForm({
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="relative"
    >
      <Textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your question..."
        className="min-h-12 resize-none pr-12"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-2 bottom-2 h-8 w-8"
        disabled={!input.trim() || isLoading}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
        ) : (
          <SendIcon className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}

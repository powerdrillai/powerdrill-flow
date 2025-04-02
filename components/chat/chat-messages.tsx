"use client";

import Message from "@/components/messages/message";
import { MessageGroup } from "@/hooks/usePowerdrillChat";

interface ChatMessagesProps {
  messages: MessageGroup[];
  isLoading: boolean;
  onQuestionClick?: (question: string) => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  onQuestionClick,
}: ChatMessagesProps) {
  return (
    <div className="space-y-6 py-4">
      {messages.map((message, index) => (
        <Message
          key={message.job_id}
          message={message}
          isLoading={isLoading && index === messages.length - 1}
          isLast={index === messages.length - 1}
          onQuestionClick={onQuestionClick}
        />
      ))}

      {messages.length === 0 && !isLoading && (
        <div className="text-muted-foreground flex h-40 items-center justify-center">
          Start a new conversation...
        </div>
      )}
    </div>
  );
}

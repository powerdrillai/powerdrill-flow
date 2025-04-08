"use client";

import Message from "@/components/messages/message";
import { MessageGroup } from "@/hooks/usePowerdrillChat";

import { QuestionsBlockComponent } from "../messages/message-blocks/questions-block";

interface ChatMessagesProps {
  messages: MessageGroup[];
  questions?: string[];
  isLoading: boolean;
  onQuestionClick?: (question: string) => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  questions,
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
        />
      ))}

      {questions && (
        <QuestionsBlockComponent
          isLast
          block={{
            type: "QUESTIONS",
            content: questions,
          }}
          onQuestionClick={onQuestionClick}
        />
      )}

      {messages.length === 0 && !isLoading && (
        <div className="text-muted-foreground flex h-40 items-center justify-center">
          Start a new conversation...
        </div>
      )}
    </div>
  );
}

import { Loader2Icon } from "lucide-react";

import { MessageGroup } from "@/hooks/usePowerdrillChat";

import MessageBlocks from "../messages/message-blocks";

interface ChatCanvasProps {
  messages: MessageGroup[];
  isLoading: boolean;
  onQuestionClick?: (question: string) => void;
}

export function ChatCanvas({
  messages,
  isLoading,
  onQuestionClick,
}: ChatCanvasProps) {
  // Get the last message
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="h-full space-y-6 overflow-y-auto scroll-smooth p-4">
      {lastMessage && (
        <div
          className="min-w-0 flex-1 space-y-3"
          key={`${lastMessage.job_id}-answer`}
        >
          {lastMessage.answer.map((item) => {
            if (item.group_name !== "Conclusions") {
              return null;
            }
            return (
              <div className="space-y-2 py-4" key={item.group_id}>
                {item.blocks.map((block, index) => {
                  if (block.type !== "QUESTIONS") {
                    return (
                      <MessageBlocks
                        key={`${lastMessage.job_id}-answer-block-${index}`}
                        isCanvas={true}
                        block={block}
                        onQuestionClick={onQuestionClick}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
      )}
      {isLoading && (
        <div>
          <Loader2Icon className="animate-spin" />
        </div>
      )}
    </div>
  );
}

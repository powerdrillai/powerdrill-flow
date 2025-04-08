import { Loader2Icon } from "lucide-react";

import { MessageGroup } from "@/hooks/usePowerdrillChat";
import { AnswerBlock } from "@/services/powerdrill/session.service";

import MessageBlocks from "../messages/message-blocks";
import { ChatBlockPreview } from "./chat-block-preview";

interface ChatCanvasProps {
  messages: MessageGroup[];
  isLoading: boolean;
  blockPreview?: AnswerBlock;
  onClearBlockPreview?: () => void;
}

export function ChatCanvas({
  messages,
  isLoading,
  blockPreview,
  onClearBlockPreview,
}: ChatCanvasProps) {
  console.log(blockPreview, "blockPreview");
  // Get the last message
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  if (blockPreview) {
    return (
      <ChatBlockPreview block={blockPreview} onClear={onClearBlockPreview} />
    );
  }

  return (
    <div className="space-y-6 p-4">
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

import { X } from "lucide-react";

import { AnswerBlock } from "@/types/session";

import MessageBlocks from "../messages/message-blocks";
import { Button } from "../ui/button";

interface ChatBlockPreviewProps {
  block: AnswerBlock;
  onClear?: () => void;
}

export function ChatBlockPreview({ block, onClear }: ChatBlockPreviewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        {block.type === "TABLE" ? (
          <h4 className="text-lg font-semibold">{block?.content.name}</h4>
        ) : (
          <h4 className="text-lg font-semibold">
            Preview of the selected answer block from the chat messages
          </h4>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={onClear}
        >
          <X />
        </Button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto scroll-smooth p-4">
        <MessageBlocks isCanvas={true} block={block} />
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { QuestionsBlock } from "@/services/powerdrill/session.service";

interface QuestionsBlockProps {
  block: QuestionsBlock;
  isLast?: boolean;
  onQuestionClick?: (question: string) => void;
}

export function QuestionsBlockComponent({
  block,
  isLast,
  onQuestionClick,
}: QuestionsBlockProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">More Questions</h4>
      <div className="space-y-2">
        {block.content.map((question: string, index: number) => (
          <Button
            key={index}
            asChild
            variant="secondary"
            size="sm"
            disabled={!isLast}
            onClick={() => onQuestionClick?.(question)}
          >
            <div className="h-fit w-full py-2 text-sm font-normal !whitespace-normal">
              {question}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

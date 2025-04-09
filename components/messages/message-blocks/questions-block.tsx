"use client";

import { Button } from "@/components/ui/button";
import { QuestionsBlock } from "@/types/session";

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
  if (!block.content || block.content.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-base font-medium">More Questions</h4>
      <div className="space-y-2">
        {block.content.map((question: string, index: number) => (
          <Button
            key={index}
            asChild
            variant="secondary"
            size="sm"
            disabled={!isLast}
            onClick={() => onQuestionClick?.(question)}
            className="dark:bg-accent dark:text-accent-foreground justify-start"
          >
            <div className="h-fit w-full justify-start py-2 text-base font-normal !whitespace-normal">
              {question}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

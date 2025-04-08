import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TooltipWrapper } from "../ui/tooltip-wrapper";

interface ExplorationQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function ExplorationQuestions({
  questions,
  onQuestionClick,
}: ExplorationQuestionsProps) {
  if (questions.length === 0) return null;
  return (
    <div className="mb-2 flex gap-2 overflow-x-auto px-3 whitespace-nowrap">
      {questions.map((question, index) => (
        <TooltipWrapper key={index} title={question}>
          <Button
            key={index}
            variant="secondary"
            size="sm"
            className="dark:bg-accent dark:text-accent-foreground h-6 text-xs"
            onClick={() => onQuestionClick(question)}
          >
            <span className="max-w-[200px] truncate">{question}</span>
            <ArrowRightIcon className="size-3" />
          </Button>
        </TooltipWrapper>
      ))}
    </div>
  );
}

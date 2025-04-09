import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const visibleQuestions = questions.slice(0, 2);
  const hiddenQuestions = questions.slice(2);

  return (
    <div className="mb-2 flex gap-2 overflow-x-auto px-3 whitespace-nowrap">
      {visibleQuestions.map((question, index) => (
        <TooltipWrapper key={index} title={question}>
          <Button
            key={index}
            variant="secondary"
            size="sm"
            className="h-6 text-xs"
            onClick={() => onQuestionClick(question)}
          >
            <span className="max-w-[250px] truncate">{question}</span>
            <ArrowRightIcon className="size-3" />
          </Button>
        </TooltipWrapper>
      ))}

      {hiddenQuestions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-6 text-xs">
              +{hiddenQuestions.length}
              <ChevronDownIcon className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {hiddenQuestions.map((question, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => onQuestionClick(question)}
                className="max-w-[400px] flex-wrap text-xs"
              >
                {question}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

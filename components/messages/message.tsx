"use client";

import { IconCircleCheckFilled } from "@tabler/icons-react";
import { Loader2Icon } from "lucide-react";

import { MessageGroup } from "@/hooks/usePowerdrillChat";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { LoadingDots } from "../ui/loading-dots";
import { TooltipWrapper } from "../ui/tooltip-wrapper";
import MessageBlock from "./message-blocks";

interface MessageProps {
  message: MessageGroup;
  isLoading?: boolean;
  isLast?: boolean;
  onQuestionClick?: (question: string) => void;
}

export default function Message({
  message,
  isLoading,
  isLast,
  onQuestionClick,
}: MessageProps) {
  const { question, answer, job_id } = message;
  return (
    <div className="space-y-4">
      {/* User question */}
      <div className="flex justify-end">
        <div className="bg-accent max-w-[80%] rounded-md p-2">
          {question.blocks.map((block, index) => (
            <MessageBlock
              key={`${job_id}-question-block-${index}`}
              block={block}
              isLast={isLast}
            />
          ))}
        </div>
      </div>

      {/* System answer */}
      <div className="flex">
        <div className="min-w-0 flex-1 space-y-2">
          {answer.map((item, answerIndex) => {
            if (item.group_name === "Conclusions") {
              return (
                <div className="" key={item.group_id}>
                  <div className="mb-6 flex items-center gap-2">
                    {item.status === "running" ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <IconCircleCheckFilled className="size-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 truncate text-left text-base font-medium">
                      {item.group_name}
                    </div>
                  </div>
                  {item.blocks.map((block, index) => {
                    if (block.type === "QUESTIONS") {
                      return (
                        <MessageBlock
                          key={`${job_id}-answer-block-${index}`}
                          block={block}
                          onQuestionClick={onQuestionClick}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              );
            }
            return (
              <Collapsible
                key={item.group_id}
                defaultOpen
                className="data-[state=open]:[&_.collapsible-icon]:rotate-180"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2">
                    {item.status === "running" ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <IconCircleCheckFilled className="size-4 shrink-0" />
                    )}
                    <TooltipWrapper title={item.group_name}>
                      <div className="text-primary min-w-0 flex-1 truncate text-left text-base font-medium">
                        {item.group_name}
                      </div>
                    </TooltipWrapper>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div
                    className={cn(
                      "ml-2 space-y-3 border-l border-dashed px-4 py-2",
                      answerIndex === answer.length - 1 && "border-none"
                    )}
                  >
                    {item.blocks.map((block, index) => (
                      <MessageBlock
                        key={`${job_id}-answer-block-${index}`}
                        block={block}
                        onQuestionClick={onQuestionClick}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {isLoading && (
            <div>
              <LoadingDots className="w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

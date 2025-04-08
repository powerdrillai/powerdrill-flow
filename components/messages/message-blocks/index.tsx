"use client";

import { AnswerBlock } from "@/services/powerdrill/session.service";

import { ImageBlockComponent } from "./image-block";
import { MessageMarkdown } from "./message-markdown";
import { QuestionsBlockComponent } from "./questions-block";
import { SourcesBlockComponent } from "./sources-block";
import { TableBlockComponent } from "./table-block";

type BlockProps = {
  block: AnswerBlock;
};

interface MessageBlockProps extends BlockProps {
  isLast?: boolean;
  isCanvas?: boolean;
  onQuestionClick?: (question: string) => void;
  onBlockPreview?: (block: AnswerBlock) => void;
}

export default function MessageBlocks({
  block,
  isLast,
  isCanvas = false,
  onQuestionClick,
  onBlockPreview,
}: MessageBlockProps) {
  switch (block.type) {
    case "MESSAGE":
    case "CODE":
      return <MessageMarkdown content={block.content} />;

    case "TABLE":
      return (
        <TableBlockComponent
          isCanvas={isCanvas}
          block={block}
          onBlockPreview={onBlockPreview}
        />
      );

    case "IMAGE":
      return <ImageBlockComponent block={block} />;

    case "SOURCES":
      return <SourcesBlockComponent block={block} />;

    case "QUESTIONS":
      return (
        <QuestionsBlockComponent
          block={block}
          isLast={isLast}
          onQuestionClick={onQuestionClick}
        />
      );

    default:
      return null;
  }
}

"use client";

import {
  CodeBlock,
  ImageBlock,
  MessageBlock as MessageBlockType,
  QuestionsBlock,
  SourcesBlock,
  TableBlock,
  TaskBlock,
} from "@/services/powerdrill/session.service";

import { ImageBlockComponent } from "./image-block";
import { MessageMarkdown } from "./message-markdown";
import { QuestionsBlockComponent } from "./questions-block";
import { SourcesBlockComponent } from "./sources-block";
import { TableBlockComponent } from "./table-block";

type BlockProps = {
  block:
    | MessageBlockType
    | CodeBlock
    | TableBlock
    | ImageBlock
    | SourcesBlock
    | QuestionsBlock
    | TaskBlock;
};

interface MessageBlockProps extends BlockProps {
  isLast?: boolean;
  isCanvas?: boolean;
  onQuestionClick?: (question: string) => void;
}

export default function MessageBlocks({
  block,
  isLast,
  isCanvas = false,
  onQuestionClick,
}: MessageBlockProps) {
  switch (block.type) {
    case "MESSAGE":
    case "CODE":
      return <MessageMarkdown content={block.content} />;

    case "TABLE":
      return (
        <TableBlockComponent isCanvas={isCanvas} block={block as TableBlock} />
      );

    case "IMAGE":
      return <ImageBlockComponent block={block as ImageBlock} />;

    case "SOURCES":
      return <SourcesBlockComponent block={block as SourcesBlock} />;

    case "QUESTIONS":
      return (
        <QuestionsBlockComponent
          block={block as QuestionsBlock}
          isLast={isLast}
          onQuestionClick={onQuestionClick}
        />
      );

    default:
      return null;
  }
}

"use client";

import {
  SourceContent,
  SourcesBlock,
} from "@/services/powerdrill/session.service";

interface SourcesBlockProps {
  block: SourcesBlock;
}

export function SourcesBlockComponent({ block }: SourcesBlockProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {block.content.map((source: SourceContent, index: number) => (
          <div
            key={index}
            className="bg-muted w-fit rounded-full p-1 px-1.5 text-xs font-medium"
          >
            {source.source}
          </div>
        ))}
      </div>
    </div>
  );
}

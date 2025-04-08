"use client";

import { FormEvent } from "react";

import { useSessionStore } from "@/store/session-store";
import { SelectedDataset } from "@/types/data";

import { DatasetInfo } from "./dataset-info";
import { ExplorationQuestions } from "./exploration-questions";
import { useDatasetOverview } from "./hooks/use-dataset-overview";
import { MessageInput } from "./message-input";
import { Toolbar } from "./toolbar";

interface ChatInputProps {
  input?: string;
  isLoading: boolean;
  sessionId: string;
  onInputChange?: (value: string) => void;
  onQuestionClick: (question: string) => void;
  onSubmit: (e?: FormEvent) => void;
}

export default function ChatInput({
  input,
  isLoading,
  sessionId,
  onSubmit,
  onInputChange,
  onQuestionClick,
}: ChatInputProps) {
  const { sessionMap, setDataset } = useSessionStore();
  const session = sessionMap[sessionId];
  const isDatasetSynced =
    session?.selectedDataset?.datasource.every(
      (source) => source.status === "synched"
    ) || session?.selectedDataset?.datasource.length === 0;
  const datasetOverview = useDatasetOverview(
    isDatasetSynced ? session?.selectedDataset?.id : undefined
  );

  // Handle dataset change
  const handleDatasetChange = (dataset: SelectedDataset | null) => {
    setDataset(sessionId, dataset);
  };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[95%] flex-col rounded-xl border bg-white shadow-sm">
      {/* Dataset display row */}
      <DatasetInfo
        dataset={session?.selectedDataset}
        onChange={handleDatasetChange}
      />

      {/* Related questions row */}
      <ExplorationQuestions
        questions={datasetOverview?.exploration_questions || []}
        onQuestionClick={onQuestionClick}
      />

      {/* Input field row */}
      <div className="px-4 pt-2">
        <MessageInput
          value={input || ""}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
        />
      </div>

      {/* Toolbar row */}
      <Toolbar
        onSubmit={() => onSubmit()}
        isLoading={isLoading}
        hasInput={!!input?.trim()}
        sessionId={sessionId}
      />
    </div>
  );
}

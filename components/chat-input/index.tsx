"use client";

import { FormEvent, useEffect } from "react";

import { useDatasetEventsStore } from "@/store/dataset-events-store";
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

  // Get the dataset events from the store
  const {
    deletedDatasetId,
    deletedDataSourceInfo,
    setDeletedDataSourceInfo,
    setDeletedDatasetId,
  } = useDatasetEventsStore();

  // Listen for dataset deletion events
  useEffect(() => {
    if (deletedDatasetId && session?.selectedDataset?.id === deletedDatasetId) {
      // If the deleted dataset is the currently selected dataset, clear it
      setDataset(sessionId, null);
      // Reset the deletedDatasetId to prevent infinite loops
      setDeletedDatasetId(null);
    }
  }, [
    deletedDatasetId,
    session?.selectedDataset?.id,
    sessionId,
    setDataset,
    setDeletedDatasetId,
  ]);

  // Listen for data source deletion events
  useEffect(() => {
    if (
      deletedDataSourceInfo &&
      session?.selectedDataset?.id === deletedDataSourceInfo.datasetId
    ) {
      // If the deleted data source belongs to the currently selected dataset
      const updatedDatasources = session.selectedDataset.datasource.filter(
        (source) => source.id !== deletedDataSourceInfo.dataSourceId
      );

      if (updatedDatasources.length === 0) {
        // If no data sources remain, clear the dataset
        setDataset(sessionId, null);
      } else {
        // Otherwise, update the dataset with the remaining data sources
        setDataset(sessionId, {
          ...session.selectedDataset,
          datasource: updatedDatasources,
        });
      }

      // Reset the deletedDataSourceInfo to prevent infinite loops
      setDeletedDataSourceInfo(null);
    }
  }, [
    deletedDataSourceInfo,
    session,
    sessionId,
    setDataset,
    setDeletedDataSourceInfo,
  ]);

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
    <div className="bg-background mx-auto flex w-full max-w-[95%] flex-col rounded-xl border shadow-sm">
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
      <div className="px-4 py-1">
        <MessageInput
          value={input || ""}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          datasetId={session?.selectedDataset?.id}
          datasetName={session?.selectedDataset?.name}
        />
      </div>

      {/* Toolbar row */}
      <Toolbar
        onSubmit={() => onSubmit()}
        isLoading={isLoading}
        hasInput={!!input?.trim()}
        sessionId={sessionId}
        datasetId={session?.selectedDataset?.id}
        datasetName={session?.selectedDataset?.name}
      />
    </div>
  );
}

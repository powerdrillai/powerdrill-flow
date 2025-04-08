"use client";

import { toast } from "sonner";

import { DatasetCard } from "@/components/dataset-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatasets } from "@/hooks/useDatasets";
import { useSessionStore } from "@/store/session-store";
import { DatasetRecord } from "@/types/data";

export function DatasetList({ sessionId = "home" }: { sessionId?: string }) {
  const { datasets, isLoading } = useDatasets();
  const { setDataset } = useSessionStore();

  const handleSelectDataset = (dataset: DatasetRecord) => {
    // Set the selected dataset in the session store
    setDataset(sessionId, {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      summary: dataset.summary,
      exploration_questions: dataset.exploration_questions,
      keywords: dataset.keywords,
      datasource: [],
    });

    // Notify the user that the dataset was selected
    toast.success(`Dataset ${dataset.name} selected`);
  };

  if (isLoading) {
    return (
      <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="text-muted-foreground mt-6 text-center">
        No datasets found. Upload a file to create a dataset.
      </div>
    );
  }

  return (
    <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => (
        <DatasetCard
          key={dataset.id}
          dataset={dataset}
          onClick={handleSelectDataset}
        />
      ))}
    </div>
  );
}

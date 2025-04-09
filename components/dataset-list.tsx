"use client";

import { toast } from "sonner";

import { DatasetCard } from "@/components/dataset-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatasets } from "@/hooks/useDatasets";
import { listDataSources } from "@/services/powerdrill/datasource.service";
import { useSessionStore } from "@/store/session-store";
import { DatasetRecord } from "@/types/data";

export function DatasetList({ sessionId = "home" }: { sessionId?: string }) {
  const { datasets, isLoading } = useDatasets();
  const { setDataset } = useSessionStore();

  const handleSelectDataset = async (dataset: DatasetRecord) => {
    try {
      // First set the dataset with empty datasource to show immediate feedback
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

      // Fetch data sources for the selected dataset
      const result = await listDataSources(dataset.id, { page_size: 100 });

      // Update the dataset with the fetched data sources
      if (result && result.records) {
        setDataset(sessionId, {
          id: dataset.id,
          name: dataset.name,
          description: dataset.description,
          summary: dataset.summary,
          exploration_questions: dataset.exploration_questions,
          keywords: dataset.keywords,
          datasource: result.records.map((source) => ({
            ...source,
            dataset_id: dataset.id,
          })),
        });

        // Scroll to top after data sources are loaded
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data sources:", error);
      // The dataset is already selected, so we don't need to show an error toast
    }
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

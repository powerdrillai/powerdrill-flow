"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";

import { DatasetCard } from "@/components/dataset-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatasets } from "@/hooks/useDatasets";
import { listDataSources } from "@/services/powerdrill/datasource.service";
import { useSessionStore } from "@/store/session-store";
import { DatasetRecord } from "@/types/data";

export interface DatasetListProps {
  sessionId?: string;
  pageSize?: number;
}

export function DatasetList({
  sessionId = "home",
  pageSize = 12,
}: DatasetListProps) {
  const { datasets, isLoading, pagination, refetch } = useDatasets({ pageSize });
  const { setDataset } = useSessionStore();
  const queryClient = useQueryClient();

  // Scroll to top when page changes
  useEffect(() => {
    const container = document.querySelector(".dataset-list-container");
    const containerTop = container?.getBoundingClientRect().top;

    window.scrollTo({
      top: containerTop ? containerTop + window.scrollY - 100 : 0,
      behavior: "smooth",
    });
  }, [pagination.currentPage]);

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
      <div className="dataset-list-container">
        <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (datasets.length === 0 && pagination.totalItems === 0) {
    return (
      <div className="dataset-list-container">
        <div className="text-muted-foreground mt-6 text-center">
          No datasets found. Upload a file to create a dataset.
        </div>
      </div>
    );
  }

  // Handle dataset deletion
  const handleDeleteDataset = async (datasetId: string) => {
    // Invalidate datasets query to refresh the list
    await queryClient.invalidateQueries({ queryKey: ["datasets"] });
    // Refetch datasets
    refetch();
  };

  return (
    <div className="dataset-list-container space-y-6">
      <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            onClick={handleSelectDataset}
            onDelete={handleDeleteDataset}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.changePage}
          />
        </div>
      )}

      {/* Dataset count */}
      <div className="text-muted-foreground text-center text-sm">
        Showing {datasets.length} of {pagination.totalItems} datasets
      </div>
    </div>
  );
}

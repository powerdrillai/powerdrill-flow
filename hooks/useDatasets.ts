import { useQueries, useQuery } from "@tanstack/react-query";

import {
  getDatasetOverview,
  listDatasets,
} from "@/services/powerdrill/dataset.service";
import { DatasetRecord } from "@/types/data";

export function useDatasets() {
  // First fetch the list of datasets
  const {
    data: basicDatasets,
    isLoading: isLoadingBasic,
    error: basicError,
  } = useQuery({
    queryKey: ["datasets-list"],
    queryFn: async () => {
      const result = await listDatasets({ page_size: 100 });
      return result.records;
    },
  });

  // Then fetch overview data for each dataset to get summary information
  const overviewQueries = useQueries({
    queries: (basicDatasets || []).map((dataset) => ({
      queryKey: ["dataset-overview", dataset.id],
      queryFn: async () => {
        try {
          const overview = await getDatasetOverview(dataset.id);
          return {
            ...dataset,
            summary: overview.summary,
            exploration_questions: overview.exploration_questions,
            keywords: overview.keywords || [],
          } as DatasetRecord;
        } catch (error) {
          console.error(
            `Failed to fetch overview for dataset ${dataset.id}:`,
            error
          );
          return dataset; // Return original dataset if overview fetch fails
        }
      },
      enabled: !!basicDatasets?.length,
    })),
  });

  // Check if any overview queries are still loading
  const isLoadingOverviews = overviewQueries.some((query) => query.isLoading);

  // Combine all errors
  const overviewError = overviewQueries.find((query) => query.error)?.error;

  // Get datasets with overview data when available
  const enrichedDatasets =
    !isLoadingOverviews && overviewQueries.length > 0
      ? overviewQueries
          .map((query) => query.data as DatasetRecord)
          .filter(Boolean)
      : basicDatasets || [];
  return {
    datasets: enrichedDatasets,
    isLoading: isLoadingBasic || isLoadingOverviews,
    error: basicError || overviewError,
    refetch: () => {
      // Refetch both the basic list and all overviews
      const basicPromise = basicDatasets
        ? Promise.resolve(basicDatasets)
        : listDatasets({ page_size: 100 }).then((result) => result.records);

      return basicPromise.then((datasets) => {
        datasets.forEach((dataset) => {
          getDatasetOverview(dataset.id).catch((error) => {
            console.error(
              `Failed to refetch overview for dataset ${dataset.id}:`,
              error
            );
          });
        });
      });
    },
  };
}

import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  getDatasetOverview,
  listDatasets,
  ListDatasetsParams,
} from "@/services/powerdrill/dataset.service";
import { DatasetListResult, DatasetRecord } from "@/types/data";

export interface UseDatasetsOptions {
  pageSize?: number;
  initialPage?: number;
}

export function useDatasets(options: UseDatasetsOptions = {}) {
  const { pageSize = 12, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // First fetch the list of datasets with pagination
  const {
    data: datasetsResult,
    isLoading: isLoadingBasic,
    error: basicError,
    refetch: refetchDatasets,
  } = useQuery({
    queryKey: ["datasets-list", currentPage, pageSize],
    queryFn: async () => {
      const params: ListDatasetsParams = {
        page_number: currentPage,
        page_size: pageSize,
      };
      const result = await listDatasets(params);

      // Update pagination state
      setTotalItems(result.total_items);
      setTotalPages(Math.ceil(result.total_items / pageSize));

      return result;
    },
  });

  // Extract basic dataset records
  const basicDatasets = datasetsResult?.records || [];

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
  // Function to change page
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    datasets: enrichedDatasets,
    isLoading: isLoadingBasic || isLoadingOverviews,
    error: basicError || overviewError,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      changePage,
    },
    refetch: () => {
      // Refetch the datasets list with current pagination
      return refetchDatasets();
    },
  };
}

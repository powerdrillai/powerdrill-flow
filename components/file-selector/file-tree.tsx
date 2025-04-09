"use client";

import {
  useIsFetching,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  deleteDataset,
  listDatasets,
} from "@/services/powerdrill/dataset.service";
import { listDataSources } from "@/services/powerdrill/datasource.service";
import { useDatasetEventsStore } from "@/store/dataset-events-store";
import { useSessionStore } from "@/store/session-store";
import { DataSourceRecord, SelectedDataset } from "@/types/data";

import { Button } from "../ui/button";
import { FileBadge } from "./file-badge";

interface FileTreeProps {
  onSelect: (selected: SelectedDataset | null) => void;
}

export function FileTree({ onSelect }: FileTreeProps) {
  // Get the session store
  const { sessionMap } = useSessionStore();
  // Currently selected dataset
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  // Currently selected data source list
  const [selectedDatasources, setSelectedDatasources] = useState<Set<string>>(
    new Set()
  );
  // Track dataset IDs that have already fetched data sources
  const fetchedDatasetsRef = useRef<Set<string>>(new Set());

  // Check if data sources are being fetched
  const isFetchingDataSources = useIsFetching({ queryKey: ["datasources"] });
  // Track expanded datasets
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(
    new Set()
  );
  // Dataset-datasource mapping, used to record the list of data sources under each dataset
  const [datasetSourcesMap, setDatasetSourcesMap] = useState<
    Record<string, DataSourceRecord[]>
  >({});

  // Get the event setters and data from the dataset events store
  const {
    setDeletedDatasetId,
    deletedDataSourceInfo,
    setDeletedDataSourceInfo,
    createdDataSourceInfo,
    setCreatedDataSourceInfo,
  } = useDatasetEventsStore();

  // State for delete confirmation dialog
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query client for invalidating queries
  const queryClient = useQueryClient();

  // Use TanStack Query to fetch dataset list
  const {
    data: datasetsData,
    isLoading: isLoadingDatasets,
    error: datasetsError,
  } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const result = await listDatasets({ page_size: 100 });
      return result.records;
    },
  });

  // Use useQueries to fetch multiple data sources in parallel
  const datasourceQueries = useQueries({
    queries: Array.from(expandedDatasets).map((datasetId) => ({
      queryKey: ["datasources", datasetId],
      queryFn: async () => {
        const result = await listDataSources(datasetId, { page_size: 100 });
        return result.records;
      },
      // Enable query when dataset is expanded
      enabled: expandedDatasets.has(datasetId),
      // Add dataset ID to fetched list after successful query
      onSuccess: (data: DataSourceRecord[]) => {
        fetchedDatasetsRef.current.add(datasetId);
        // Update dataset-datasource mapping
        setDatasetSourcesMap((prev) => ({
          ...prev,
          [datasetId]: data,
        }));
      },
      // Allow refetching after 30 seconds
      staleTime: 30 * 1000,
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    })),
  });

  // Synchronize query results to datasetSourcesMap
  useEffect(() => {
    const newMap = { ...datasetSourcesMap };
    let hasChanges = false;

    Array.from(expandedDatasets).forEach((datasetId, index) => {
      const query = datasourceQueries[index];
      if (query && query.data && !datasetSourcesMap[datasetId]) {
        newMap[datasetId] = query.data as DataSourceRecord[];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setDatasetSourcesMap(newMap);
    }
  }, [datasourceQueries, expandedDatasets, datasetSourcesMap]);

  // Listen for data source creation events
  useEffect(() => {
    if (createdDataSourceInfo && createdDataSourceInfo.datasetId) {
      // Remove from fetched datasets to force refetch
      fetchedDatasetsRef.current.delete(createdDataSourceInfo.datasetId);

      // Clear the dataset sources map for this dataset
      setDatasetSourcesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[createdDataSourceInfo.datasetId];
        return newMap;
      });

      // Invalidate query to force refetch
      queryClient.invalidateQueries({
        queryKey: ["datasources", createdDataSourceInfo.datasetId],
      });

      // Ensure dataset is expanded
      if (!expandedDatasets.has(createdDataSourceInfo.datasetId)) {
        setExpandedDatasets(
          new Set([...expandedDatasets, createdDataSourceInfo.datasetId])
        );
      }

      // Reset the createdDataSourceInfo to prevent infinite loops
      setCreatedDataSourceInfo(null);
    }
  }, [
    createdDataSourceInfo,
    expandedDatasets,
    queryClient,
    setCreatedDataSourceInfo,
    setDatasetSourcesMap,
  ]);

  // Listen for data source deletion events
  useEffect(() => {
    if (deletedDataSourceInfo && deletedDataSourceInfo.datasetId) {
      // Remove from fetched datasets to force refetch
      fetchedDatasetsRef.current.delete(deletedDataSourceInfo.datasetId);

      // Clear the dataset sources map for this dataset
      setDatasetSourcesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[deletedDataSourceInfo.datasetId];
        return newMap;
      });

      // Invalidate query to force refetch
      queryClient.invalidateQueries({
        queryKey: ["datasources", deletedDataSourceInfo.datasetId],
      });

      // Ensure dataset is expanded
      if (!expandedDatasets.has(deletedDataSourceInfo.datasetId)) {
        setExpandedDatasets(
          new Set([...expandedDatasets, deletedDataSourceInfo.datasetId])
        );
      }

      // Also clean up the session store
      Object.entries(sessionMap).forEach(([sessionId, session]) => {
        if (session.selectedDataset?.id === deletedDataSourceInfo.datasetId) {
          // Filter out the deleted data source
          const updatedDatasources = session.selectedDataset.datasource.filter(
            (ds) => ds.id !== deletedDataSourceInfo.dataSourceId
          );

          // Update the session store
          if (
            updatedDatasources.length !==
            session.selectedDataset.datasource.length
          ) {
            const updatedDataset = {
              ...session.selectedDataset,
              datasource: updatedDatasources,
            };

            // Update the session store
            useSessionStore.getState().setDataset(sessionId, updatedDataset);
          }
        }
      });

      // Reset the deletedDataSourceInfo to prevent infinite loops
      setDeletedDataSourceInfo(null);
    }
  }, [
    deletedDataSourceInfo,
    expandedDatasets,
    queryClient,
    setDeletedDataSourceInfo,
    setDatasetSourcesMap,
    sessionMap,
  ]);

  // Force a refresh of all datasets when the component mounts
  useEffect(() => {
    // Get all datasets from the session store
    const datasetIds = new Set<string>();

    // Add datasets from the session store
    Object.values(sessionMap).forEach((session) => {
      if (session.selectedDataset?.id) {
        datasetIds.add(session.selectedDataset.id);
      }
    });

    // Refresh each dataset
    datasetIds.forEach((datasetId) => {
      handleRefreshDataSources(datasetId);
    });

    // Also check for any datasets that are currently expanded
    expandedDatasets.forEach((datasetId) => {
      if (!datasetIds.has(datasetId)) {
        handleRefreshDataSources(datasetId);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a mapping for easy access to query results by datasetId
  const datasourceQueriesMap: Record<
    string,
    {
      data?: DataSourceRecord[];
      isLoading: boolean;
      error: unknown;
    }
  > = {};

  Array.from(expandedDatasets).forEach((datasetId, index) => {
    const query = datasourceQueries[index];
    if (query) {
      datasourceQueriesMap[datasetId] = {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
      };
    }
  });

  // Handle dataset expand/collapse
  const handleDatasetExpand = (datasetId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const newExpandedDatasets = new Set(expandedDatasets);

    if (newExpandedDatasets.has(datasetId)) {
      newExpandedDatasets.delete(datasetId);
    } else {
      newExpandedDatasets.add(datasetId);

      // When expanding a dataset, always refresh its data sources
      // This ensures we always have the latest data
      handleRefreshDataSources(datasetId);

      // Also force a refresh of the dataset in the session store
      // This ensures we're not showing deleted data sources
      Object.entries(sessionMap).forEach(([sessionId, session]) => {
        if (session.selectedDataset?.id === datasetId) {
          // Force a refresh by setting the dataset again
          // This will trigger a re-render with the latest data
          const updatedDataset = { ...session.selectedDataset };
          useSessionStore.getState().setDataset(sessionId, updatedDataset);
        }
      });
    }

    setExpandedDatasets(newExpandedDatasets);
  };

  // Handle refresh data sources
  const handleRefreshDataSources = async (
    datasetId: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();

    // Remove from fetched datasets to force refetch
    fetchedDatasetsRef.current.delete(datasetId);

    // Clear the dataset sources map for this dataset
    setDatasetSourcesMap((prev) => {
      const newMap = { ...prev };
      delete newMap[datasetId];
      return newMap;
    });

    // Invalidate query to force refetch
    await queryClient.invalidateQueries({
      queryKey: ["datasources", datasetId],
    });

    // Ensure dataset is expanded
    if (!expandedDatasets.has(datasetId)) {
      setExpandedDatasets(new Set([...expandedDatasets, datasetId]));
    }
  };

  // Check if all data sources in the dataset are selected
  const isDatasetFullySelected = (datasetId: string) => {
    const datasources = datasetSourcesMap[datasetId];
    // For empty datasets, consider them selected if the dataset ID matches the selected dataset
    if (!datasources || !Array.isArray(datasources) || datasources.length === 0)
      return selectedDataset === datasetId;

    return datasources.every((ds) => selectedDatasources.has(ds.id));
  };

  // Check if the dataset is partially selected (some data sources are selected)
  const isDatasetPartiallySelected = (datasetId: string) => {
    const datasources = datasetSourcesMap[datasetId];
    // Empty datasets can't be partially selected
    if (!datasources || !Array.isArray(datasources) || datasources.length === 0)
      return false;

    const hasSelected = datasources.some((ds) =>
      selectedDatasources.has(ds.id)
    );
    return hasSelected && !isDatasetFullySelected(datasetId);
  };

  // Handle dataset selection
  const handleDatasetSelect = (datasetId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // If clicking on the currently fully selected dataset, clear all selections
    // For empty datasets, we need to check if the dataset is already selected
    if (
      selectedDataset === datasetId &&
      (isDatasetFullySelected(datasetId) ||
        !datasetSourcesMap[datasetId] ||
        !Array.isArray(datasetSourcesMap[datasetId]) ||
        datasetSourcesMap[datasetId].length === 0)
    ) {
      setSelectedDataset(null);
      setSelectedDatasources(new Set());
      onSelect(null);
      return;
    }

    // Get all data sources under the dataset
    const datasources =
      datasetSourcesMap[datasetId] ||
      datasourceQueriesMap[datasetId]?.data ||
      [];

    // Set new selected dataset
    setSelectedDataset(datasetId);

    if (datasources && Array.isArray(datasources) && datasources.length > 0) {
      // Select all data sources under this dataset
      const newSelectedDatasources = new Set(datasources.map((ds) => ds.id));
      setSelectedDatasources(newSelectedDatasources);

      // Build selected item
      const dataset = datasetsData?.find((d) => d.id === datasetId);

      if (dataset) {
        onSelect({
          ...dataset,
          datasource: datasources,
        });
      }
    } else {
      // If data sources list hasn't been fetched yet, only select the dataset
      setSelectedDatasources(new Set());

      // Build selected item
      const dataset = datasetsData?.find((d) => d.id === datasetId);

      if (dataset) {
        onSelect({
          ...dataset,
          datasource: [],
        });
      }

      // If dataset is not expanded, automatically expand it to load data sources
      if (!expandedDatasets.has(datasetId)) {
        setExpandedDatasets(new Set([...expandedDatasets, datasetId]));
      }
    }
  };

  // Handle data source selection
  const handleDatasourceSelect = (
    datasourceId: string,
    datasetId: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();

    // If selecting a data source from a different dataset, clear previous selections
    if (selectedDataset !== datasetId) {
      setSelectedDataset(datasetId);
      setSelectedDatasources(new Set([datasourceId]));
    } else {
      // Update selected data sources
      const newSelectedDatasources = new Set(selectedDatasources);

      if (newSelectedDatasources.has(datasourceId)) {
        newSelectedDatasources.delete(datasourceId);
      } else {
        newSelectedDatasources.add(datasourceId);
      }

      setSelectedDatasources(newSelectedDatasources);
    }

    // Build selected item
    const dataset = datasetsData?.find((d) => d.id === datasetId);
    const selectedDatasourcesList = Array.from(
      selectedDataset === datasetId
        ? selectedDatasources.has(datasourceId)
          ? new Set(
              [...selectedDatasources].filter((id) => id !== datasourceId)
            )
          : new Set([...selectedDatasources, datasourceId])
        : new Set([datasourceId])
    );

    let datasourcesForDataset =
      datasetSourcesMap[datasetId] ||
      datasourceQueriesMap[datasetId]?.data ||
      [];

    // Ensure datasourcesForDataset is an array
    if (!Array.isArray(datasourcesForDataset)) {
      datasourcesForDataset = [];
    }
    const selectedDatasourcesData = selectedDatasourcesList
      .map((dsId) => {
        if (!datasourcesForDataset || !Array.isArray(datasourcesForDataset))
          return undefined;
        return datasourcesForDataset.find((ds) => ds && ds.id === dsId);
      })
      .filter((ds): ds is DataSourceRecord => ds !== undefined);

    if (dataset) {
      onSelect({
        ...dataset,
        datasource: selectedDatasourcesData,
      });
    }
  };

  if (isLoadingDatasets) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (datasetsError) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to fetch datasets, please try again later
      </div>
    );
  }

  return (
    <>
      <Accordion
        type="multiple"
        value={Array.from(expandedDatasets)}
        onValueChange={(values) => {
          setExpandedDatasets(new Set(values));
        }}
        className="space-y-1"
      >
        {datasetsData?.map((dataset) => (
          <AccordionItem
            key={dataset.id}
            value={dataset.id}
            className="border-0"
          >
            <div className="flex items-center gap-2 rounded-md px-2">
              {/* Expand/Collapse button */}
              <Button
                onClick={(e) => handleDatasetExpand(dataset.id, e)}
                variant="ghost"
                size="icon"
                className="size-6"
              >
                {expandedDatasets.has(dataset.id) ? (
                  <ChevronDownIcon className="size-4" />
                ) : (
                  <ChevronRightIcon className="size-4" />
                )}
              </Button>

              {/* Dataset checkbox */}
              <Checkbox
                checked={isDatasetFullySelected(dataset.id)}
                className={cn(
                  isDatasetPartiallySelected(dataset.id) &&
                    "bg-primary/30 text-primary-foreground"
                )}
                onCheckedChange={() => handleDatasetSelect(dataset.id)}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Dataset title */}
              <div
                className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium"
                onClick={() => handleDatasetSelect(dataset.id)}
              >
                {expandedDatasets.has(dataset.id) ? (
                  <FolderOpenIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <FolderIcon className="h-4 w-4 text-blue-500" />
                )}
                <span className="truncate">{dataset.name}</span>

                {/* Refresh button */}
                <div onClick={(e) => e.stopPropagation()} className="ml-1">
                  <TooltipWrapper title="Refresh data sources">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary h-5 w-5"
                      onClick={(e) => handleRefreshDataSources(dataset.id, e)}
                    >
                      {isFetchingDataSources ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </TooltipWrapper>
                </div>
              </div>

              {/* Delete dataset button */}
              <div onClick={(e) => e.stopPropagation()}>
                <TooltipWrapper title="Delete dataset">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDatasetToDelete(dataset.id);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" x2="10" y1="11" y2="17"></line>
                      <line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                    <span className="sr-only">Delete</span>
                  </Button>
                </TooltipWrapper>
              </div>
            </div>

            <AccordionContent className="pb-0">
              {datasourceQueriesMap[dataset.id]?.isLoading ? (
                <div className="py-14">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="my-1 h-6 w-full" />
                  ))}
                </div>
              ) : (datasetSourcesMap[dataset.id] &&
                  Array.isArray(datasetSourcesMap[dataset.id]) &&
                  datasetSourcesMap[dataset.id].length > 0) ||
                (datasourceQueriesMap[dataset.id]?.data &&
                  datasourceQueriesMap[dataset.id]?.data?.length > 0) ||
                // Check if there are temporary data sources in the session store
                // Only consider data sources that are in the "creating" or "synching" state
                // AND only if the dataset is expanded (to ensure we've checked the backend)
                (expandedDatasets.has(dataset.id) &&
                  Object.values(sessionMap).some(
                    (session) =>
                      session.selectedDataset?.id === dataset.id &&
                      Array.isArray(session.selectedDataset.datasource) &&
                      session.selectedDataset.datasource.filter(
                        (ds) =>
                          ds.status === "creating" || ds.status === "synching"
                      ).length > 0
                  )) ? (
                <div className="space-y-2 py-2 pl-14">
                  {(() => {
                    // First check if there are data sources in the datasetSourcesMap
                    // These are the most reliable as they come directly from the backend
                    if (
                      datasetSourcesMap[dataset.id] &&
                      Array.isArray(datasetSourcesMap[dataset.id]) &&
                      datasetSourcesMap[dataset.id].length > 0
                    ) {
                      return datasetSourcesMap[dataset.id];
                    }

                    // Then check if there are data sources in the datasourceQueriesMap
                    if (
                      datasourceQueriesMap[dataset.id]?.data &&
                      datasourceQueriesMap[dataset.id]?.data?.length > 0
                    ) {
                      return datasourceQueriesMap[dataset.id]?.data || [];
                    }

                    // Finally check if there are temporary data sources in the session store
                    // Only show these if they're in the "creating" or "synching" state
                    // This prevents showing deleted data sources that might still be in the session store
                    const sessionWithDataset = Object.values(sessionMap).find(
                      (session) =>
                        session.selectedDataset?.id === dataset.id &&
                        Array.isArray(session.selectedDataset.datasource) &&
                        session.selectedDataset.datasource.length > 0
                    );

                    if (
                      sessionWithDataset &&
                      sessionWithDataset.selectedDataset
                    ) {
                      // Only show data sources that are in the "creating" or "synching" state
                      // This prevents showing deleted data sources
                      const tempDataSources =
                        sessionWithDataset.selectedDataset.datasource.filter(
                          (ds) =>
                            ds.status === "creating" || ds.status === "synching"
                        );

                      if (tempDataSources.length > 0) {
                        return tempDataSources;
                      }
                    }

                    return [];
                  })().map((datasource) => {
                    return (
                      <div
                        key={datasource.id}
                        className={cn(
                          "flex h-6 items-center gap-2 rounded-md px-2",
                          selectedDatasources.has(datasource.id) &&
                            "bg-accent text-accent-foreground"
                        )}
                        onClick={(e) =>
                          handleDatasourceSelect(datasource.id, dataset.id, e)
                        }
                      >
                        <Checkbox
                          checked={selectedDatasources.has(datasource.id)}
                          onCheckedChange={() =>
                            handleDatasourceSelect(datasource.id, dataset.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <FileBadge name={datasource.name} />
                        <span className="text-primary/70 truncate text-sm font-medium">
                          {datasource.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground px-2 py-2 pl-14 text-sm">
                  No data sources
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}

        {(!datasetsData || datasetsData.length === 0) && (
          <div className="text-muted-foreground py-4 text-center">
            No available datasets
          </div>
        )}
      </Accordion>

      {/* Delete dataset confirmation dialog */}
      <AlertDialog
        open={datasetToDelete !== null}
        onOpenChange={(open) => !open && setDatasetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dataset? This action cannot
              be undone. All data sources in this dataset will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!datasetToDelete) return;

                try {
                  setIsDeleting(true);
                  await deleteDataset(datasetToDelete);

                  // Clear selection if the deleted dataset was selected
                  if (selectedDataset === datasetToDelete) {
                    setSelectedDataset(null);
                    setSelectedDatasources(new Set());
                    onSelect(null);
                  }

                  // Remove from expanded datasets
                  if (expandedDatasets.has(datasetToDelete)) {
                    const newExpandedDatasets = new Set(expandedDatasets);
                    newExpandedDatasets.delete(datasetToDelete);
                    setExpandedDatasets(newExpandedDatasets);
                  }

                  // Remove from fetched datasets
                  if (fetchedDatasetsRef.current.has(datasetToDelete)) {
                    fetchedDatasetsRef.current.delete(datasetToDelete);
                  }

                  // Remove from dataset sources map
                  if (datasetSourcesMap[datasetToDelete]) {
                    const newMap = { ...datasetSourcesMap };
                    delete newMap[datasetToDelete];
                    setDatasetSourcesMap(newMap);
                  }

                  // Invalidate queries
                  await queryClient.invalidateQueries({
                    queryKey: ["datasets"],
                  });

                  // Emit dataset deletion event
                  setDeletedDatasetId(datasetToDelete);

                  appToast.success("Dataset deleted", {
                    description: "Dataset has been deleted successfully.",
                  });
                } catch (_error) {
                  appToast.error("Failed to delete dataset", {
                    description:
                      "There was an error deleting the dataset. Please try again.",
                  });
                } finally {
                  setIsDeleting(false);
                  setDatasetToDelete(null);
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

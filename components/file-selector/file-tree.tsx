"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  Loader2,
  Trash2,
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
import { deleteDataset, listDatasets } from "@/services/powerdrill/dataset.service";
import { deleteDataSource, listDataSources } from "@/services/powerdrill/datasource.service";
import { DataSourceRecord, SelectedDataset } from "@/types/data";

import { Button } from "../ui/button";
import { FileBadge } from "./file-badge";

interface FileTreeProps {
  onSelect: (selected: SelectedDataset | null) => void;
}

export function FileTree({ onSelect }: FileTreeProps) {
  // Currently selected dataset
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  // Currently selected data source list
  const [selectedDatasources, setSelectedDatasources] = useState<Set<string>>(
    new Set()
  );
  // Track dataset IDs that have already fetched data sources
  const fetchedDatasetsRef = useRef<Set<string>>(new Set());
  // Track expanded datasets
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(
    new Set()
  );
  // Dataset-datasource mapping, used to record the list of data sources under each dataset
  const [datasetSourcesMap, setDatasetSourcesMap] = useState<
    Record<string, DataSourceRecord[]>
  >({});

  // State for delete confirmation dialogs
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [datasourceToDelete, setDatasourceToDelete] = useState<{
    id: string;
    datasetId: string;
    name: string;
  } | null>(null);
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
      // Only enable query when expanded and never loaded before
      enabled:
        expandedDatasets.has(datasetId) &&
        !fetchedDatasetsRef.current.has(datasetId),
      // Add dataset ID to fetched list after successful query
      onSuccess: (data: DataSourceRecord[]) => {
        fetchedDatasetsRef.current.add(datasetId);
        // Update dataset-datasource mapping
        setDatasetSourcesMap((prev) => ({
          ...prev,
          [datasetId]: data,
        }));
      },
      // Only fetch once
      staleTime: Infinity,
      cacheTime: Infinity,
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
    }

    setExpandedDatasets(newExpandedDatasets);
  };

  // Check if all data sources in the dataset are selected
  const isDatasetFullySelected = (datasetId: string) => {
    const datasources = datasetSourcesMap[datasetId];
    if (!datasources || datasources.length === 0) return false;

    return datasources?.every((ds) => selectedDatasources.has(ds.id));
  };

  // Check if the dataset is partially selected (some data sources are selected)
  const isDatasetPartiallySelected = (datasetId: string) => {
    const datasources = datasetSourcesMap[datasetId];
    if (!datasources || datasources.length === 0) return false;

    const hasSelected = datasources.some((ds) =>
      selectedDatasources.has(ds.id)
    );
    return hasSelected && !isDatasetFullySelected(datasetId);
  };

  // Handle dataset selection
  const handleDatasetSelect = (datasetId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // If clicking on the currently fully selected dataset, clear all selections
    if (selectedDataset === datasetId && isDatasetFullySelected(datasetId)) {
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

    if (datasources && datasources.length > 0) {
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

    const datasourcesForDataset =
      datasetSourcesMap[datasetId] ||
      datasourceQueriesMap[datasetId]?.data ||
      [];
    const selectedDatasourcesData = selectedDatasourcesList
      .map((dsId) => {
        if (!datasourcesForDataset) return undefined;
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
          <AccordionItem key={dataset.id} value={dataset.id} className="border-0">
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
              </div>

              {/* Delete dataset button */}
              <div onClick={(e) => e.stopPropagation()}>
                <TooltipWrapper title="Delete dataset">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDatasetToDelete(dataset.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
              ) : datasourceQueriesMap[dataset.id]?.error ? (
                <div className="px-2 py-2 text-sm text-red-500">
                  Failed to load data sources
                </div>
              ) : datasourceQueriesMap[dataset.id]?.data &&
                (datasourceQueriesMap[dataset.id]?.data?.length || 0) > 0 ? (
                <div className="space-y-2 py-2 pl-14">
                  {datasourceQueriesMap[dataset.id]?.data?.map((datasource) => {
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

                        {/* Delete data source button */}
                        <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                          <TooltipWrapper title="Delete data source">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDatasourceToDelete({
                                  id: datasource.id,
                                  datasetId: dataset.id,
                                  name: datasource.name,
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TooltipWrapper>
                        </div>
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
              Are you sure you want to delete this dataset? This action cannot be undone.
              All data sources in this dataset will also be deleted.
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
                  await queryClient.invalidateQueries({ queryKey: ["datasets"] });

                  appToast.success("Dataset deleted", {
                    description: "Dataset has been deleted successfully.",
                  });
                } catch (error) {
                  appToast.error("Failed to delete dataset", {
                    description: "There was an error deleting the dataset. Please try again.",
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

      {/* Delete data source confirmation dialog */}
      <AlertDialog
        open={datasourceToDelete !== null}
        onOpenChange={(open) => !open && setDatasourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the data source "{datasourceToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!datasourceToDelete) return;

                try {
                  setIsDeleting(true);
                  await deleteDataSource(datasourceToDelete.datasetId, datasourceToDelete.id);

                  // Remove from selected datasources if it was selected
                  if (selectedDatasources.has(datasourceToDelete.id)) {
                    const newSelectedDatasources = new Set(selectedDatasources);
                    newSelectedDatasources.delete(datasourceToDelete.id);
                    setSelectedDatasources(newSelectedDatasources);

                    // Update selected dataset if needed
                    if (newSelectedDatasources.size === 0) {
                      setSelectedDataset(null);
                      onSelect(null);
                    } else {
                      // Update the selected dataset with the remaining data sources
                      const dataset = datasetsData?.find(d => d.id === datasourceToDelete.datasetId);
                      if (dataset) {
                        const remainingDatasources = datasetSourcesMap[datasourceToDelete.datasetId]?.filter(
                          ds => newSelectedDatasources.has(ds.id)
                        ) || [];

                        onSelect({
                          ...dataset,
                          datasource: remainingDatasources,
                        });
                      }
                    }
                  }

                  // Update dataset sources map
                  if (datasetSourcesMap[datasourceToDelete.datasetId]) {
                    const newMap = { ...datasetSourcesMap };
                    newMap[datasourceToDelete.datasetId] = newMap[datasourceToDelete.datasetId].filter(
                      ds => ds.id !== datasourceToDelete.id
                    );
                    setDatasetSourcesMap(newMap);
                  }

                  // Invalidate queries
                  await queryClient.invalidateQueries({
                    queryKey: ["datasources", datasourceToDelete.datasetId]
                  });

                  appToast.success("Data source deleted", {
                    description: `Data source "${datasourceToDelete.name}" has been deleted successfully.`,
                  });
                } catch (error) {
                  appToast.error("Failed to delete data source", {
                    description: "There was an error deleting the data source. Please try again.",
                  });
                } finally {
                  setIsDeleting(false);
                  setDatasourceToDelete(null);
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

"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listDatasets } from "@/services/powerdrill/dataset.service";
import { listDataSources } from "@/services/powerdrill/datasource.service";
import { DataSourceRecord, SelectedDataset } from "@/types/data";

import { Button } from "../ui/button";
import { FileBadge } from "./file-badge";

interface FileTreeProps {
  onSelect: (selected: SelectedDataset | null) => void;
}

export default function FileTree({ onSelect }: FileTreeProps) {
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
  );
}

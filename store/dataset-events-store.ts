import { create } from "zustand";

interface DatasetEventsState {
  // Event for dataset deletion
  deletedDatasetId: string | null;
  setDeletedDatasetId: (id: string | null) => void;

  // Event for data source deletion
  deletedDataSourceInfo: {
    datasetId: string;
    dataSourceId: string;
  } | null;
  setDeletedDataSourceInfo: (info: { datasetId: string; dataSourceId: string } | null) => void;

  // Event for data source creation
  createdDataSourceInfo: {
    datasetId: string;
  } | null;
  setCreatedDataSourceInfo: (info: { datasetId: string } | null) => void;
}

export const useDatasetEventsStore = create<DatasetEventsState>((set) => ({
  // Dataset deletion event
  deletedDatasetId: null,
  setDeletedDatasetId: (id) => set({ deletedDatasetId: id }),

  // Data source deletion event
  deletedDataSourceInfo: null,
  setDeletedDataSourceInfo: (info) => set({ deletedDataSourceInfo: info }),

  // Data source creation event
  createdDataSourceInfo: null,
  setCreatedDataSourceInfo: (info) => set({ createdDataSourceInfo: info }),
}));

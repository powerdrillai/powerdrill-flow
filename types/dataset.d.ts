/**
 * Type definitions for dataset-related operations
 */

export interface CreateDatasetParams {
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface DatasetId {
  id: string;
}

export interface DatasetOverview {
  id: string;
  name: string;
  description: string;
  summary: string;
  exploration_questions: string[];
  keywords: string[];
}

export interface DatasetRecord {
  id: string;
  name: string;
  description: string;
}

export interface DatasetListResult {
  page_number: number;
  page_size: number;
  total_items: number;
  records: DatasetRecord[];
}

export interface DatasetStatus {
  total_count: number;
  succeeded_count: number;
  failed_count: number;
  processing_count: number;
  pending_count: number;
  data_sources: Array<{
    id: string;
    status: string;
    message?: string;
  }>;
}

export interface ListDatasetsParams {
  page_number?: number;
  page_size?: number;
  search?: string;
}

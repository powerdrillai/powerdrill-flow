/**
 * Type definitions for datasource-related operations
 */

export interface CreateDataSourceParams {
  name: string;
  file_object_key?: string;
  [key: string]: unknown;
}

export interface DataSourceRecord {
  id: string;
  dataset_id: string;
  name: string;
  type: string;
  status: string;
  size?: number;
}

export interface DataSourceListResult {
  page_number: number;
  page_size: number;
  total_items: number;
  records: DataSourceRecord[];
}

export interface ListDataSourcesParams {
  page_number?: number;
  page_size?: number;
  [key: string]: unknown;
}

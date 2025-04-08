// Dataset Type Definitions
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatasetRecord {
  id: string;
  name: string;
  description: string;
  summary?: string;
  exploration_questions?: string[];
  keywords?: string[];
  status?: "synched" | "invalid" | "synching";
}

export interface DatasetListResult {
  page_number: number;
  page_size: number;
  total_items: number;
  records: DatasetRecord[];
}

export interface ListDatasetsParams {
  page_number?: number;
  page_size?: number;
  search?: string;
}

// Data Source Type Definitions
export interface DataSource {
  id: string;
  name: string;
  dataset_id: string;
  type: string;
  status: string;
  size?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DataSourceRecord {
  id: string;
  dataset_id: string;
  name: string;
  type: string;
  status?: string;
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
}

export interface CustomDatasource extends DataSourceRecord {
  status?: string;
}

export interface SelectedDataset extends DatasetRecord {
  datasource: CustomDatasource[];
  isCreating?: boolean;
}

import { PowerdrillApiError } from "@/lib/api/errors";
import {
  serverDeleteData,
  serverFetchData,
  serverPostData,
} from "@/lib/api/serverApiClient";
import {
  CreateDataSourceParams,
  DataSourceListResult,
  DataSourceRecord,
  ListDataSourcesParams,
} from "@/types/datasource";

/**
 * Create data source
 * @param datasetId - Dataset ID
 * @param params - Parameters required for creating data source
 * @returns Returns the created data source information
 */
export async function createDataSource(
  datasetId: string,
  params: CreateDataSourceParams
): Promise<DataSourceRecord> {
  try {
    return await serverPostData<DataSourceRecord>(
      `/datasets/${datasetId}/datasources`,
      {
        ...params,
        type: "FILE",
      }
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to create data source");
  }
}

/**
 * Get data source
 * @param datasetId - Dataset ID
 * @param datasourceId - Data source ID
 * @param userId - User ID
 * @returns Returns detailed information about the data source
 */
export async function getDataSource(
  datasetId: string,
  datasourceId: string,
  userId: string = ""
): Promise<DataSourceRecord> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("user_id", userId);

    return await serverFetchData<DataSourceRecord>(
      `/datasets/${datasetId}/datasources/${datasourceId}?${queryParams.toString()}`
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to get data source");
  }
}

/**
 * List data sources
 * @param datasetId - Dataset ID
 * @param userId - User ID
 * @param params - Parameters required for listing data sources
 * @returns Returns data source list result
 */
export async function listDataSources(
  datasetId: string,
  params?: ListDataSourcesParams
): Promise<DataSourceListResult> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page_number)
      queryParams.append("page_number", params.page_number.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());

    const queryString = queryParams.toString();
    const endpoint = `/datasets/${datasetId}/datasources?${queryString}`;

    return await serverFetchData<DataSourceListResult>(endpoint);
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to list data sources");
  }
}

/**
 * Delete data source
 * @param datasetId - Dataset ID
 * @param datasourceId - Data source ID
 * @param userId - User ID
 * @returns Returns true if successful
 */
export async function deleteDataSource(
  datasetId: string,
  datasourceId: string
): Promise<boolean> {
  try {
    await serverDeleteData<null>(
      `/datasets/${datasetId}/datasources/${datasourceId}`
    );
    return true;
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to delete data source");
  }
}

import { PowerdrillApiError } from "@/lib/api/errors";
import {
  serverDeleteData,
  serverFetchData,
  serverPostData,
} from "@/lib/api/serverApiClient";
import {
  CreateDatasetParams,
  DatasetId,
  DatasetListResult,
  DatasetOverview,
  DatasetStatus,
  ListDatasetsParams,
} from "@/types/dataset";

/**
 * Create dataset
 * @param params - Parameters required for creating dataset
 * @returns Returns the ID of the created dataset
 */
export async function createDataset(
  params: CreateDatasetParams
): Promise<string> {
  try {
    const result = await serverPostData<DatasetId>("/datasets", params);
    return result.id;
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to create dataset");
  }
}

/**
 * Get dataset overview
 * @param datasetId - Dataset ID
 * @returns Returns detailed information about the dataset
 */
export async function getDatasetOverview(
  datasetId: string
): Promise<DatasetOverview> {
  try {
    return await serverFetchData<DatasetOverview>(
      `/datasets/${datasetId}/overview`
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to get dataset overview");
  }
}

/**
 * List datasets
 * @param params - Parameters required for listing datasets
 * @returns Returns dataset list result
 */
export async function listDatasets(
  params?: ListDatasetsParams
): Promise<DatasetListResult> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page_number)
      queryParams.append("page_number", params.page_number.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/datasets?${queryString}` : "/datasets";

    return await serverFetchData<DatasetListResult>(endpoint);
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to list datasets");
  }
}

/**
 * Delete dataset
 * @param datasetId - Dataset ID
 * @returns Returns true if successful
 */
export async function deleteDataset(datasetId: string): Promise<boolean> {
  try {
    await serverDeleteData<null>(`/datasets/${datasetId}`);
    return true;
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to delete dataset");
  }
}

/**
 * Get status summary of data sources in the dataset
 * @param datasetId - Dataset ID
 * @returns Returns status information of the dataset
 */
export async function getDatasetStatus(
  datasetId: string
): Promise<DatasetStatus> {
  try {
    return await serverFetchData<DatasetStatus>(
      `/datasets/${datasetId}/status`
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to get dataset status");
  }
}

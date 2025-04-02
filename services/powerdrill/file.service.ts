import { PowerdrillApiError } from "@/lib/api/errors";
import { serverPostData } from "@/lib/api/serverApiClient";

// Part information
export interface PartItem {
  number: number;
  size: number;
  upload_url: string;
}

// Response data for initializing multipart upload
export interface InitMultipartUploadResponse {
  file_object_key: string;
  part_items: PartItem[];
  upload_id: string;
}

// Request parameters for initializing multipart upload
interface InitMultipartUploadParams {
  file_name: string;
  file_size: number;
  [key: string]: unknown;
}

// Part tag
export interface PartEtag {
  etag: string;
  number: number;
}

// Response data for completing multipart upload
export interface CompleteMultipartUploadResponse {
  file_object_key: string;
}

/**
 * Initialize multipart upload
 * @param fileName File name
 * @param fileSize File size (bytes)
 * @returns Response data for initializing multipart upload
 */
export async function initMultipartUpload(fileName: string, fileSize: number) {
  try {
    const params: InitMultipartUploadParams = {
      file_name: fileName,
      file_size: fileSize,
    };
    console.log(params, "POWERDRILL_API_BASE_URL---");
    return await serverPostData<InitMultipartUploadResponse>(
      "/file/init-multipart-upload",
      params
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to initialize multipart upload");
  }
}

export async function completeMultipartUpload(
  fileObjectKey: string,
  uploadId: string,
  partEtags: PartEtag[]
) {
  const params = {
    file_object_key: fileObjectKey,
    part_etags: partEtags,
    upload_id: uploadId,
  };
  try {
    return await serverPostData<CompleteMultipartUploadResponse>(
      "/file/complete-multipart-upload",
      params
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to complete multipart upload");
  }
}

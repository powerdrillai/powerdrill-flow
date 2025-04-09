import { PowerdrillApiError } from "@/lib/api/errors";
import { serverPostData } from "@/lib/api/serverApiClient";
import {
  CompleteMultipartUploadResponse,
  InitMultipartUploadParams,
  InitMultipartUploadResponse,
  PartEtag,
} from "@/types/file";

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

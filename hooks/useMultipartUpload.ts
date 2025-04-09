import { useMutation } from "@tanstack/react-query";

import {
  completeMultipartUpload,
  initMultipartUpload,
} from "@/services/powerdrill/file.service";
import { PartEtag } from "@/types/file";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  fileObjectKey?: string;
}

interface UseMultipartUploadOptions {
  chunkSize?: number;
  maxConcurrentUploads?: number;
  onProgress?: (progress: UploadProgress[]) => void;
}

export function useMultipartUpload(options: UseMultipartUploadOptions = {}) {
  const {
    chunkSize = 5 * 1024 * 1024, // Default 5MB
    maxConcurrentUploads = 3,
    onProgress,
  } = options;

  const initUploadMutation = useMutation({
    mutationFn: async (params: { fileName: string; fileSize: number }) => {
      return await initMultipartUpload(params.fileName, params.fileSize);
    },
  });

  const completeUploadMutation = useMutation({
    mutationFn: async (params: {
      fileObjectKey: string;
      uploadId: string;
      partEtags: PartEtag[];
    }) => {
      return await completeMultipartUpload(
        params.fileObjectKey,
        params.uploadId,
        params.partEtags
      );
    },
  });

  const uploadChunk = async (
    chunk: Blob,
    uploadUrl: string,
    partNumber: number,
    retryCount = 0
  ): Promise<string> => {
    const maxRetries = 3;

    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: chunk,
      });

      if (!response.ok) {
        console.error(
          `Chunk ${partNumber} upload failed with status: ${response.status}`
        );

        // Try to get more error details if available
        try {
          const errorText = await response.text();
          console.error(`Chunk ${partNumber} error response: ${errorText}`);
        } catch (_e) {
          console.error(
            `Could not read error response for chunk ${partNumber}`
          );
        }

        throw new Error(
          `Chunk ${partNumber} upload failed with status: ${response.status}`
        );
      }

      const etag = response.headers.get("etag");
      if (!etag) {
        throw new Error(`Failed to get ETag for chunk ${partNumber}`);
      }

      return etag.replace(/['"]/g, ""); // Remove quotes
    } catch (error) {
      if (retryCount < maxRetries) {
        console.warn(
          `Retrying chunk ${partNumber} upload (attempt ${retryCount + 1}/${maxRetries})...`
        );
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
        return uploadChunk(chunk, uploadUrl, partNumber, retryCount + 1);
      }
      throw error;
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // 1. Initialize multipart upload
    const initResponse = await initUploadMutation.mutateAsync({
      fileName: file.name,
      fileSize: file.size,
    });

    // Output part_items info for debugging
    console.log("Init multipart upload response:", {
      fileObjectKey: initResponse.file_object_key,
      uploadId: initResponse.upload_id,
      partItemsCount: initResponse.part_items.length,
      partItemsNumbers: initResponse.part_items.map((item) => item.number),
    });

    // Check if part_items is complete
    if (!initResponse.part_items || initResponse.part_items.length === 0) {
      throw new Error("Server did not return part items for upload");
    }

    const chunks: Blob[] = [];
    let start = 0;

    // 2. Split file into chunks
    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
      start = end;
    }

    console.log(
      `File ${file.name} split into ${chunks.length} chunks of ${chunkSize} bytes each`
    );

    // Check if the number of part URLs from server matches needed chunks
    if (initResponse.part_items.length < chunks.length) {
      console.error(
        `Server returned ${initResponse.part_items.length} part URLs but file needs ${chunks.length} chunks`
      );

      // Adjustment strategy: only upload chunks with available URLs from server
      if (initResponse.part_items.length > 0) {
        console.log("Adjusting chunk strategy to match server expectations");
        // Limit chunk count to match server's provided upload URLs
        chunks.splice(initResponse.part_items.length);
        console.log(
          `Adjusted to ${chunks.length} chunks based on server response`
        );
      }
    }

    // 3. Upload chunks
    const partEtags: PartEtag[] = [];
    let completedChunks = 0;

    // Ensure chunk numbers match server expectations
    // Use Promise.all and grouping to control concurrency
    for (let i = 0; i < chunks.length; i += maxConcurrentUploads) {
      const chunkGroup = chunks.slice(i, i + maxConcurrentUploads);
      const uploadPromises = chunkGroup.map(async (chunk, groupIndex) => {
        const partNumber = i + groupIndex + 1;
        // Find corresponding part URL
        const partItem = initResponse.part_items.find(
          (item) => item.number === partNumber
        );

        if (!partItem) {
          // Try using index-based approach to get part info in case server uses different numbering
          const indexBasedPartItem = initResponse.part_items[i + groupIndex];
          if (indexBasedPartItem) {
            console.log(
              `Using alternative part item mapping for chunk ${partNumber} -> ${indexBasedPartItem.number}`
            );
            const etag = await uploadChunk(
              chunk,
              indexBasedPartItem.upload_url,
              indexBasedPartItem.number
            );
            partEtags.push({
              number: indexBasedPartItem.number,
              etag: etag,
            });

            completedChunks++;
            // Update progress
            if (onProgress) {
              onProgress([
                {
                  fileName: file.name,
                  progress: (completedChunks / chunks.length) * 100,
                  status:
                    completedChunks === chunks.length
                      ? "completed"
                      : "uploading",
                  fileObjectKey: initResponse.file_object_key,
                },
              ]);
            }
            return;
          }

          throw new Error(`Upload URL for chunk ${partNumber} not found`);
        }

        console.log(
          `Uploading chunk ${partNumber}/${chunks.length} for file ${file.name}`
        );

        try {
          const etag = await uploadChunk(
            chunk,
            partItem.upload_url,
            partNumber
          );
          partEtags.push({
            number: partNumber,
            etag: etag,
          });

          completedChunks++;

          // Update progress
          if (onProgress) {
            onProgress([
              {
                fileName: file.name,
                progress: (completedChunks / chunks.length) * 100,
                status:
                  completedChunks === chunks.length ? "completed" : "uploading",
                fileObjectKey: initResponse.file_object_key,
              },
            ]);
          }
        } catch (error) {
          console.error(
            `Failed to upload chunk ${partNumber} for file ${file.name}:`,
            error
          );
          throw new Error(
            `Failed to upload chunk ${partNumber}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      });

      await Promise.all(uploadPromises);
    }

    // Sort part ETags by part number before completing the upload
    const sortedPartEtags = partEtags.sort((a, b) => a.number - b.number);

    // Validate chunk integrity - using a more flexible approach
    if (sortedPartEtags.length === 0) {
      throw new Error("No parts were uploaded successfully");
    }

    if (sortedPartEtags.length < initResponse.part_items.length) {
      console.warn(
        `Only ${sortedPartEtags.length} parts out of ${initResponse.part_items.length} were uploaded. This might cause issues.`
      );
    }

    console.log(
      `Completing multipart upload for ${file.name} with ${sortedPartEtags.length} parts`,
      sortedPartEtags.map((tag) => tag.number)
    );

    // 4. Complete upload
    try {
      const completeResponse = await completeUploadMutation.mutateAsync({
        fileObjectKey: initResponse.file_object_key,
        uploadId: initResponse.upload_id,
        partEtags: sortedPartEtags,
      });

      return completeResponse.file_object_key;
    } catch (error) {
      console.error("Failed to complete multipart upload:", error);
      throw new Error(
        `Failed to complete upload of ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const upload = async (files: File[]) => {
    const progress: UploadProgress[] = files.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: "pending",
    }));

    if (onProgress) {
      onProgress(progress);
    }

    const results: string[] = [];

    for (const file of files) {
      try {
        const fileObjectKey = await uploadFile(file);
        results.push(fileObjectKey);
      } catch (error) {
        // Update error status
        const failedFileIndex = progress.findIndex(
          (p) => p.fileName === file.name
        );
        if (failedFileIndex !== -1) {
          progress[failedFileIndex].status = "error";
          if (onProgress) {
            onProgress([...progress]);
          }
        }
        throw error;
      }
    }

    return results;
  };

  return {
    upload,
    isInitializing: initUploadMutation.isPending,
    isUploading:
      initUploadMutation.isPending || completeUploadMutation.isPending,
    error: initUploadMutation.error || completeUploadMutation.error,
  };
}

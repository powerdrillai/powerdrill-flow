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
    uploadUrl: string
  ): Promise<string> => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: chunk,
    });

    if (!response.ok) {
      throw new Error("Chunk upload failed");
    }

    const etag = response.headers.get("etag");
    if (!etag) {
      throw new Error("Failed to get ETag");
    }

    return etag.replace(/['"]/g, ""); // Remove quotes
  };

  const uploadFile = async (file: File): Promise<string> => {
    // 1. Initialize multipart upload
    const initResponse = await initUploadMutation.mutateAsync({
      fileName: file.name,
      fileSize: file.size,
    });

    const chunks: Blob[] = [];
    let start = 0;

    // 2. Split file into chunks
    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
      start = end;
    }

    // 3. Upload chunks
    const partEtags: PartEtag[] = [];
    let completedChunks = 0;

    // Use Promise.all and grouping to control concurrency
    for (let i = 0; i < chunks.length; i += maxConcurrentUploads) {
      const chunkGroup = chunks.slice(i, i + maxConcurrentUploads);
      const uploadPromises = chunkGroup.map(async (chunk, groupIndex) => {
        const partNumber = i + groupIndex + 1;
        const partItem = initResponse.part_items.find(
          (item) => item.number === partNumber
        );

        if (!partItem) {
          throw new Error(`Upload URL for chunk ${partNumber} not found`);
        }

        const etag = await uploadChunk(chunk, partItem.upload_url);
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
      });

      await Promise.all(uploadPromises);
    }

    // 4. Complete upload
    const completeResponse = await completeUploadMutation.mutateAsync({
      fileObjectKey: initResponse.file_object_key,
      uploadId: initResponse.upload_id,
      partEtags: partEtags.sort((a, b) => a.number - b.number),
    });

    return completeResponse.file_object_key;
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

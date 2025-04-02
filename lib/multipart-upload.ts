"use client";

import {
  CompleteMultipartUploadResponse,
  InitMultipartUploadResponse,
  PartItem,
} from "@/services/powerdrill/file.service";

/**
 * Client-side multipart file upload
 * @param file The file to upload
 * @returns The file object key after successful upload
 */
export async function uploadFileWithMultipart(file: File): Promise<string> {
  try {
    // 1. Initialize multipart upload - via API route
    const initResponse = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "initMultipartUpload",
        fileName: file.name,
        fileSize: file.size,
      }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.json();
      throw new Error(
        `Initializing multipart upload failed: ${error.msg || initResponse.statusText}`
      );
    }

    const initResult = (await initResponse.json())
      .data as InitMultipartUploadResponse;

    // 2. Upload each part
    const partEtags = await Promise.all(
      initResult.part_items.map(async (part: PartItem) => {
        // Calculate start and end positions for the part
        const start = part.number > 1 ? (part.number - 1) * part.size : 0;
        const end = Math.min(start + part.size, file.size);

        // Slice the file
        const chunk = file.slice(start, end);

        // Upload the part
        const response = await fetch(part.upload_url, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload chunk: ${response.statusText}`);
        }

        // Get ETag from response headers
        const etag =
          response.headers.get("ETag") || response.headers.get("etag");

        // Remove quotes (if any)
        const cleanEtag = etag?.replace(/^"(.*)"$/, "$1") || "";

        return {
          number: part.number,
          etag: cleanEtag,
        };
      })
    );

    // 3. Complete multipart upload - via API route
    const completeResponse = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "completeMultipartUpload",
        fileObjectKey: initResult.file_object_key,
        uploadId: initResult.upload_id,
        partEtags: partEtags,
      }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(
        `Failed to complete multipart upload: ${error.msg || completeResponse.statusText}`
      );
    }

    const completeResult = (await completeResponse.json())
      .data as CompleteMultipartUploadResponse;

    return completeResult.file_object_key;
  } catch (error) {
    console.error("Failed to upload file in chunks:", error);
    throw error;
  }
}

/**
 * Client-side multiple files upload
 * @param files The list of files to upload
 * @returns Array of file object keys after successful upload
 */
export async function uploadFilesWithMultipart(
  files: File[]
): Promise<string[]> {
  const fileObjectKeys = await Promise.all(
    files.map((file) => uploadFileWithMultipart(file))
  );

  return fileObjectKeys;
}

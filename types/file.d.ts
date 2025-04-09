/**
 * Type definitions for file-related operations
 */

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
export interface InitMultipartUploadParams {
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

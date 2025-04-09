/**
 * Type definitions for job-related operations
 */

export interface CreateJobParams {
  question: string;
  datasource_ids?: string[];
  dataset_id?: string;
  session_id: string;
  [key: string]: unknown;
}

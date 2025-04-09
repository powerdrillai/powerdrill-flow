/**
 * Type definitions for session-related operations
 */

export interface CreateSessionParams {
  name: string;
  output_language?: string;
  job_mode?: string;
  max_contextual_job_history?: number;
  agent_id?: string;
  [key: string]: unknown;
}

export interface ModifySessionParams {
  name?: string;
  output_language?: string;
  job_mode?: string;
  max_contextual_job_history?: number;
  [key: string]: unknown;
}

export interface SessionRecord {
  id: string;
  name: string;
  output_language: string;
  job_mode: string;
  max_contextual_job_history: number;
  agent_id: string;
}

export interface SessionListResult {
  page_number: number;
  page_size: number;
  total_items: number;
  records: SessionRecord[];
}

export interface ListSessionsParams {
  page_number?: number;
  page_size?: number;
  search?: string;
  [key: string]: unknown;
}

export interface TableContent {
  name: string;
  url: string;
  expires_at: string;
}

export interface ImageContent {
  name: string;
  url: string;
  expires_at: string;
}

export interface SourceContent {
  source: string;
  datasource_id: string;
  dataset_id: string;
  file_type: string;
  external_id?: string;
}

// Structure of TASK event content
export interface TaskContent {
  name: string;
  id: string;
  status: string;
  parent_id: string | null;
  stage: string;
  properties: Record<string, unknown>;
}

export interface BaseAnswerBlock {
  group_id?: string;
  group_name?: string;
  stage?: string;
}

export interface TaskBlock extends BaseAnswerBlock {
  type: "TASK";
  content: TaskContent;
}

export interface MessageBlock extends BaseAnswerBlock {
  type: "MESSAGE";
  content: string;
}

export interface CodeBlock extends BaseAnswerBlock {
  type: "CODE";
  content: string;
}

export interface TableBlock extends BaseAnswerBlock {
  type: "TABLE";
  content: TableContent;
}

export interface ImageBlock extends BaseAnswerBlock {
  type: "IMAGE";
  content: ImageContent;
}

export interface SourcesBlock extends BaseAnswerBlock {
  type: "SOURCES";
  content: SourceContent[];
}

export interface QuestionsBlock extends BaseAnswerBlock {
  type: "QUESTIONS";
  content: string[];
}

export type AnswerBlock =
  | MessageBlock
  | CodeBlock
  | TableBlock
  | ImageBlock
  | SourcesBlock
  | QuestionsBlock
  | TaskBlock;

export interface Answer {
  blocks: AnswerBlock[];
}

export interface JobRecord {
  job_id: string;
  question: {
    blocks: {
      type: "MESSAGE" | "CODE";
      content: string;
    }[];
  };
  answer: Answer;
}

export interface JobHistoryResult {
  page_number: number;
  page_size: number;
  total_items: number;
  records: JobRecord[];
}

export interface JobHistoryParams {
  page_number?: number;
  page_size?: number;
  [key: string]: unknown;
}

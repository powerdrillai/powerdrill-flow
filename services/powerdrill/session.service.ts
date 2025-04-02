import { PowerdrillApiError } from "@/lib/api/errors";
import {
  serverDeleteData,
  serverFetchData,
  serverPostData,
} from "@/lib/api/serverApiClient";

interface CreateSessionParams {
  name: string;
  output_language?: string;
  job_mode?: string;
  max_contextual_job_history?: number;
  agent_id?: string;
  [key: string]: unknown;
}

interface ModifySessionParams {
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

interface SessionListResult {
  page_number: number;
  page_size: number;
  total_items: number;
  records: SessionRecord[];
}

interface ListSessionsParams {
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

export interface TaskBlock extends BaseAnswerBlock {
  type: "TASK";
  content: TaskContent;
}

export interface Answer {
  blocks: (
    | MessageBlock
    | CodeBlock
    | TableBlock
    | ImageBlock
    | SourcesBlock
    | QuestionsBlock
  )[];
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

interface JobHistoryParams {
  page_number?: number;
  page_size?: number;
  [key: string]: unknown;
}

/**
 * Create session
 * @param params - Parameters required for creating session
 * @returns Returns the created session ID
 */
export async function createSession(
  params: CreateSessionParams
): Promise<string> {
  try {
    const result = await serverPostData<{ id: string }>("/sessions", params);
    return result.id;
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to create session");
  }
}

/**
 * Get session
 * @param sessionId - Session ID
 * @returns Returns detailed information about the session
 */
export async function getSession(sessionId: string): Promise<SessionRecord> {
  try {
    return await serverFetchData<SessionRecord>(`/sessions/${sessionId}`);
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to get session");
  }
}

/**
 * Get job history from session
 * @param sessionId - Session ID
 * @param params - Parameters required for getting history records
 * @returns Returns session's job history records
 */
export async function getJobHistory(
  sessionId: string,
  params?: JobHistoryParams
): Promise<JobHistoryResult> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page_number)
      queryParams.append("page_number", params.page_number.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());

    const queryString = queryParams.toString();
    const endpoint = `/sessions/${sessionId}/history?${queryString}`;

    return await serverFetchData<JobHistoryResult>(endpoint);
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to get session history records");
  }
}

/**
 * List sessions
 * @param params - Parameters required for listing sessions
 * @returns Returns session list result
 */
export async function listSessions(
  params?: ListSessionsParams
): Promise<SessionListResult> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page_number)
      queryParams.append("page_number", params.page_number.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `/sessions?${queryString}`;

    return await serverFetchData<SessionListResult>(endpoint);
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to list sessions");
  }
}

/**
 * Modify session
 * @param sessionId - Session ID
 * @param params - Parameters required for modifying session
 * @returns Returns modified session information
 */
export async function modifySession(
  sessionId: string,
  params: ModifySessionParams
): Promise<SessionRecord> {
  try {
    const modifyParams = {
      ...params,
    };

    return await serverPostData<SessionRecord>(
      `/sessions/${sessionId}`,
      modifyParams
    );
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to modify session");
  }
}

/**
 * Delete session
 * @param sessionId - Session ID
 * @returns Returns true if successful
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await serverDeleteData<null>(`/sessions/${sessionId}`);
    return true;
  } catch (error) {
    throw error instanceof PowerdrillApiError
      ? error
      : new Error("Failed to delete session");
  }
}

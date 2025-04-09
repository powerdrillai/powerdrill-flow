// PowerDrill Type Definitions

// PowerDrill Event Types
export type PowerdrillEventType =
  | "JOB_ID"
  | "TASK"
  | "CODE"
  | "TABLE"
  | "IMAGE"
  | "MESSAGE"
  | "QUESTIONS"
  | "TRIGGER"
  | "SOURCES"
  | "END_MARK"
  | "ERROR";

// PowerDrill Task Status
export type PowerdrillTaskStatus = "running" | "done" | "error";

// PowerDrill Rich Text Content Type
export interface PowerdrillContent {
  type: "text" | "code" | "table" | "image" | "chart";
  content: string;
  language?: string; // For code
  url?: string; // For images or tables
  name?: string; // For file names
  metadata?: Record<string, unknown>; // Additional metadata
}

// PowerDrill Event Data
export interface PowerdrillEventData {
  id: string;
  model: string;
  choices: Array<{
    delta: {
      content?: string | Record<string, unknown>;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }>;
  created: number;
  group_id: string;
  group_name: string;
  stage: string;
}

// Simplified message type created from JobRecord for UI display
export type SimplifiedJobRecord = {
  id: string;
  job_id: string;
  role: "user" | "assistant";
  content: string | PowerdrillContent[];
};

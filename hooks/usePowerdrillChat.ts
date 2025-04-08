import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  CodeBlock,
  ImageBlock,
  ImageContent,
  JobRecord,
  MessageBlock,
  QuestionsBlock,
  // SourceContent,
  SourcesBlock,
  TableBlock,
  TableContent,
  TaskBlock,
  TaskContent,
} from "@/services/powerdrill/session.service";
import { PowerdrillEventType } from "@/types/powerdrill";

// Task块接口定义

export interface Answer {
  blocks: (
    | MessageBlock
    | CodeBlock
    | TableBlock
    | ImageBlock
    | SourcesBlock
    | QuestionsBlock
    | TaskBlock
  )[];
  group_id?: string;
  group_name?: string;
  stage?: string;
  status?: string;
}

export interface MessageGroup {
  job_id: string;
  question: {
    blocks: {
      type: "MESSAGE" | "CODE";
      content: string;
    }[];
  };
  answer: Answer[];
}

export interface PowerdrillChatOptions {
  api: string;
  datasourceId?: string[];
  datasetId?: string | null;
  sessionId?: string;
  initialMessages?: JobRecord[];
  onResponse?: (response: Response) => void;
  onFinish?: (message: MessageGroup) => void;
  onError?: (error: Error) => void;
}

// 定义事件数据类型
interface EventMetadata {
  group_id?: string;
  group_name?: string;
  stage?: string;
}

// 定义事件数据类型
interface EventData {
  choices?: Array<{
    delta?: {
      content?: unknown;
      role?: string;
    };
    index?: number;
    finish_reason?: string | null;
  }>;
  id?: string;
  model?: string;
  created?: number;
  group_id?: string;
  group_name?: string;
  stage?: string;
}

// 定义流事件类型
interface StreamEvent {
  data: string;
  event: string;
  id?: string;
  retry?: number;
}

// 定义块类型的联合类型
type AnswerBlock =
  | MessageBlock
  | CodeBlock
  | TableBlock
  | ImageBlock
  | SourcesBlock
  | QuestionsBlock
  | TaskBlock;

// 定义累积器中块的类型
interface AccumulatedBlock {
  type: string;
  content: unknown;
  group_id?: string;
  group_name?: string;
  stage?: string;
}

// 消息累积器类型
interface MessageAccumulator {
  originalQuestion: string;
  accumulatedBlocks: AccumulatedBlock[];
}

// 验证并标准化Message对象，确保格式一致
function normalizeMessage(message: MessageGroup): MessageGroup {
  const normalizedMessage = { ...message };

  // 确保question字段和blocks数组存在
  if (!normalizedMessage.question) {
    normalizedMessage.question = {
      blocks: [
        {
          type: "MESSAGE",
          content: "查询内容不可用",
        },
      ],
    };
  } else if (!Array.isArray(normalizedMessage.question.blocks)) {
    const content =
      typeof normalizedMessage.question === "object"
        ? JSON.stringify(normalizedMessage.question)
        : String(normalizedMessage.question);

    normalizedMessage.question = {
      blocks: [
        {
          type: "MESSAGE",
          content,
        },
      ],
    };
  }

  // 确保answer数组存在
  if (!normalizedMessage.answer) {
    normalizedMessage.answer = [];
  } else if (!Array.isArray(normalizedMessage.answer)) {
    normalizedMessage.answer = [];
  }

  // 确保job_id存在
  if (!normalizedMessage.job_id) {
    normalizedMessage.job_id = `job_${Date.now()}`;
  }

  return normalizedMessage;
}

// 将PowerDrill事件类型映射到Answer Block类型
function mapToAnswerBlock(
  type: string,
  content: unknown,
  metadata: EventMetadata
): AnswerBlock {
  const { group_id, group_name, stage } = metadata;
  const baseBlock = { group_id, group_name, stage };

  switch (type) {
    case "MESSAGE":
      return { ...baseBlock, type: "MESSAGE", content: String(content) };
    case "CODE":
      return { ...baseBlock, type: "CODE", content: String(content) };
    case "TABLE":
      return { ...baseBlock, type: "TABLE", content: content as TableContent };
    case "IMAGE":
      return { ...baseBlock, type: "IMAGE", content: content as ImageContent };
    // case "SOURCES":
    //   return {
    //     ...baseBlock,
    //     type: "SOURCES",
    //     content: content as SourceContent[],
    //   };
    case "QUESTIONS":
      return { ...baseBlock, type: "QUESTIONS", content: content as string[] };
    case "TASK":
      // TASK类型可能需要特殊处理
      const taskContent = content as TaskContent;
      // 确保status字段存在且有效
      if (!taskContent.status) {
        taskContent.status = "running";
      }
      return {
        ...baseBlock,
        type: "TASK",
        content: taskContent,
      };
    default:
      return { ...baseBlock, type: "MESSAGE", content: String(content) };
  }
}

// Ensure no duplicate job_ids in message list, keep the latest message
function removeDuplicateMessages(messages: MessageGroup[]): MessageGroup[] {
  const uniqueMessages: MessageGroup[] = [];
  const seenIds = new Set<string>();

  // Process from back to front, keep the latest message
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (!seenIds.has(message.job_id)) {
      seenIds.add(message.job_id);
      uniqueMessages.unshift(message); // Add to front to maintain original order
    }
  }

  return uniqueMessages;
}

// Convert JobRecord to MessageGroup
function convertJobRecordToMessageGroup(jobRecord: JobRecord): MessageGroup {
  // Create MessageGroup object
  const messageGroup: MessageGroup = {
    job_id: jobRecord.job_id,
    question: jobRecord.question,
    answer: [],
  };

  // If JobRecord has answer and answer.blocks exists, convert to Answer[]
  if (jobRecord.answer && jobRecord.answer.blocks) {
    // Group blocks by group_id and group_name
    const groupedBlocks: Record<
      string,
      {
        blocks: AnswerBlock[];
        group_id?: string;
        group_name?: string;
        stage?: string;
        status?: string;
      }
    > = {};

    jobRecord.answer.blocks.forEach((block: AnswerBlock) => {
      // Type check
      if (!block || typeof block !== "object") return;
      const blockObj = block;

      // Create a group identifier
      const groupKey = `${(blockObj.group_id as string) || "default"}-${
        (blockObj.group_name as string) || "default"
      }`;

      if (!groupedBlocks[groupKey]) {
        groupedBlocks[groupKey] = {
          blocks: [],
          group_id: blockObj.group_id as string | undefined,
          group_name: blockObj.group_name as string | undefined,
          stage: blockObj.stage as string | undefined,
          status: "done", // Default status
        };
      }

      // Add block to corresponding group
      groupedBlocks[groupKey].blocks.push(block as AnswerBlock);

      // Try to get task status
      try {
        if (
          blockObj.type === "TASK" &&
          blockObj.content &&
          typeof blockObj.content === "object" &&
          "status" in blockObj.content
        ) {
          groupedBlocks[groupKey].status = String(blockObj.content.status);
        }
      } catch (e) {
        console.error("Failed to process task status:", e);
      }
    });

    // Convert grouped blocks to Answer[]
    messageGroup.answer = Object.values(groupedBlocks)
      .map((group) => ({
        blocks: group.blocks,
        group_id: group.group_id,
        group_name: group.group_name,
        stage: group.stage,
        status: group.status,
      }))
      .filter((item) => {
        if (item.blocks.find((blcok) => blcok.type === "SOURCES")) {
          return false;
        }
        return true;
      });
  }

  return messageGroup;
}

export function usePowerdrillChat({
  api,
  datasetId,
  datasourceId,
  sessionId,
  initialMessages = [],
  onResponse,
  onFinish,
  onError,
}: PowerdrillChatOptions) {
  // 状态与引用
  const [messages, setMessages] = useState<MessageGroup[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // References
  const currentJobIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageAccumulatorRef = useRef<MessageAccumulator | null>(null);

  // Normalize initial messages
  const normalizedInitialMessages = useMemo(() => {
    // Convert JobRecord[] to MessageGroup[]
    const convertedMessages = initialMessages
      .reverse()
      .map(convertJobRecordToMessageGroup);

    // Apply normalizeMessage and remove duplicates
    const normalizedMessages = convertedMessages.map(normalizeMessage);
    return removeDuplicateMessages(normalizedMessages);
  }, [initialMessages]);

  // Safely set messages, ensuring no duplicate job_ids
  const safeSetMessages = useCallback(
    (updater: MessageGroup[] | ((prev: MessageGroup[]) => MessageGroup[])) => {
      setMessages((prev) => {
        const newMessages =
          typeof updater === "function" ? updater(prev) : updater;
        return removeDuplicateMessages(newMessages);
      });
    },
    []
  );

  // Initialize messages
  useEffect(() => {
    if (normalizedInitialMessages.length > 0) {
      safeSetMessages(normalizedInitialMessages);
    }
  }, [normalizedInitialMessages, safeSetMessages]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  // Create message record with current user input
  const createMessageRecord = useCallback(
    (jobId: string, userInput: string, answers: Answer[] = []) => {
      return normalizeMessage({
        job_id: jobId,
        question: {
          blocks: [
            {
              type: "MESSAGE",
              content: userInput,
            },
          ],
        },
        answer: answers,
      });
    },
    []
  );

  // Generate grouped Answer array from accumulated blocks
  const groupBlocksIntoAnswers = useCallback(
    (accumulatedBlocks: AccumulatedBlock[]): Answer[] => {
      // Group blocks by group_id and group_name
      const groupedBlocks: Record<string, AccumulatedBlock[]> = {};

      accumulatedBlocks.forEach((block) => {
        // Create a unique group identifier
        const groupKey = `${block.group_id || "default"}-${
          block.group_name || "default"
        }`;

        if (!groupedBlocks[groupKey]) {
          groupedBlocks[groupKey] = [];
        }

        groupedBlocks[groupKey].push(block);
      });

      // Convert grouped blocks to Answer array
      return Object.entries(groupedBlocks).map(([_groupKey, blocks]) => {
        // Use metadata from the latest block for the entire Answer
        // This ensures the stage field is up to date
        const lastBlock = blocks[blocks.length - 1];
        const { group_id, group_name, stage } = lastBlock;

        // Find if there's a TASK type block in the group to get the latest status
        let status = "running"; // Default status
        for (let i = blocks.length - 1; i >= 0; i--) {
          const block = blocks[i];
          if (
            block.type === "TASK" &&
            typeof block.content === "object" &&
            block.content &&
            "status" in block.content
          ) {
            status = block.content.status as string;
            break;
          }
        }

        return {
          group_id,
          group_name,
          stage,
          status,
          blocks: blocks.map((block) =>
            mapToAnswerBlock(block.type, block.content, {
              group_id: block.group_id,
              group_name: block.group_name,
              stage: block.stage,
            })
          ),
        };
      });
    },
    []
  );

  // Update UI with current blocks
  const updateUIWithCurrentBlocks = useCallback(() => {
    if (!currentJobIdRef.current || !messageAccumulatorRef.current) return;

    // Convert accumulated blocks into grouped Answer array
    const answers = groupBlocksIntoAnswers(
      messageAccumulatorRef.current.accumulatedBlocks
    );

    // Use original question from accumulator instead of current input
    const messageRecord = createMessageRecord(
      currentJobIdRef.current,
      messageAccumulatorRef.current.originalQuestion,
      answers
    );

    safeSetMessages((prev) => {
      // Filter out messages with the same ID as current message, replace with updated message
      const filteredPrev = prev.filter(
        (m) => m.job_id !== currentJobIdRef.current
      );
      return [...filteredPrev, messageRecord];
    });
  }, [safeSetMessages, createMessageRecord, groupBlocksIntoAnswers]);

  // Complete message processing
  const finishMessageProcessing = useCallback(
    (_messageToSend: string) => {
      if (!currentJobIdRef.current || !messageAccumulatorRef.current) return;

      // Convert accumulated blocks into Answer array
      const answers = groupBlocksIntoAnswers(
        messageAccumulatorRef.current.accumulatedBlocks
      );

      const finalMessageRecord = createMessageRecord(
        currentJobIdRef.current,
        messageAccumulatorRef.current.originalQuestion,
        answers
      );

      safeSetMessages((prev) => {
        // Filter out messages with the same ID as current message and replace with final message
        const filteredPrev = prev.filter(
          (m) => m.job_id !== currentJobIdRef.current
        );
        return [...filteredPrev, finalMessageRecord];
      });

      if (onFinish) {
        onFinish(finalMessageRecord);
      }
    },
    [createMessageRecord, safeSetMessages, onFinish, groupBlocksIntoAnswers]
  );

  // Update textual blocks (MESSAGE, CODE)
  const updateTextualBlock = useCallback(
    (blockType: string, content: unknown, metadata: EventMetadata) => {
      if (!messageAccumulatorRef.current) return;

      const { group_id, stage } = metadata;
      const textContent =
        typeof content === "string" ? content : JSON.stringify(content);

      // Find existing block in the same group
      const existingBlockIndex =
        messageAccumulatorRef.current.accumulatedBlocks.findIndex(
          (block) => block.type === blockType && block.group_id === group_id
        );

      if (existingBlockIndex >= 0) {
        // Update existing block and its stage field
        const existingBlock =
          messageAccumulatorRef.current.accumulatedBlocks[existingBlockIndex];
        messageAccumulatorRef.current.accumulatedBlocks[existingBlockIndex] = {
          ...existingBlock,
          content: existingBlock.content + textContent,
          stage: stage || existingBlock.stage, // Update stage if new one is provided
        };
      } else {
        // Add new block
        messageAccumulatorRef.current.accumulatedBlocks.push({
          type: blockType,
          content: textContent,
          ...metadata,
        });
      }
    },
    []
  );

  // Add direct type blocks (TABLE, IMAGE, QUESTIONS, SOURCES)
  const addDirectBlock = useCallback(
    (blockType: string, content: unknown, metadata: EventMetadata) => {
      if (!messageAccumulatorRef.current) return;

      messageAccumulatorRef.current.accumulatedBlocks.push({
        type: blockType,
        content,
        ...metadata,
      });
    },
    []
  );

  // Process different types of event data
  const processEventData = useCallback(
    (eventType: PowerdrillEventType, data: EventData) => {
      // Return if no content or accumulator not initialized
      if (!messageAccumulatorRef.current) {
        return;
      }

      const metadata: EventMetadata = {
        group_id: data.group_id,
        group_name: data.group_name,
        stage: data.stage,
      };

      // TASK event handling logic differs from other events
      if (eventType === "TASK") {
        if (data.choices?.[0]?.delta?.content) {
          const taskContent = data.choices[0].delta.content;

          // Check if there's already a TASK block with the same group_id
          const existingTaskIndex =
            messageAccumulatorRef.current.accumulatedBlocks.findIndex(
              (block) =>
                block.type === "TASK" && block.group_id === data.group_id
            );

          if (existingTaskIndex >= 0) {
            // If found, update existing block
            const existingBlock =
              messageAccumulatorRef.current.accumulatedBlocks[
                existingTaskIndex
              ];
            messageAccumulatorRef.current.accumulatedBlocks[existingTaskIndex] =
              {
                ...existingBlock,
                content: taskContent,
                stage: data.stage || existingBlock.stage,
              };
          } else {
            // Otherwise add new block
            addDirectBlock(eventType, taskContent, metadata);
          }

          updateUIWithCurrentBlocks();
        }
        return;
      }

      if (!data.choices?.[0]?.delta?.content) {
        return;
      }

      const content = data.choices[0].delta.content;

      switch (eventType) {
        case "MESSAGE":
        case "CODE":
          updateTextualBlock(eventType, content, metadata);
          break;
        case "TABLE":
        case "IMAGE":
        case "QUESTIONS":
          // case "SOURCES":
          addDirectBlock(eventType, content, metadata);
          break;
      }

      // Update UI
      updateUIWithCurrentBlocks();
    },
    [updateUIWithCurrentBlocks, updateTextualBlock, addDirectBlock]
  );

  // Handle events received from stream
  const handleStreamEvent = useCallback(
    (event: StreamEvent, messageToSend: string) => {
      // Handle special [DONE] end marker
      if (event.data === "[DONE]") {
        finishMessageProcessing(messageToSend);
        return;
      }

      // Get event type
      const eventType = event.event as PowerdrillEventType;

      // Ignore JOB_ID event
      if (eventType === "JOB_ID") {
        return;
      }

      // Process event data
      try {
        const parsedData = JSON.parse(event.data) as EventData;
        processEventData(eventType, parsedData);
      } catch (parseError) {
        console.error(
          `Failed to parse ${eventType} event data:`,
          parseError,
          event
        );
      }
    },
    [processEventData, finishMessageProcessing]
  );

  // Submit message
  const submitMessage = useCallback(
    async (question?: string) => {
      const messageToSend = question || input;

      if (!messageToSend?.trim() || isLoading) {
        return;
      }

      // Cleanup previous state
      cleanup();

      // Reset states
      setIsLoading(true);
      setError(null);

      const jobId = uuidv4();
      currentJobIdRef.current = jobId;

      // Immediately create and add user message
      const newMessageRecord = createMessageRecord(jobId, messageToSend);
      safeSetMessages((prev) => [...prev, newMessageRecord]);

      // Initialize message accumulator to store original question
      messageAccumulatorRef.current = {
        originalQuestion: messageToSend,
        accumulatedBlocks: [],
      };

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        await fetchEventSource(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: messageToSend,
            session_id: sessionId,
            dataset_id: datasetId,
            datasource_ids: datasourceId,
            custom_options: {
              with_citation: false,
            },
          }),
          signal: abortControllerRef.current.signal,

          async onopen(response) {
            if (onResponse) {
              onResponse(response);
            }

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Clear input field
            setInput("");
          },

          // Handle received SSE events
          onmessage(event) {
            handleStreamEvent(event as unknown as StreamEvent, messageToSend);
          },

          // Handle connection close
          onclose() {
            // Reset accumulator and current job id
            messageAccumulatorRef.current = null;
            currentJobIdRef.current = null;
            setIsLoading(false);
          },

          // Handle errors
          onerror(err) {
            if (err instanceof Error) {
              console.error("Stream processing error:", err);
              setError(err);
              if (onError) {
                onError(err);
              }

              // For non-abort errors, return 0 to let the library auto-retry
              if (err.name !== "AbortError") {
                return 0; // Return 0 for immediate retry
              }
            }

            // Stop retrying and close connection
            return 1; // Return non-zero value to stop retrying
          },
        });
      } catch (error: unknown) {
        if ((error as { name?: string }).name !== "AbortError") {
          console.error("提交消息错误:", error);
          setError(error as Error);
          if (onError) {
            onError(error as Error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      api,
      input,
      isLoading,
      cleanup,
      sessionId,
      datasetId,
      datasourceId,
      createMessageRecord,
      safeSetMessages,
      handleStreamEvent,
      onResponse,
      onError,
    ]
  );

  // Stop current chat
  const stop = useCallback(() => {
    cleanup();
    setIsLoading(false);
  }, [cleanup]);

  // Reset chat
  const reset = useCallback(() => {
    cleanup();
    safeSetMessages([]);
    setInput("");
    setIsLoading(false);
    setError(null);
    currentJobIdRef.current = null;
    messageAccumulatorRef.current = null;
  }, [cleanup, safeSetMessages]);

  // Add message to chat
  const addMessage = useCallback(
    (message: MessageGroup) => {
      const normalizedMessage = normalizeMessage(message);
      safeSetMessages((prev) => [...prev, normalizedMessage]);
    },
    [safeSetMessages]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: submitMessage,
    isLoading,
    error,
    stop,
    reset,
    addMessage,
    setInput,
  };
}

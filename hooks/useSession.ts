import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createSession as apiCreateSession,
  getJobHistory,
  getSession,
} from "@/services/powerdrill/session.service";
import { JobHistoryResult, SessionRecord } from "@/types/session";

// Session creation parameters interface
interface CreateSessionParams {
  name: string;
  output_language?: string;
  job_mode?: string;
  max_contextual_job_history?: number;
  agent_id?: string;
  [key: string]: unknown;
}

// Session hook return type
interface UseSessionReturn {
  // Session creation related
  createSession: (params: CreateSessionParams) => Promise<string>;
  isCreating: boolean;

  // Session query related
  session?: SessionRecord;
  isLoadingSession: boolean;
  sessionError: Error | null;

  // History related
  history?: JobHistoryResult;
  isLoadingHistory: boolean;
  historyError: Error | null;

  // Combined loading status
  isLoading: boolean;
}

/**
 * Session Management Hook
 * Provides session creation, query and history functionality
 */
export function useSession(sessionId?: string): UseSessionReturn {
  // Session creation mutation
  const { mutateAsync: createSessionMutation, isPending: isCreating } =
    useMutation({
      mutationFn: apiCreateSession,
    });

  // Session information query
  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      return await getSession(sessionId!);
    },
    enabled: !!sessionId,
  });

  // Session history query
  const historyQuery = useQuery({
    queryKey: ["sessionHistory", sessionId],
    queryFn: async () => {
      return await getJobHistory(sessionId!, {
        page_size: 100,
      });
    },
    enabled: !!sessionId,
  });

  return {
    // Session creation related
    createSession: createSessionMutation,
    isCreating,

    // Session query related
    session: sessionQuery.data,
    isLoadingSession: sessionQuery.isLoading,
    sessionError: sessionQuery.error,

    // History related
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
    historyError: historyQuery.error,

    // Combined loading status
    isLoading: sessionQuery.isLoading || historyQuery.isLoading,
  };
}

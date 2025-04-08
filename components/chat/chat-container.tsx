"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import ChatInput from "@/components/chat-input";
import { AppHeader } from "@/components/ui/app-header";
import { usePowerdrillChat } from "@/hooks/usePowerdrillChat";
import { useSession } from "@/hooks/useSession";
import { useSessionStore } from "@/store/session-store";

import { ChatCanvas } from "./chat-canvas";
import ChatMessages from "./chat-messages";
import SplitLayout from "./split-layout";

interface ChatContainerProps {
  sessionId: string;
}

export default function ChatContainer({ sessionId }: ChatContainerProps) {
  const router = useRouter();
  const { sessionMap, setTempUserMessage } = useSessionStore();
  const sessionState = sessionMap[sessionId];
  const datasetId = sessionState?.selectedDataset?.id || null;
  const datasourceId =
    sessionState?.selectedDataset?.datasource.map((item) => item.id) || [];

  const { history, isLoadingHistory, session, createSession } =
    useSession(sessionId);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userHasScrolled = useRef(false);
  const [collapsed, setCollapsed] = useState(true);
  // Add ref to track if sidebar has been auto-opened due to Conclusions
  const hasAutoOpenedSidebarRef = useRef(false);

  // Use PowerdrillChat hook
  const {
    messages,
    questions,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
  } = usePowerdrillChat({
    api: "/api/chat",
    sessionId,
    datasetId,
    datasourceId,
    initialMessages: history?.records || [],
  });

  // Handle auto-scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || (userHasScrolled.current && !isLoading)) return;

    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    scrollToBottom();
  }, [messages, isLoading]);

  // Listen for user scroll
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom =
      Math.abs(
        container.scrollHeight - container.scrollTop - container.clientHeight
      ) < 10;

    userHasScrolled.current = !isAtBottom;
  };

  const handleQuestionClick = (question: string) => {
    handleSubmit(question);
    userHasScrolled.current = false;
  };

  // Process temporary message after history is loaded
  useEffect(() => {
    if (!isLoadingHistory && sessionState?.tempUserMessage && !isLoading) {
      handleSubmit(sessionState?.tempUserMessage);
      setTempUserMessage(sessionId, "");
    }
  }, [
    handleInputChange,
    handleSubmit,
    isLoading,
    isLoadingHistory,
    sessionId,
    sessionState?.tempUserMessage,
    setTempUserMessage,
  ]);

  useEffect(() => {
    // Check if there is an answer with group_name "Conclusions" in messages
    const hasConclusions = messages.some((message) =>
      message.answer.some((answer) => answer.group_name === "Conclusions")
    );

    // If Conclusions exists, sidebar is collapsed, and hasn't been auto-opened yet, open it
    if (hasConclusions && collapsed && !hasAutoOpenedSidebarRef.current) {
      setCollapsed(false);
      hasAutoOpenedSidebarRef.current = true; // Mark as auto-opened
    }
  }, [messages, collapsed, setCollapsed]);

  // Handle manual sidebar toggle
  const handleToggleSidebar = (newState: boolean) => {
    setCollapsed(newState);
  };

  const handleCreateSession = async () => {
    try {
      // Create session
      const sessionName = "New Chat";
      const sessionId = await createSession({
        name: sessionName,
      });

      // Redirect to chat page
      router.push(`/chat/${sessionId}`);
    } catch (_error) {
      toast.error("Failed to create session, please try again");
    }
  };

  // Update page title with session name
  useEffect(() => {
    if (session) {
      document.title = `${session.name || "Chat"} - Powerdrill Flow`;
    }
  }, [session]);

  const chatContent = (
    <div className="flex h-full flex-col pb-2">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="mb-2 flex-1 overflow-y-auto scroll-smooth px-4 py-4"
      >
        <div className="mx-auto w-full max-w-4xl">
          <ChatMessages
            messages={messages}
            questions={questions}
            isLoading={isLoading || isLoadingHistory}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl px-4">
        <ChatInput
          input={input}
          onInputChange={handleInputChange}
          onSubmit={() => {
            handleSubmit(input);
            userHasScrolled.current = false;
          }}
          isLoading={isLoading}
          sessionId={sessionId}
          onQuestionClick={handleQuestionClick}
        />
      </div>
    </div>
  );

  return (
    <>
      <AppHeader
        title={session?.name || "Chat"}
        sessionId={sessionId}
        onNewSession={handleCreateSession}
      />
      <SplitLayout
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        sidebarContent={
          <ChatCanvas messages={messages} isLoading={isLoading} />
        }
      >
        {chatContent}
      </SplitLayout>
    </>
  );
}

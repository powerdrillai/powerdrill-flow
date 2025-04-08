"use client";

import { cloneDeep } from "lodash-es";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import ChatInput from "@/components/chat-input";
import { AppHeader } from "@/components/ui/app-header";
import { useSession } from "@/hooks/useSession";
import { useSessionStore } from "@/store/session-store";

export default function Home() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>("");
  const { sessionMap, setSession, clearSession } = useSessionStore();
  const sessionState = sessionMap["home"];

  // Using TanStack Query session hooks
  const { createSession, isCreating } = useSession();

  const handleCreateSession = async (question: string) => {
    console.log(question, "finalQuestion--");
    try {
      // Create session
      const sessionName =
        question.slice(0, 30) + (question.length > 30 ? "..." : "");
      const sessionId = await createSession({
        name: sessionName,
      });

      setSession(sessionId, {
        tempUserMessage: question,
        selectedDataset: cloneDeep(sessionState?.selectedDataset),
      });

      clearSession("home");

      // Redirect to chat page
      router.push(`/chat/${sessionId}`);
    } catch (_error) {
      toast.error("Failed to create session, please try again");
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleCreateSession(inputValue.trim());
    }
  };

  return (
    <>
      <AppHeader />
      <div className="home-container">
        <h6 className="mb-6 text-2xl font-bold">
          What do you want to analyze today?
        </h6>
        <div className="mx-auto w-full max-w-3xl min-w-xl">
          <ChatInput
            input={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleSendMessage}
            onQuestionClick={handleCreateSession}
            isLoading={isCreating}
            sessionId="home"
          />
        </div>
      </div>
    </>
  );
}

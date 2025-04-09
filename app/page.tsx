"use client";

import { cloneDeep } from "lodash-es";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ChatInput from "@/components/chat-input";
import { DatasetList } from "@/components/dataset-list";
import { AppHeader } from "@/components/ui/app-header";
import { BackToTop } from "@/components/ui/back-to-top";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { useDatasets } from "@/hooks/useDatasets";
import { useSession } from "@/hooks/useSession";
import { useSessionStore } from "@/store/session-store";

export default function Home() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>("");
  const { sessionMap, setSession, clearSession } = useSessionStore();
  const sessionState = sessionMap["home"];
  const { datasets, isLoading, pagination, refetch } = useDatasets({
    pageSize: 9,
  });

  // Using TanStack Query session hooks
  const { createSession, isCreating } = useSession();

  // Add a useEffect to ensure the page is scrollable
  useEffect(() => {
    // Force document to be scrollable
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";

    return () => {
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
    };
  }, []);

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
      <div className="home-container min-h-0">
        <h6 className="mt-8 mb-6 text-2xl font-bold">
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

        {/* Dataset Selection Section */}
        <div className="mx-auto mt-12 w-full max-w-6xl pb-20">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-xl font-semibold">Select a Dataset</h2>
            <TooltipWrapper title="Refresh Datasets">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0"
                onClick={refetch}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh Datasets</span>
              </Button>
            </TooltipWrapper>
          </div>
          <p className="text-muted-foreground mb-4">
            Choose one of your datasets below or use the input above to start a
            new analysis
          </p>
          <DatasetList
            sessionId="home"
            isLoading={isLoading}
            datasets={datasets}
            pagination={pagination}
            refetch={refetch}
          />
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}

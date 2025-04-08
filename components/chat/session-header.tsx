"use client";

import { Loader2, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { SessionRecord } from "@/services/powerdrill/session.service";

interface SessionHeaderProps {
  session?: SessionRecord;
  loading?: boolean;
  onNewSession?: () => void;
}

export default function SessionHeader({
  session,
  loading,
  onNewSession,
}: SessionHeaderProps) {
  return (
    <div className="bg-background supports-[backdrop-filter]:bg-background/60 flex items-center justify-between gap-2 border-b px-2 py-2 shadow-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <h4 className="text-lg font-semibold">
          {session?.name || "Unnamed Session"}
        </h4>
        <div className="flex items-center gap-2">
          <TooltipWrapper title="Start New Session">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={loading}
              onClick={onNewSession}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlusIcon className="size-4" />
              )}
            </Button>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  );
}

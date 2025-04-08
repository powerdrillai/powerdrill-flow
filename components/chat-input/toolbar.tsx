import { ArrowUpIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { FileSelector } from "../file-selector";

interface ToolbarProps {
  onAttachmentClick?: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  hasInput: boolean;
  sessionId: string;
}

export function Toolbar({
  onSubmit,
  isLoading,
  hasInput,
  sessionId,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-grow"></div>
      <div className="flex items-center gap-3">
        <FileSelector disabled={isLoading} sessionId={sessionId} />
        <Separator orientation="vertical" className="h-8" />
        <Button
          type="button"
          onClick={onSubmit}
          className="bg-primary hover:bg-primary/90 size-10 rounded-full transition-colors"
          disabled={!hasInput || isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="size-5 animate-spin text-white" />
          ) : (
            <ArrowUpIcon className="size-5 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}

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
    <div className="flex items-center justify-end px-4 pb-3">
      <div className="flex items-center gap-2">
        <FileSelector disabled={isLoading} sessionId={sessionId} />
        <Separator orientation="vertical" className="h-8" />
        <Button
          type="button"
          onClick={onSubmit}
          className="size-8 rounded-full"
          disabled={!hasInput || isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin text-white" />
          ) : (
            <ArrowUpIcon className="size-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}

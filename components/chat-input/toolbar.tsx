import { ArrowUpIcon, DatabaseIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { FileSelector } from "../file-selector";

interface ToolbarProps {
  onAttachmentClick?: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  hasInput: boolean;
  sessionId: string;
  datasetId?: string;
  datasetName?: string;
}

export function Toolbar({
  onSubmit,
  isLoading,
  hasInput,
  sessionId,
  datasetId,
  datasetName,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-grow">
        {datasetId && datasetName && (
          <div className="text-xs text-gray-400/70 flex items-center gap-1">
            <DatabaseIcon className="size-3" />
            {datasetName} ({datasetId})
          </div>
        )}
      </div>
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

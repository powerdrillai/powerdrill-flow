import { IconCircleXFilled } from "@tabler/icons-react";
import { Loader2Icon } from "lucide-react";

import { cn, formatBytes } from "@/lib/utils";
import { SelectedDataset } from "@/types/data";

import { Button } from "../ui/button";
import { FileIcon } from "../ui/file-icons";
import { TooltipWrapper } from "../ui/tooltip-wrapper";

interface DatasetInfoProps {
  dataset: SelectedDataset | null;
  onChange: (dataset: SelectedDataset | null) => void;
}

export function DatasetInfo({ dataset, onChange }: DatasetInfoProps) {
  if (!dataset) return null;
  const { datasource } = dataset;

  const handleUnselect = (id: string) => {
    const newDataset = {
      ...dataset,
      datasource: datasource.filter((item) => item.id !== id),
    };
    // Clear dataset if no data source remains after deletion
    if (newDataset.datasource.length === 0) {
      onChange(null);
    } else {
      onChange(newDataset);
    }
  };

  return (
    <div className="relative flex items-center gap-3 overflow-x-auto px-4 py-3">
      {datasource.map((item) => {
        const status = item.status || "creating";
        const fileType = item.name.split(".").pop()?.toLowerCase();
        const FileIconComponent = FileIcon[fileType as keyof typeof FileIcon];
        const isCompleted = status === "synched";

        return (
          <div
            key={item.id}
            className={cn(
              "relative flex w-[200px] items-center gap-1.5 rounded-md border px-1 py-1.5 shadow-sm",
              !isCompleted && "bg-muted"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-1 -right-1 size-3"
              onClick={() => handleUnselect(item.id)}
            >
              <IconCircleXFilled size={12} stroke={1.5} />
            </Button>
            <div className="relative shrink-0">
              {!isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2Icon className="animate-spin" />
                </div>
              )}
              <FileIconComponent
                className={cn("w-5 opacity-30", isCompleted && "opacity-100")}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <TooltipWrapper title={item.name}>
                  <div className="w-[90%] truncate text-xs font-medium">
                    {item.name}
                  </div>
                </TooltipWrapper>
              </div>
              {status === "creating" && (
                <div className="text-muted-foreground text-xs">creating...</div>
              )}
              {status === "synching" && (
                <div className="text-muted-foreground text-xs">synching...</div>
              )}
              {status === "synched" && (
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground text-xs">
                    {formatBytes(item.size || 0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

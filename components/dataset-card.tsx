"use client";

import {
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { deleteDataset } from "@/services/powerdrill/dataset.service";
import { DatasetRecord } from "@/types/data";

interface DatasetCardProps {
  dataset: DatasetRecord;
  onClick: (dataset: DatasetRecord) => void;
  onDelete?: (datasetId: string) => void;
}

type StatusType = "synched" | "invalid" | "synching";
type BadgeVariant =
  | "success"
  | "destructive"
  | "pending"
  | "default"
  | "secondary"
  | "outline";

type StatusConfig = Record<
  StatusType,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    variant: BadgeVariant;
    label: string;
    className?: string;
  }
>;

export function DatasetCard({ dataset, onClick, onDelete }: DatasetCardProps) {
  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the text to display
  const summaryText =
    dataset.summary || dataset.description || "No summary available";

  // Status can be "synched", "invalid", or "synching"
  const status = (dataset.status || "synched") as StatusType;

  // Status badge config
  const statusConfig: StatusConfig = {
    synched: {
      icon: CheckCircle2,
      variant: "success",
      label: "Synched",
    },
    invalid: {
      icon: AlertCircle,
      variant: "destructive",
      label: "Invalid",
    },
    synching: {
      icon: Loader2,
      variant: "pending",
      label: "Synching",
      className: "animate-spin",
    },
  };

  const { icon: StatusIcon, variant, label, className } = statusConfig[status];

  // Get keywords to display
  const keywords = dataset.keywords || [];
  const displayKeywords = keywords.slice(0, 3); // Display max 3 keywords

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  // Handle dataset deletion
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteDataset(dataset.id);
      setShowDeleteDialog(false);
      appToast.success("Dataset deleted", {
        description: `Dataset "${dataset.name}" has been deleted successfully.`,
      });
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(dataset.id);
      }
    } catch (error) {
      appToast.error("Failed to delete dataset", {
        description: `There was an error deleting the dataset. Please try again.`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className="hover:border-primary/50 w-full cursor-pointer transition-all duration-200 hover:shadow-md relative group"
        onClick={() => onClick(dataset)}
      >
      <CardHeader className="flex h-full flex-col py-3">
        <div className="flex w-full items-center justify-between">
          <TooltipWrapper title={dataset.name} side="top">
            <CardTitle className="flex max-w-[calc(100%-90px)] items-center gap-1 truncate text-sm font-medium">
              <Database className="text-primary h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{dataset.name}</span>
            </CardTitle>
          </TooltipWrapper>
          <Badge
            variant={variant}
            className={cn(
              "flex h-5 min-w-[70px] flex-shrink-0 items-center justify-center gap-1 px-2 text-xs",
              className
            )}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {label}
          </Badge>
        </div>

        {/* Keywords */}

        <div className="mt-0.5 mb-0.5 flex min-h-[30px] flex-wrap gap-1">
          {displayKeywords.map((keyword, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-muted/30 flex h-4 items-center gap-0.5 px-1.5 text-[10px]"
            >
              <Tag className="h-2 w-2" />
              {keyword}
            </Badge>
          ))}
          {keywords.length > 3 && (
            <span className="text-muted-foreground text-[10px]">
              +{keywords.length - 3} more
            </span>
          )}
        </div>

        <TooltipWrapper title={summaryText} side="bottom">
          <CardDescription className="mt-1 text-xs">
            <div className="summary-truncate">{summaryText}</div>
          </CardDescription>
        </TooltipWrapper>
      </CardHeader>

      {/* Delete button */}
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <TooltipWrapper title="Delete dataset">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </TooltipWrapper>
      </div>
    </Card>

    {/* Delete confirmation dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the dataset "{dataset.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

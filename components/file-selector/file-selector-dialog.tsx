"use client";

import { useEffect, useState } from "react";

import { FileTree } from "@/components/file-selector/file-tree";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectedDataset } from "@/types/data";

interface FileSelectorDialogProps {
  open: boolean;
  dataset: SelectedDataset | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (selected: SelectedDataset) => void;
}

export default function FileSelectorDialog({
  open,
  dataset,
  onOpenChange,
  onSelect,
}: FileSelectorDialogProps) {
  const [selectedDataset, setSelectedDataset] =
    useState<SelectedDataset | null>(null);

  const handleSelect = () => {
    if (selectedDataset) {
      onSelect(selectedDataset);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (dataset) {
      setSelectedDataset(dataset);
    }
  }, [dataset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Dataset</DialogTitle>
        </DialogHeader>
        <div className="h-[400px] overflow-auto">
          <FileTree onSelect={setSelectedDataset} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSelect} disabled={!selectedDataset}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

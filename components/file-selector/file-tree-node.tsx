"use client";

import { ChevronDown, ChevronRight, FileIcon, FolderIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type NodeType = "dataset" | "datasource";

export interface TreeNodeProps {
  id: string;
  name: string;
  type: NodeType;
  parentId?: string;
  expanded?: boolean;
  selected?: boolean;
  hasChildren?: boolean;
  onToggle?: (id: string, type: NodeType) => void;
  onSelect?: (id: string, type: NodeType, parentId?: string) => void;
  children?: React.ReactNode;
}

export function TreeNode({
  id,
  name,
  type,
  parentId,
  expanded = false,
  selected = false,
  hasChildren = false,
  onToggle,
  onSelect,
  children,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
      onToggle?.(id, type);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id, type, parentId);
  };

  return (
    <div>
      <div
        className={cn(
          "hover:bg-accent flex cursor-pointer items-center gap-1 rounded-md px-2 py-1",
          selected && "bg-accent text-accent-foreground"
        )}
        onClick={handleToggle}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="hover:bg-muted rounded-full p-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        {type === "dataset" ? (
          <FolderIcon className="h-4 w-4 text-blue-500" />
        ) : (
          <FileIcon className="h-4 w-4 text-green-500" />
        )}

        <span className="flex-1 truncate" onClick={handleSelect} title={name}>
          {name}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div className="border-border ml-6 border-l pl-2">{children}</div>
      )}
    </div>
  );
}

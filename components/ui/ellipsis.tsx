"use client";

import React from "react";

import { cn } from "@/lib/utils";

import { TooltipWrapper } from "./tooltip-wrapper";

export interface EllipsisProps {
  children: React.ReactNode;
  className?: string;
  component?: React.ElementType;
}

export function Ellipsis({
  children,
  className,
  component: Component = "p",
}: EllipsisProps) {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    if (spanRef.current) {
      setShowTooltip(spanRef.current.offsetWidth < spanRef.current.scrollWidth);
    }
  }, [children]);

  if (!showTooltip) {
    return (
      <Component
        ref={spanRef}
        className={cn(
          "truncate overflow-hidden text-ellipsis whitespace-nowrap",
          className,
          "inline-block max-w-full"
        )}
      >
        {children}
      </Component>
    );
  }

  return (
    <TooltipWrapper title={children}>
      <Component
        ref={spanRef}
        className={cn(
          "truncate overflow-hidden text-ellipsis whitespace-nowrap",
          className,
          "inline-block max-w-full"
        )}
      >
        {children}
      </Component>
    </TooltipWrapper>
  );
}

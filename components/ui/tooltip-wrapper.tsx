import { TooltipArrow } from "@radix-ui/react-tooltip";

import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export const TooltipWrapper = ({
  children,
  title,
  side = "top",
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) => {
  if (!title) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <ShadcnTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="max-w-64">
          {title}
          <TooltipArrow width={11} height={5} />
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
};

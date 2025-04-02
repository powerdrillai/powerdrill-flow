import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "./button";
import { TooltipWrapper } from "./tooltip-wrapper";

interface Props extends ButtonProps {
  text: string;
}

export function CopyIconButton({ text, className }: Props) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
  };

  return (
    <TooltipWrapper title={hasCopied ? "Copied" : "Copy"}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("h-[38px] w-[38px]", className)}
        onClick={handleCopy}
      >
        {hasCopied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
        <span className="sr-only">{hasCopied ? "Copied" : "Copy"}</span>
      </Button>
    </TooltipWrapper>
  );
}

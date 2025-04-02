import { ChevronUpIcon, CodeIcon } from "lucide-react";
import { FC, memo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CopyIconButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MessageCodeBlockProps {
  language: string;
  value: string;
}

interface languageMap {
  [key: string]: string | undefined;
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
};

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789"; // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return lowercase ? result.toLowerCase() : result;
};

export const MessageCodeBlock: FC<MessageCodeBlockProps> = memo(
  ({ language, value }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative w-full rounded-md bg-zinc-950 font-sans">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div
            className={cn(
              "flex h-9 w-full items-center justify-between bg-zinc-700 px-4 text-white",
              open ? "rounded-t-md" : "rounded-md"
            )}
          >
            <div className="flex items-center space-x-2">
              <CodeIcon className="h-4 w-4" />
              <span className="text-xs">{language}</span>
            </div>
            <div className="flex min-w-[50%] items-center justify-end space-x-4">
              {open && (
                <>
                  <div
                    className="flex items-center space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CopyIconButton
                      text={value}
                      className="h-6 w-6 border-none bg-transparent text-xs"
                    />
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                </>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronUpIcon
                    className={cn(
                      "transition-transform",
                      open ? "" : "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              // showLineNumbers
              customStyle={{
                margin: 0,
                width: "100%",
                background: "transparent",
              }}
              codeTagProps={{
                style: {
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                },
              }}
            >
              {value}
            </SyntaxHighlighter>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);

MessageCodeBlock.displayName = "MessageCodeBlock";

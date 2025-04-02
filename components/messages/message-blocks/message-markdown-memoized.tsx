import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";

interface MessageMarkdownProps extends Options {
  className?: string;
}

export const MessageMarkdownMemoized: FC<MessageMarkdownProps> = memo(
  ({ className, ...props }) => (
    <div className={className}>
      <ReactMarkdown {...props} />
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

MessageMarkdownMemoized.displayName = "MessageMarkdownMemoized";

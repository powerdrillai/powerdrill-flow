import Image from "next/image";
import remarkGfm from "remark-gfm";

import { MessageCodeBlock } from "./message-codeblock";
import { MessageMarkdownMemoized } from "./message-markdown-memoized";

interface MessageMarkdownProps {
  content: string;
}

export const MessageMarkdown = ({ content }: MessageMarkdownProps) => {
  return (
    <MessageMarkdownMemoized
      className="min-w-full space-y-3 break-words"
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p className="text-base leading-relaxed">{children}</p>;
        },
        h3({ children }) {
          return (
            <h3 className="my-4 scroll-m-20 text-xl font-semibold tracking-tight">
              {children}
            </h3>
          );
        },
        h4({ children }) {
          return (
            <h3 className="my-3 scroll-m-20 text-lg font-semibold tracking-tight">
              {children}
            </h3>
          );
        },
        img({ node: _node, src, alt, ..._props }) {
          return (
            <div className="relative w-full max-w-[100%] overflow-hidden">
              <Image
                src={src || ""}
                alt={alt || ""}
                width={1200}
                height={900}
                className="object-contain"
              />
            </div>
          );
        },
        ul({ children }) {
          return (
            <ul className="list-disc pl-6 text-base leading-relaxed">
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="list-decimal pl-6 text-base leading-relaxed">
              {children}
            </ol>
          );
        },
        li({ children }) {
          return <li className="mb-2">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-200 pl-4 text-base text-gray-600 italic">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-gray-300 bg-gray-100 p-2 text-base font-medium">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-gray-300 p-2 text-base">{children}</td>
          );
        },
        code({ node: _node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <div className="overflow-x-auto">
              <MessageCodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(children).replace(/\n$/, "")}
                {...props}
              />
            </div>
          ) : (
            <code
              {...props}
              className={`${className}`}
              style={{
                backgroundColor: "rgba(27, 31, 35, .05)",
                padding: "0.2em 0.4em",
                margin: 0,
                borderRadius: "3px",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </MessageMarkdownMemoized>
  );
};

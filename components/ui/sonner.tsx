"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      richColors
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border-2 shadow-lg font-medium text-base flex gap-3 items-start",
          title: "text-base font-semibold flex-1",
          description: "text-sm mt-1 opacity-90",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-2 py-1 rounded-md",
          cancelButton: "text-xs px-2 py-1 rounded-md",
          success:
            "!bg-green-50 !text-green-900 !border-green-300 dark:!bg-green-900/90 dark:!text-green-50 dark:!border-green-700 toast-success",
          error:
            "!bg-red-50 !text-red-900 !border-red-300 dark:!bg-red-900/90 dark:!text-red-50 dark:!border-red-700 toast-error",
          info: "!bg-blue-50 !text-blue-900 !border-blue-300 dark:!bg-blue-900/90 dark:!text-blue-50 dark:!border-blue-700 toast-info",
          warning:
            "!bg-yellow-50 !text-yellow-900 !border-yellow-300 dark:!bg-yellow-900/90 dark:!text-yellow-50 dark:!border-yellow-700 toast-warning",
          default:
            "!bg-white !text-gray-900 !border-gray-300 dark:!bg-gray-800/90 dark:!text-gray-50 dark:!border-gray-600 toast-default",
          loader: "text-primary",
        },
      }}
      style={
        {
          "--normal-bg": theme === "dark" ? "oklch(0.2 0 0 / 0.95)" : "white",
          "--normal-text":
            theme === "dark" ? "oklch(0.95 0 0)" : "oklch(0.145 0 0)",
          "--normal-border":
            theme === "dark" ? "oklch(0.3 0 0)" : "oklch(0.87 0 0)",

          "--success-bg":
            theme === "dark"
              ? "oklch(0.3 0.15 145 / 0.95)"
              : "oklch(0.95 0.05 145)",
          "--success-text":
            theme === "dark" ? "oklch(0.95 0.05 145)" : "oklch(0.3 0.15 145)",
          "--success-border":
            theme === "dark" ? "oklch(0.4 0.15 145)" : "oklch(0.85 0.1 145)",

          "--error-bg":
            theme === "dark"
              ? "oklch(0.3 0.15 25 / 0.95)"
              : "oklch(0.95 0.05 25)",
          "--error-text":
            theme === "dark" ? "oklch(0.95 0.05 25)" : "oklch(0.3 0.15 25)",
          "--error-border":
            theme === "dark" ? "oklch(0.4 0.15 25)" : "oklch(0.85 0.1 25)",

          "--info-bg":
            theme === "dark"
              ? "oklch(0.3 0.15 245 / 0.95)"
              : "oklch(0.95 0.05 245)",
          "--info-text":
            theme === "dark" ? "oklch(0.95 0.05 245)" : "oklch(0.3 0.15 245)",
          "--info-border":
            theme === "dark" ? "oklch(0.4 0.15 245)" : "oklch(0.85 0.1 245)",

          "--warning-bg":
            theme === "dark"
              ? "oklch(0.3 0.15 85 / 0.95)"
              : "oklch(0.95 0.05 85)",
          "--warning-text":
            theme === "dark" ? "oklch(0.95 0.05 85)" : "oklch(0.3 0.15 85)",
          "--warning-border":
            theme === "dark" ? "oklch(0.4 0.15 85)" : "oklch(0.85 0.1 85)",

          "--font-size": "1rem",
          "--shadow": "0 8px 20px rgba(0,0,0,0.2)",
          "--border-radius": "0.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

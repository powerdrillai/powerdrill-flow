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
            "bg-green-900/90 text-green-50 border-green-700 toast-success",
          error: "bg-red-900/90 text-red-50 border-red-700 toast-error",
          info: "bg-blue-900/90 text-blue-50 border-blue-700 toast-info",
          warning:
            "bg-yellow-900/90 text-yellow-50 border-yellow-700 toast-warning",
          default: "bg-gray-800/90 text-gray-50 border-gray-600 toast-default",
          loader: "text-primary",
        },
      }}
      style={
        {
          "--normal-bg": "oklch(0.2 0 0 / 0.95)",
          "--normal-text": "oklch(0.95 0 0)",
          "--normal-border": "oklch(0.3 0 0)",

          "--success-bg": "oklch(0.3 0.15 145 / 0.95)",
          "--success-text": "oklch(0.95 0.05 145)",
          "--success-border": "oklch(0.4 0.15 145)",

          "--error-bg": "oklch(0.3 0.15 25 / 0.95)",
          "--error-text": "oklch(0.95 0.05 25)",
          "--error-border": "oklch(0.4 0.15 25)",

          "--info-bg": "oklch(0.3 0.15 245 / 0.95)",
          "--info-text": "oklch(0.95 0.05 245)",
          "--info-border": "oklch(0.4 0.15 245)",

          "--warning-bg": "oklch(0.3 0.15 85 / 0.95)",
          "--warning-text": "oklch(0.95 0.05 85)",
          "--warning-border": "oklch(0.4 0.15 85)",

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

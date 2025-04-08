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
      toastOptions={{
        classNames: {
          toast: "border-2 shadow-lg font-medium text-base",
          title: "text-base font-semibold",
          description: "text-sm mt-1",
          success:
            "!bg-green-50 !text-green-900 !border-green-300 dark:!bg-green-900 dark:!text-green-50 dark:!border-green-700",
          error:
            "!bg-red-50 !text-red-900 !border-red-300 dark:!bg-red-900 dark:!text-red-50 dark:!border-red-700",
          info: "!bg-blue-50 !text-blue-900 !border-blue-300 dark:!bg-blue-900 dark:!text-blue-50 dark:!border-blue-700",
          warning:
            "!bg-yellow-50 !text-yellow-900 !border-yellow-300 dark:!bg-yellow-900 dark:!text-yellow-50 dark:!border-yellow-700",
          default:
            "!bg-white !text-gray-900 !border-gray-300 dark:!bg-gray-800 dark:!text-gray-50 dark:!border-gray-600",
        },
      }}
      style={
        {
          "--normal-bg": theme === "dark" ? "hsl(233 18% 22%)" : "white",
          "--normal-text":
            theme === "dark" ? "hsl(173 24% 93%)" : "oklch(0.145 0 0)",
          "--normal-border":
            theme === "dark" ? "hsl(233 8% 40%)" : "oklch(0.87 0 0)",

          "--success-bg":
            theme === "dark" ? "hsl(142, 60%, 20%)" : "hsl(141, 85%, 95%)",
          "--success-text":
            theme === "dark" ? "hsl(142, 70%, 90%)" : "hsl(142, 75%, 24%)",
          "--success-border":
            theme === "dark" ? "hsl(142, 70%, 30%)" : "hsl(141, 85%, 85%)",

          "--error-bg":
            theme === "dark" ? "hsl(359, 60%, 25%)" : "hsl(359, 85%, 95%)",
          "--error-text":
            theme === "dark" ? "hsl(359, 70%, 90%)" : "hsl(359, 75%, 31%)",
          "--error-border":
            theme === "dark" ? "hsl(359, 70%, 35%)" : "hsl(359, 85%, 85%)",

          "--font-size": "1rem",
          "--shadow": "0 4px 12px rgba(0,0,0,0.15)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

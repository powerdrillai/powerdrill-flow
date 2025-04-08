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
          toast: "border-2 shadow-lg font-medium",
          title: "text-base font-semibold",
          description: "text-sm mt-1",
          success: "!bg-green-50 !text-green-900 !border-green-200",
          error: "!bg-red-50 !text-red-900 !border-red-200",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200",
          warning: "!bg-yellow-50 !text-yellow-900 !border-yellow-200",
          default: "!bg-white !text-gray-900 !border-gray-200",
        },
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "oklch(0.145 0 0)",
          "--normal-border": "oklch(0.87 0 0)",
          "--success-bg": "hsl(141, 85%, 95%)",
          "--success-text": "hsl(142, 75%, 24%)",
          "--success-border": "hsl(141, 85%, 85%)",
          "--error-bg": "hsl(359, 85%, 95%)",
          "--error-text": "hsl(359, 75%, 31%)",
          "--error-border": "hsl(359, 85%, 85%)",
          "--font-size": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

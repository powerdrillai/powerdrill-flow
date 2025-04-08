"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & Parameters<typeof NextThemesProvider>[0]) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

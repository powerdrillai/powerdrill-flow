"use client";

import { AppProgressProvider } from "@bprogress/next";

export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AppProgressProvider
      height="2px"
      color="hsl(251, 96%, 69%)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </AppProgressProvider>
  );
};

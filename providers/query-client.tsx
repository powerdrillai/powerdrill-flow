"use client";

import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryClientProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each request
  // This prevents cache sharing between server-side rendering and client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
}

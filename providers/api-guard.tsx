"use client";

import { useQuery } from "@tanstack/react-query";
import React, { ReactNode } from "react";

import { hasApiCredentials } from "@/lib/cookies/cookie-manager";

interface ApiGuardProps {
  children: ReactNode;
}

export function ApiGuardProvider({ children }: ApiGuardProps) {
  // Use TanStack Query to check API credentials, but don't redirect
  // Since middleware is handling the redirect now
  const { isLoading } = useQuery({
    queryKey: ["apiCredentials", "check"],
    queryFn: async () => {
      try {
        const hasCredentials = await hasApiCredentials();
        return hasCredentials;
      } catch (error) {
        console.error("Failed to check API credentials", error);
        return false;
      }
    },
  });

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
        <p>Verifying API settings...</p>
      </div>
    );
  }

  return <>{children}</>;
}

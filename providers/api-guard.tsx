"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

import { hasApiCredentials } from "@/lib/cookies/cookie-manager";

interface ApiGuardProps {
  children: ReactNode;
}

export function ApiGuardProvider({ children }: ApiGuardProps) {
  const router = useRouter();

  // Use TanStack Query to check API credentials
  const { data: isConfigured, isLoading } = useQuery({
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

  // Redirect to setup page when credentials check is complete and not configured
  useEffect(() => {
    if (isConfigured === false) {
      router.push("/setup");
    }
  }, [isConfigured, router]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p>Verifying API settings...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

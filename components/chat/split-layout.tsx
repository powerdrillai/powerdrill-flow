"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface SplitLayoutProps {
  collapsed: boolean;
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
  onToggle: (val: boolean) => void;
}

export default function SplitLayout({
  collapsed,
  children,
  sidebarContent,
  onToggle,
}: SplitLayoutProps) {
  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar */}
      <div
        className={`relative border-r transition-all duration-300 ease-in-out ${
          collapsed ? "w-0" : "w-[50vw]"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => onToggle(!collapsed)}
          className={`absolute top-24 -right-6 z-[1] flex h-12 w-6 items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-white shadow-md hover:bg-gray-50 ${
            collapsed ? "bg-blue-50 hover:bg-blue-100" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* Sidebar Content */}
        <div
          className={cn(
            `mx-auto h-full max-w-4xl overflow-hidden px-6`,
            collapsed ? "invisible" : "visible"
          )}
        >
          {/* Content to be added here */}
          {sidebarContent}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

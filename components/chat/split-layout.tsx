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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={`relative border-r transition-all duration-300 ease-in-out ${
          collapsed ? "w-0" : "w-[50vw]"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => onToggle(!collapsed)}
          className={`bg-background/90 hover:bg-background absolute top-24 -right-6 z-[1] flex h-12 w-6 items-center justify-center rounded-r-lg border border-l-0 shadow-md ${
            collapsed ? "bg-background/90 hover:bg-background" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight className="text-primary h-5 w-5" />
          ) : (
            <ChevronLeft className="text-primary h-5 w-5" />
          )}
        </button>

        {/* Sidebar Content */}
        <div
          className={cn(
            `h-full overflow-y-auto`,
            collapsed ? "invisible" : "visible"
          )}
        >
          <div className="mx-auto h-full max-w-4xl px-6">{sidebarContent}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-4 md:pb-8 lg:pb-12">
        {children}
      </div>
    </div>
  );
}

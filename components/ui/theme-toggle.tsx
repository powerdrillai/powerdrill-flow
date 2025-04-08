"use client";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 border-border/30 dark:border-border/5 dark:bg-background/10 size-8 backdrop-blur-sm"
            >
              <IconSun className="size-4 scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
              <IconMoon className="absolute size-4 scale-0 rotate-90 text-blue-300 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="dark:bg-background/95 dark:border-border/5 backdrop-blur-sm"
      >
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-3">
          <IconSun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-3">
          <IconMoon className="h-4 w-4 text-blue-300" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-3">
          <IconDeviceDesktop className="h-4 w-4 text-green-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

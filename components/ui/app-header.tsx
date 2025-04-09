"use client";

import { useMutation } from "@tanstack/react-query";
import { Github, Home, LogOut, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logoutApiCredentials } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { useSession } from "@/hooks/useSession";
import { appToast } from "@/lib/toast";

interface AppHeaderProps {
  title?: string;
  sessionId?: string;
  onNewSession?: () => void;
}

export function AppHeader({ title, sessionId, onNewSession }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCreating, createSession } = useSession(sessionId);

  // Determine title based on current route if not provided
  const headerTitle =
    title || (pathname.startsWith("/chat/") ? "Chat" : "Powerdrill Flow");

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await logoutApiCredentials();
      if (!res.success) {
        throw new Error("Failed to logout");
      }
      return res;
    },
    onSuccess: () => {
      appToast.success("Logged Out Successfully", {
        description: "You have been logged out of your account.",
      });
      router.push("/setup");
    },
    onError: () => {
      appToast.error("Logout Failed", {
        description: "There was a problem logging you out. Please try again.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateSession = async () => {
    try {
      if (onNewSession) {
        onNewSession();
        return;
      }

      // Default implementation if onNewSession is not provided
      const sessionName = "New Chat";
      const sessionId = await createSession({
        name: sessionName,
      });

      // Redirect to chat page
      router.push(`/chat/${sessionId}`);
    } catch (_error) {
      appToast.error("Session Creation Failed", {
        description: "Failed to create a new session. Please try again.",
      });
    }
  };

  return (
    <div className="bg-background supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 flex h-12 items-center justify-between overflow-hidden border-b px-4 shadow-sm backdrop-blur">
      <div className="flex min-w-0 flex-shrink items-center gap-2">
        <h4 className="truncate text-lg font-semibold">{headerTitle}</h4>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        {pathname.startsWith("/chat/") && (
          <TooltipWrapper title="Start New Session">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              disabled={isCreating}
              onClick={handleCreateSession}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="sr-only">New Session</span>
            </Button>
          </TooltipWrapper>
        )}
        <TooltipWrapper title="Open Source on GitHub">
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" asChild>
            <a
              href="https://github.com/powerdrillai/powerdrill-flow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </TooltipWrapper>
        <TooltipWrapper title="Home">
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </TooltipWrapper>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="h-8 w-8 p-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </Button>
      </div>
    </div>
  );
}

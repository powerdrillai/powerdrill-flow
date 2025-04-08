"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    // Set initial visibility based on scroll position
    setIsVisible(window.scrollY > 100);

    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Check once on mount
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      className={cn(
        "bg-primary hover:bg-primary/90 fixed right-8 bottom-8 z-50 rounded-full p-3 shadow-lg transition-opacity duration-300",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      size="icon"
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp className="text-primary-foreground h-5 w-5" />
    </Button>
  );
}

import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ApiGuardProvider } from "@/providers/api-guard";
import { ProgressProvider } from "@/providers/progress-provider";
import { QueryClientProvider } from "@/providers/query-client";
import { ThemeProvider } from "@/providers/theme-provider";

const geist_sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geist_mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Powerdrill Flow",
  description: "Make your data flow easily",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist_sans.variable} ${geist_mono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ProgressProvider>
            <QueryClientProvider>
              <ApiGuardProvider>
                <div className="flex min-h-screen flex-col">
                  <main className="flex flex-1 flex-col">{children}</main>
                </div>
              </ApiGuardProvider>
            </QueryClientProvider>
          </ProgressProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

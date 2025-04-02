import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ApiGuardProvider } from "@/providers/api-guard";
import { QueryClientProvider } from "@/providers/query-client";

const geist_sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geist_mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "PowerDrill Flow",
  description: "Make your data flow easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist_sans.variable} ${geist_mono.variable} antialiased`}
      >
        <QueryClientProvider>
          <ApiGuardProvider>{children}</ApiGuardProvider>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

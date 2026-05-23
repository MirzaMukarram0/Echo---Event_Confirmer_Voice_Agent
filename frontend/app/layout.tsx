import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const displayFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Echo Voice Agent",
  description: "Ops dashboard for outbound event confirmation calls.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

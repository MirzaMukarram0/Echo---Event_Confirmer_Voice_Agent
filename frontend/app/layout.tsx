import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ARIA — Voice Ops Center",
  description: "High-density operational dashboard for outbound confirmation automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-v-base text-v-text antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

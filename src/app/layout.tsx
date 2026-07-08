import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AppProviders } from "@/components/providers";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Real Estate Command Center",
  description:
    "Private real estate operations dashboard for transactions, clients, deadlines, documents, commissions, and daily workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

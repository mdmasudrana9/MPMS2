import { ReduxProviders } from "@/src/providers/ReduxProviders";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Manager",
  description: "Manage your projects and tasks efficiently",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning={true}>
        <ReduxProviders>{children}</ReduxProviders>
        <Analytics />
      </body>
    </html>
  );
}

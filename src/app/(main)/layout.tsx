"use client";

import dynamic from "next/dynamic";

const Sidebar = dynamic(
  () => import("@/src/components/sidebar").then((mod) => mod.Sidebar),
  { ssr: false }
);
const ProtectedRoute = dynamic(
  () => import("@/src/providers/ProtectedRoute").then((mod) => mod.default),
  { ssr: false }
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Sidebar />
      <main className="min-h-screen bg-background pt-16 lg:ml-64 lg:pt-0">
        {children}
      </main>
    </ProtectedRoute>
  );
}

"use client";

import { Sidebar } from "@/components/layout/Sidebar";

// Auth is enforced by src/middleware.ts before this layout renders.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

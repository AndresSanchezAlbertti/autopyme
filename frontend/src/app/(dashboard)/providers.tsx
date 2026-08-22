"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/layout/Sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

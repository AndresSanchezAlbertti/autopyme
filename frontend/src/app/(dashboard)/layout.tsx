export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "./providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </Providers>
  );
}

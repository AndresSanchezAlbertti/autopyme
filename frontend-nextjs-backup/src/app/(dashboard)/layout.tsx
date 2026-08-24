export const dynamic = "force-dynamic";

import { Providers } from "./providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

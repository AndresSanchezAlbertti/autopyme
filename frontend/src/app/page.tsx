// Root / is handled by middleware (src/middleware.ts) → redirects to /dashboard.
// This component is a fallback that should never render in practice.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}

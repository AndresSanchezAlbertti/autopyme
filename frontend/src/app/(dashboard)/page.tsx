// This route (/) is handled by src/middleware.ts → redirects to /dashboard.
// This file exists only because Next.js requires it for the route group layout
// to apply to nested routes. It should never be rendered.
import { notFound } from "next/navigation";

export default function DashboardGroupRoot() {
  notFound();
}

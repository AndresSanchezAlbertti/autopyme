import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoPyme — Automatización para PyMEs",
  description: "Captá, seguí y comunicá clientes automáticamente vía WhatsApp, formularios y email.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

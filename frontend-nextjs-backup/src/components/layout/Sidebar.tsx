"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Zap,
  Plug,
  Settings,
  LogOut,
  Bot,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",       icon: LayoutDashboard, label: "Dashboard"        },
  { href: "/leads",           icon: Users,           label: "Leads"            },
  { href: "/productos",       icon: BookOpen,        label: "Productos"        },
  { href: "/conversations",   icon: MessageSquare,   label: "Conversaciones"   },
  { href: "/automations",     icon: Zap,             label: "Automatizaciones" },
  { href: "/integrations",    icon: Plug,            label: "Integraciones"    },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
          <Bot className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-base font-bold text-gray-900">AutoPyme</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-brand-600" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 flex flex-col gap-0.5">
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}

        {/* User profile */}
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {getInitials(user?.full_name ?? user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-900">
              {user?.full_name ?? "Usuario"}
            </p>
            <p className="truncate text-[10px] text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

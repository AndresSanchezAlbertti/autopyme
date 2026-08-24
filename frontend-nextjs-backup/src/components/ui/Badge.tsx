import { cn } from "@/lib/utils";
import type { LeadStatus, LeadSource, IntegrationStatus, AutomationStatus } from "@/types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "gray";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger:  "bg-red-100 text-red-700",
  info:    "bg-blue-100 text-blue-700",
  purple:  "bg-purple-100 text-purple-700",
  gray:    "bg-gray-100 text-gray-500",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-amber-500",
            variant === "danger"  && "bg-red-500",
            variant === "info"    && "bg-blue-500",
            variant === "purple"  && "bg-purple-500",
            variant === "default" && "bg-gray-500",
            variant === "gray"    && "bg-gray-400",
          )}
        />
      )}
      {children}
    </span>
  );
}

// ─── Status-specific helpers ─────────────────────────────────────────────────

const leadStatusConfig: Record<LeadStatus, { label: string; variant: BadgeVariant }> = {
  new:       { label: "Nuevo",      variant: "info"    },
  contacted: { label: "Contactado", variant: "purple"  },
  interested:{ label: "Interesado", variant: "warning" },
  won:       { label: "Ganado",     variant: "success" },
  lost:      { label: "Perdido",    variant: "danger"  },
  inactive:  { label: "Inactivo",   variant: "gray"    },
  archived:  { label: "Archivado",  variant: "gray"    },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = leadStatusConfig[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

const sourceConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  whatsapp:  { label: "WhatsApp",  variant: "success" },
  web_form:  { label: "Formulario",variant: "info"    },
  instagram: { label: "Instagram", variant: "purple"  },
  manual:    { label: "Manual",    variant: "gray"    },
};

export function LeadSourceBadge({ source }: { source: string | null }) {
  if (!source) return null;
  const cfg = sourceConfig[source] ?? { label: source, variant: "default" as BadgeVariant };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const integrationStatusConfig: Record<IntegrationStatus, { label: string; variant: BadgeVariant }> = {
  connected:    { label: "Conectado",    variant: "success" },
  disconnected: { label: "Desconectado", variant: "gray"    },
  error:        { label: "Error",        variant: "danger"  },
};

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const cfg = integrationStatusConfig[status];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

const automationStatusConfig: Record<AutomationStatus, { label: string; variant: BadgeVariant }> = {
  active:   { label: "Activa",   variant: "success" },
  inactive: { label: "Inactiva", variant: "gray"    },
  paused:   { label: "Pausada",  variant: "warning" },
  error:    { label: "Error",    variant: "danger"  },
};

export function AutomationStatusBadge({ status }: { status: AutomationStatus }) {
  const cfg = automationStatusConfig[status];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

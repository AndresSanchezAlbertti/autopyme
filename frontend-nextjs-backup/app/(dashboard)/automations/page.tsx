"use client";

import { useState } from "react";
import { Zap, Plus, Play, Pause, Settings, ChevronRight, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { AutomationStatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { AutomationStatus } from "@/types";

// Demo data
const DEMO_TEMPLATES = [
  {
    id: "t1",
    name: "Bienvenida a nuevo lead",
    description: "Envía un WhatsApp automático cuando llega un lead nuevo desde cualquier fuente.",
    category: "captación",
    icon: "👋",
  },
  {
    id: "t2",
    name: "Seguimiento sin respuesta",
    description: "Recontacta leads que no respondieron en 48 horas.",
    category: "seguimiento",
    icon: "⏰",
  },
  {
    id: "t3",
    name: "Notificación por email de nuevo lead",
    description: "Envía un email al equipo cuando se registra un lead desde el formulario web.",
    category: "notificaciones",
    icon: "📧",
  },
  {
    id: "t4",
    name: "Lead ganado → Google Sheets",
    description: "Exporta los datos del lead a una hoja de cálculo cuando pasa a estado Ganado.",
    category: "integración",
    icon: "📊",
  },
];

const DEMO_AUTOMATIONS: {
  id: string;
  name: string;
  template: string;
  status: AutomationStatus;
  lastRun: string | null;
  executions: number;
}[] = [
  {
    id: "a1",
    name: "Bienvenida WhatsApp",
    template: "Bienvenida a nuevo lead",
    status: "active",
    lastRun: new Date(Date.now() - 10 * 60000).toISOString(),
    executions: 47,
  },
  {
    id: "a2",
    name: "Follow-up 48h",
    template: "Seguimiento sin respuesta",
    status: "paused",
    lastRun: new Date(Date.now() - 2 * 86400000).toISOString(),
    executions: 12,
  },
];

function AutomationCard({
  automation,
  onToggle,
}: {
  automation: (typeof DEMO_AUTOMATIONS)[0];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-white border border-gray-100 shadow-card p-5">
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        automation.status === "active" ? "bg-green-100" :
        automation.status === "paused" ? "bg-amber-100" : "bg-gray-100"
      )}>
        <Zap className={cn(
          "h-5 w-5",
          automation.status === "active" ? "text-green-600" :
          automation.status === "paused" ? "text-amber-600" : "text-gray-400"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{automation.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Plantilla: {automation.template}</p>
          </div>
          <AutomationStatusBadge status={automation.status} />
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
            {automation.executions} ejecuciones
          </span>
          {automation.lastRun && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              Último: {new Date(automation.lastRun).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggle(automation.id)}
          className={cn(
            "rounded-lg p-2 transition-colors",
            automation.status === "active"
              ? "text-amber-600 hover:bg-amber-50"
              : "text-green-600 hover:bg-green-50"
          )}
          title={automation.status === "active" ? "Pausar" : "Activar"}
        >
          {automation.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(DEMO_AUTOMATIONS);

  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? ("paused" as const) : ("active" as const) }
          : a
      )
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Automatizaciones"
        subtitle="Configurá workflows automáticos para tu negocio"
        actions={
          <Button icon={<Plus className="h-4 w-4" />}>
            Nueva automatización
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Active automations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Mis automatizaciones
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                {automations.length}
              </span>
            </h2>
          </div>

          {automations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white border border-gray-100 shadow-card py-12 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <Zap className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">Sin automatizaciones activas</p>
              <p className="text-sm text-gray-400">Activá una plantilla para empezar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((a) => (
                <AutomationCard key={a.id} automation={a} onToggle={toggleStatus} />
              ))}
            </div>
          )}
        </section>

        {/* Templates */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Plantillas disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="group flex items-start gap-4 rounded-xl bg-white border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-shadow cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">
                  {tpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{tpl.name}</p>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{tpl.description}</p>
                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 capitalize">
                    {tpl.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* n8n banner */}
        <div className="rounded-xl bg-gray-900 p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Workflows avanzados con n8n</p>
              <p className="mt-0.5 text-sm text-gray-400">
                Accedé al editor visual de n8n para crear automatizaciones más complejas.
              </p>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_N8N_URL ?? "http://localhost:5678"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors"
            >
              Abrir n8n →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

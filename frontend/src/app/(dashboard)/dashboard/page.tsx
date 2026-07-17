"use client";

import { Users, MessageSquare, Zap, TrendingUp, ArrowUpRight, Clock, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/Card";
import { LeadStatusBadge, LeadSourceBadge } from "@/components/ui/Badge";
import { useLeads } from "@/hooks/useLeads";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { Lead } from "@/types";

// Mini activity item
function ActivityItem({ lead }: { lead: Lead }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
        {(lead.full_name ?? "?")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{lead.full_name ?? "Sin nombre"}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <LeadStatusBadge status={lead.status} />
          {lead.source && <LeadSourceBadge source={lead.source} />}
        </div>
      </div>
      <span className="shrink-0 text-xs text-gray-400">{timeAgo(lead.created_at)}</span>
    </div>
  );
}

// Funnel bar
const FUNNEL_STAGES: { status: string; label: string; color: string }[] = [
  { status: "new",        label: "Nuevos",      color: "bg-blue-400"   },
  { status: "contacted",  label: "Contactados", color: "bg-purple-400" },
  { status: "interested", label: "Interesados", color: "bg-amber-400"  },
  { status: "won",        label: "Ganados",     color: "bg-green-400"  },
];

export default function DashboardPage() {
  const { leads: allLeads, total, isLoading } = useLeads({ limit: 100 });
  const { leads: recentLeads } = useLeads({ limit: 8, page: 1 });

  const countByStatus = (status: string) =>
    allLeads.filter((l) => l.status === status).length;

  const wonLeads  = countByStatus("won");
  const newLeads  = countByStatus("new");
  const activeConvos = allLeads.filter((l) =>
    ["new", "contacted", "interested"].includes(l.status)
  ).length;

  const maxFunnel = Math.max(...FUNNEL_STAGES.map((s) => countByStatus(s.status)), 1);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Dashboard"
        subtitle="Resumen de tu actividad"
      />

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total de leads"
            value={isLoading ? "…" : total}
            icon={<Users />}
            color="blue"
            trend={{ value: 12, label: "vs. mes pasado" }}
          />
          <StatCard
            label="Leads nuevos"
            value={isLoading ? "…" : newLeads}
            icon={<TrendingUp />}
            color="purple"
          />
          <StatCard
            label="Conversaciones activas"
            value={isLoading ? "…" : activeConvos}
            icon={<MessageSquare />}
            color="amber"
          />
          <StatCard
            label="Cerrados ganados"
            value={isLoading ? "…" : wonLeads}
            icon={<CheckCircle />}
            color="green"
            trend={{ value: 8, label: "este mes" }}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent leads */}
          <div className="xl:col-span-2 rounded-xl bg-white border border-gray-100 shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">Leads recientes</h2>
              <Link
                href="/leads"
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="px-5 divide-y divide-gray-50">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-400">Cargando…</p>
              ) : recentLeads.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No hay leads todavía.</p>
              ) : (
                recentLeads.map((lead) => <ActivityItem key={lead.id} lead={lead} />)
              )}
            </div>
          </div>

          {/* Funnel */}
          <div className="rounded-xl bg-white border border-gray-100 shadow-card">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">Embudo de ventas</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {FUNNEL_STAGES.map((stage) => {
                const count = countByStatus(stage.status);
                const pct = Math.round((count / maxFunnel) * 100);
                return (
                  <div key={stage.status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{stage.label}</span>
                      <span className="text-xs font-semibold text-gray-700">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full transition-all ${stage.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Tasa de conversión</span>
                  <span className="font-semibold text-green-600">
                    {total > 0 ? Math.round((wonLeads / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Configurá tus automatizaciones</h3>
              <p className="mt-0.5 text-sm text-brand-100">
                Conectá WhatsApp y activá respuestas automáticas para nuevos leads.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href="/integrations"
                className="rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
              >
                Integraciones
              </Link>
              <Link
                href="/automations"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Automatizar
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

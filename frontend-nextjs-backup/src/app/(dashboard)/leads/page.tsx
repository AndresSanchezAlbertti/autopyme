"use client";

import { useState, useCallback } from "react";
import {
  Search, Plus, Trash2, Edit2, ChevronLeft, ChevronRight,
  Phone, Mail, Filter, SlidersHorizontal, Upload
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LeadStatusBadge, LeadSourceBadge } from "@/components/ui/Badge";
import { LeadForm } from "@/components/leads/LeadForm";
import { PageSpinner } from "@/components/ui/Spinner";
import { useLeads } from "@/hooks/useLeads";
import { leadsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { formatDate, getInitials, parseTags } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "new",        label: "Nuevo"      },
  { value: "contacted",  label: "Contactado" },
  { value: "interested", label: "Interesado" },
  { value: "won",        label: "Ganado"     },
  { value: "lost",       label: "Perdido"    },
  { value: "inactive",   label: "Inactivo"   },
  { value: "archived",   label: "Archivado"  },
];

const SOURCE_OPTIONS = [
  { value: "whatsapp",  label: "WhatsApp"   },
  { value: "web_form",  label: "Formulario" },
  { value: "instagram", label: "Instagram"  },
  { value: "manual",    label: "Manual"     },
];

const LIMIT = 20;

export default function LeadsPage() {
  const toast = useToast();

  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [source, setSource]     = useState("");
  const [page, setPage]         = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [createOpen, setCreateOpen]   = useState(false);
  const [editLead, setEditLead]       = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead]   = useState<Lead | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [importing, setImporting]     = useState(false);
  const [importResult, setImportResult] = useState<null | { importados: number; duplicados: number; sin_email: number; errores: number }>(null);

  const { leads, total, isLoading, mutate } = useLeads({
    q:      search  || undefined,
    status: (status as LeadStatus) || undefined,
    source: source  || undefined,
    page,
    limit: LIMIT,
  });

  const totalPages = Math.ceil(total / LIMIT);

  const handleDelete = async () => {
    if (!deleteLead) return;
    setDeleting(true);
    try {
      await leadsApi.delete(deleteLead.id);
      toast("Lead eliminado");
      setDeleteLead(null);
      mutate();
    } catch {
      toast("Error al eliminar el lead", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = useCallback(() => {
    setCreateOpen(false);
    setEditLead(null);
    mutate();
  }, [mutate]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/leads/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${document.cookie.match(/access_token=([^;]+)/)?.[1] ?? ""}` },
        body: formData,
      });
      const data = await res.json();
      setImportResult(data);
      mutate();
    } catch {
      toast("Error al importar el CSV", "error");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Leads"
        subtitle={`${total} contacto${total !== 1 ? "s" : ""} en total`}
        actions={
          <div className="flex gap-2">
            <label className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-white
                               px-3 py-2 text-sm font-medium text-gray-600 cursor-pointer
                               hover:bg-gray-50 transition-colors ${importing ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload className="h-4 w-4" />
              {importing ? "Importando..." : "Importar CSV"}
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} disabled={importing} />
            </label>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              Nuevo lead
            </Button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Search & filters */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, email o teléfono…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filtros {(status || source) && <span className="ml-1 text-brand-600">●</span>}
          </Button>
        </div>

        {showFilters && (
          <div className="flex gap-3 rounded-xl bg-white border border-gray-100 shadow-card px-4 py-3">
            <div className="w-44">
              <Select
                placeholder="Todos los estados"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-44">
              <Select
                placeholder="Todos los orígenes"
                options={SOURCE_OPTIONS}
                value={source}
                onChange={(e) => { setSource(e.target.value); setPage(1); }}
              />
            </div>
            {(status || source) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatus(""); setSource(""); setPage(1); }}
              >
                Limpiar
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-card overflow-hidden">
          {isLoading ? (
            <PageSpinner />
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="rounded-full bg-gray-100 p-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-700">No se encontraron leads</p>
                <p className="text-sm text-gray-400">
                  {search || status || source
                    ? "Probá cambiando los filtros."
                    : "Creá tu primer lead con el botón de arriba."}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Origen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                    Etiquetas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden xl:table-cell">
                    Creado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 group">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                          {getInitials(lead.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                            {lead.full_name ?? "Sin nombre"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {lead.phone}
                              </span>
                            )}
                            {lead.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" /> {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <LeadSourceBadge source={lead.source} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {parseTags(lead.tags).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden xl:table-cell whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditLead(lead)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteLead(lead)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400">
                Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Import Result */}
      <Modal
        open={!!importResult}
        onClose={() => setImportResult(null)}
        title="Resultado de la importación"
        size="sm"
      >
        {importResult && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Importados",  value: importResult.importados,  color: "text-green-600" },
                { label: "Duplicados",  value: importResult.duplicados,  color: "text-yellow-600" },
                { label: "Sin email",   value: importResult.sin_email,   color: "text-gray-400" },
                { label: "Errores",     value: importResult.errores,     color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => setImportResult(null)}>Cerrar</Button>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo lead" size="md">
        <LeadForm onSuccess={handleSuccess} onCancel={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editLead}
        onClose={() => setEditLead(null)}
        title="Editar lead"
        size="md"
      >
        {editLead && (
          <LeadForm
            lead={editLead}
            onSuccess={handleSuccess}
            onCancel={() => setEditLead(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteLead}
        onClose={() => setDeleteLead(null)}
        title="¿Eliminar lead?"
        description={`Esto eliminará a "${deleteLead?.full_name ?? "este lead"}" de forma permanente.`}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteLead(null)}>
            Cancelar
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, Tag, Edit2, Trash2,
  MessageSquare, User, Calendar, Globe
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LeadStatusBadge, LeadSourceBadge } from "@/components/ui/Badge";
import { LeadForm } from "@/components/leads/LeadForm";
import { PageSpinner } from "@/components/ui/Spinner";
import { useLead } from "@/hooks/useLeads";
import { leadsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime, parseTags, getInitials } from "@/lib/utils";
import Link from "next/link";

export default function LeadDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const toast    = useToast();
  const id       = params.id as string;

  const { lead, isLoading, mutate } = useLead(id);
  const [editOpen, setEditOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await leadsApi.delete(id);
      toast("Lead eliminado");
      router.push("/leads");
    } catch {
      toast("Error al eliminar el lead", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  if (!lead) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-500">Lead no encontrado.</p>
        <Link href="/leads">
          <Button variant="secondary">Volver a leads</Button>
        </Link>
      </div>
    );
  }

  const tags = parseTags(lead.tags);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title={lead.full_name ?? "Lead sin nombre"}
        subtitle="Detalle del contacto"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit2 className="h-3.5 w-3.5" />}
              onClick={() => setEditOpen(true)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setDeleteOpen(true)}
            >
              Eliminar
            </Button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Back */}
        <Link
          href="/leads"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a leads
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main card */}
          <div className="xl:col-span-2 space-y-5">
            {/* Profile */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700">
                  {getInitials(lead.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {lead.full_name ?? "Sin nombre"}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <LeadStatusBadge status={lead.status} />
                        {lead.source && <LeadSourceBadge source={lead.source} />}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                        <a href={`tel:${lead.phone}`} className="hover:text-brand-600">
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                        <a href={`mailto:${lead.email}`} className="hover:text-brand-600 truncate">
                          {lead.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interest / notes */}
            {lead.interest && (
              <div className="rounded-xl bg-white border border-gray-100 shadow-card p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Interés / Nota</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{lead.interest}</p>
              </div>
            )}

            {/* Conversations placeholder */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Conversaciones</h3>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="rounded-full bg-gray-100 p-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Sin conversaciones aún.</p>
                <p className="text-xs text-gray-400">
                  Las conversaciones de WhatsApp e email aparecerán aquí automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Detalles</h3>
              <dl className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Calendar className="h-3.5 w-3.5" /> Creado
                  </dt>
                  <dd className="text-xs text-gray-700 text-right">
                    {formatDateTime(lead.created_at)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Calendar className="h-3.5 w-3.5" /> Actualizado
                  </dt>
                  <dd className="text-xs text-gray-700 text-right">
                    {formatDateTime(lead.updated_at)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Globe className="h-3.5 w-3.5" /> Origen
                  </dt>
                  <dd>
                    {lead.source
                      ? <LeadSourceBadge source={lead.source} />
                      : <span className="text-xs text-gray-400">—</span>}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <User className="h-3.5 w-3.5" /> Asignado a
                  </dt>
                  <dd className="text-xs text-gray-700">—</dd>
                </div>
              </dl>
            </div>

            {/* Quick actions */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-5 space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Abrir WhatsApp
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Enviar email
                </a>
              )}
              <button
                onClick={() => setEditOpen(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Cambiar estado
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar lead" size="md">
        <LeadForm
          lead={lead}
          onSuccess={() => { setEditOpen(false); mutate(); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="¿Eliminar lead?"
        description={`Esto eliminará a "${lead.full_name ?? "este lead"}" de forma permanente.`}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}

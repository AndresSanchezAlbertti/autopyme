"use client";

import { useState } from "react";
import {
  MessageSquare, Mail, Table, Workflow, Link2, CheckCircle2,
  XCircle, AlertCircle, ExternalLink, RefreshCw
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { IntegrationStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { IntegrationStatus } from "@/types";

interface IntegrationDef {
  id: string;
  provider: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: IntegrationStatus;
  configFields?: { key: string; label: string; type?: string; placeholder?: string }[];
  docsUrl?: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "int1",
    provider: "whatsapp",
    name: "WhatsApp Business",
    description: "Recibí y respondé mensajes de WhatsApp directamente. Requiere acceso a WhatsApp Cloud API de Meta.",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "bg-green-100 text-green-600",
    status: "disconnected",
    configFields: [
      { key: "phone_number_id", label: "Phone Number ID", placeholder: "123456789" },
      { key: "token", label: "Access Token", type: "password", placeholder: "EAA..." },
      { key: "verify_token", label: "Verify Token", placeholder: "mi_token_secreto" },
    ],
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
  },
  {
    id: "int2",
    provider: "gmail",
    name: "Gmail / SMTP",
    description: "Enviá emails automáticos a leads. Configurá tu cuenta de Gmail o servidor SMTP propio.",
    icon: <Mail className="h-6 w-6" />,
    color: "bg-red-100 text-red-600",
    status: "connected",
    configFields: [
      { key: "smtp_host", label: "Host SMTP", placeholder: "smtp.gmail.com" },
      { key: "smtp_port", label: "Puerto", placeholder: "587" },
      { key: "smtp_user", label: "Usuario", placeholder: "tu@gmail.com" },
      { key: "smtp_pass", label: "Contraseña / App Password", type: "password" },
    ],
  },
  {
    id: "int3",
    provider: "google_sheets",
    name: "Google Sheets",
    description: "Exportá leads a una hoja de cálculo automáticamente. Se configura via n8n.",
    icon: <Table className="h-6 w-6" />,
    color: "bg-emerald-100 text-emerald-600",
    status: "disconnected",
    docsUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/",
  },
  {
    id: "int4",
    provider: "n8n",
    name: "n8n Workflows",
    description: "Conectá el backend con tu instancia de n8n para activar workflows automáticamente.",
    icon: <Workflow className="h-6 w-6" />,
    color: "bg-orange-100 text-orange-600",
    status: "connected",
    configFields: [
      { key: "n8n_url", label: "URL de n8n", placeholder: "http://localhost:5678" },
      { key: "n8n_api_key", label: "API Key de n8n", type: "password" },
    ],
  },
];

function StatusIcon({ status }: { status: IntegrationStatus }) {
  if (status === "connected")
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "error")
    return <XCircle className="h-4 w-4 text-red-500" />;
  return <AlertCircle className="h-4 w-4 text-gray-300" />;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [configuring, setConfiguring]   = useState<IntegrationDef | null>(null);
  const [formValues, setFormValues]     = useState<Record<string, string>>({});
  const [saving, setSaving]             = useState(false);

  const openConfig = (int: IntegrationDef) => {
    setConfiguring(int);
    setFormValues({});
  };

  const handleSave = async () => {
    if (!configuring) return;
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === configuring.id ? { ...i, status: "connected" as IntegrationStatus } : i
      )
    );
    setSaving(false);
    setConfiguring(null);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: "disconnected" as IntegrationStatus } : i)
    );
  };

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Integraciones"
        subtitle={`${connectedCount} de ${integrations.length} conectadas`}
      />

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {integrations.map((int) => (
            <div
              key={int.id}
              className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 shadow-card px-4 py-3"
            >
              <div className={cn("h-8 w-8 shrink-0 rounded-lg flex items-center justify-center", int.color)}>
                {int.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{int.name}</p>
                <IntegrationStatusBadge status={int.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Integration cards */}
        <div className="space-y-3">
          {integrations.map((int) => (
            <div
              key={int.id}
              className="rounded-xl bg-white border border-gray-100 shadow-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  int.color
                )}>
                  {int.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{int.name}</h3>
                        <StatusIcon status={int.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 leading-relaxed max-w-xl">
                        {int.description}
                      </p>
                    </div>
                    <IntegrationStatusBadge status={int.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {int.status === "connected" ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RefreshCw className="h-3.5 w-3.5" />}
                          onClick={() => openConfig(int)}
                        >
                          Reconfigurar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(int.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          Desconectar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        icon={<Link2 className="h-3.5 w-3.5" />}
                        onClick={() => openConfig(int)}
                      >
                        Conectar
                      </Button>
                    )}
                    {int.docsUrl && (
                      <a
                        href={int.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors"
                      >
                        Documentación <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Webhook info */}
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Webhook de formularios</h3>
          <p className="text-xs text-blue-700 mb-3">
            Usá este endpoint en tu formulario web para capturar leads automáticamente:
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-blue-100 border border-blue-200 px-3 py-2 font-mono text-xs text-blue-800">
            <span className="flex-1 truncate">
              {`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/v1/webhooks/forms/{tenant_id}`}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/v1/webhooks/forms/TU_TENANT_ID`);
              }}
              className="shrink-0 rounded px-2 py-0.5 text-[10px] bg-blue-200 hover:bg-blue-300 transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>
      </main>

      {/* Config Modal */}
      <Modal
        open={!!configuring}
        onClose={() => setConfiguring(null)}
        title={`Configurar ${configuring?.name}`}
        size="md"
      >
        {configuring && (
          <div className="space-y-4">
            {configuring.configFields && configuring.configFields.length > 0 ? (
              <>
                {configuring.configFields.map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, [field.key]: e.target.value }))
                    }
                  />
                ))}
                <p className="text-xs text-gray-400">
                  Las credenciales se almacenan de forma segura y nunca en texto plano en la base de datos.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setConfiguring(null)}>
                    Cancelar
                  </Button>
                  <Button loading={saving} onClick={handleSave}>
                    Guardar y conectar
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Esta integración se configura directamente en n8n. Hacé clic en el botón para abrir el editor.
                </p>
                <a
                  href={`${process.env.NEXT_PUBLIC_N8N_URL ?? "http://localhost:5678"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button icon={<ExternalLink className="h-4 w-4" />}>
                    Abrir n8n
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Save, Building2, User, Lock, Bell, Globe } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type Tab = "profile" | "business" | "notifications" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Perfil",         icon: <User className="h-4 w-4" />     },
  { id: "business",      label: "Negocio",         icon: <Building2 className="h-4 w-4" />},
  { id: "notifications", label: "Notificaciones",  icon: <Bell className="h-4 w-4" />     },
  { id: "security",      label: "Seguridad",        icon: <Lock className="h-4 w-4" />    },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const toast    = useToast();
  const [tab, setTab]     = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
  });

  const [business, setBusiness] = useState({
    name: "Mi PyME",
    business_type: "servicios",
    timezone: "America/Argentina/Buenos_Aires",
  });

  const [notif, setNotif] = useState({
    new_lead: true,
    message_received: true,
    automation_error: true,
    weekly_report: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast("Configuración guardada correctamente");
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Configuración" />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                  tab === t.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Profile */}
          {tab === "profile" && (
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Información de perfil</h2>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
                  {(user?.full_name ?? user?.email ?? "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.full_name ?? "—"}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>

              <Input
                label="Nombre completo"
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />

              <div className="flex justify-end pt-2">
                <Button icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}

          {/* Business */}
          {tab === "business" && (
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Datos del negocio</h2>

              <Input
                label="Nombre de la empresa"
                value={business.name}
                onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
              />
              <Input
                label="Tipo de negocio"
                placeholder="ej: servicios, retail, gastronómica…"
                value={business.business_type}
                onChange={(e) => setBusiness((b) => ({ ...b, business_type: e.target.value }))}
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Zona horaria</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={business.timezone}
                  onChange={(e) => setBusiness((b) => ({ ...b, timezone: e.target.value }))}
                >
                  <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
                  <option value="America/Bogota">Bogotá (UTC-5)</option>
                  <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                  <option value="America/Santiago">Santiago (UTC-3/-4)</option>
                  <option value="America/Lima">Lima (UTC-5)</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <Button icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Preferencias de notificaciones</h2>

              {[
                { key: "new_lead",          label: "Nuevo lead",                  desc: "Cuando llega un lead nuevo desde cualquier fuente." },
                { key: "message_received",  label: "Mensaje recibido",             desc: "Cuando un lead te escribe por WhatsApp o email." },
                { key: "automation_error",  label: "Error en automatización",      desc: "Cuando una automatización falla." },
                { key: "weekly_report",     label: "Reporte semanal",              desc: "Resumen de actividad cada lunes por la mañana." },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                  <div className="mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={notif[item.key as keyof typeof notif]}
                      onChange={(e) => setNotif((n) => ({ ...n, [item.key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </label>
              ))}

              <div className="flex justify-end pt-2">
                <Button icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
                  Guardar preferencias
                </Button>
              </div>
            </div>
          )}

          {/* Security */}
          {tab === "security" && (
            <div className="rounded-xl bg-white border border-gray-100 shadow-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Cambiar contraseña</h2>

              <Input
                label="Contraseña actual"
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              />
              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                error={
                  passwords.confirm && passwords.new !== passwords.confirm
                    ? "Las contraseñas no coinciden"
                    : undefined
                }
              />

              <div className="flex justify-end pt-2">
                <Button icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
                  Actualizar contraseña
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

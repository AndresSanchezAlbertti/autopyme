"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ModalFooter } from "@/components/ui/Modal";
import { leadsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Lead, LeadCreate, LeadUpdate } from "@/types";

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

interface LeadFormProps {
  lead?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const toast = useToast();
  const isEdit = !!lead;

  const [form, setForm] = useState({
    full_name: lead?.full_name ?? "",
    phone:     lead?.phone    ?? "",
    email:     lead?.email    ?? "",
    source:    lead?.source   ?? "manual",
    status:    lead?.status   ?? "new",
    interest:  lead?.interest ?? "",
    tags:      lead?.tags     ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name && !form.phone && !form.email) {
      errs.full_name = "Ingresá al menos nombre, teléfono o email";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name || undefined,
        phone:     form.phone     || undefined,
        email:     form.email     || undefined,
        source:    form.source    || undefined,
        status:    form.status    || undefined,
        interest:  form.interest  || undefined,
        tags:      form.tags      || undefined,
      };
      if (isEdit) {
        await leadsApi.update(lead.id, payload as LeadUpdate);
        toast("Lead actualizado correctamente");
      } else {
        await leadsApi.create(payload as LeadCreate);
        toast("Lead creado correctamente");
      }
      onSuccess();
    } catch {
      toast("Ocurrió un error. Intentá de nuevo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        placeholder="Ej: Juan García"
        value={form.full_name}
        onChange={(e) => set("full_name", e.target.value)}
        error={errors.full_name}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Teléfono"
          placeholder="+54 9 11 ..."
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="juan@ejemplo.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Origen"
          options={SOURCE_OPTIONS}
          value={form.source}
          onChange={(e) => set("source", e.target.value)}
        />
        {isEdit && (
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          />
        )}
      </div>
      <Textarea
        label="Interés / Nota"
        placeholder="¿Qué producto o servicio le interesa?"
        rows={3}
        value={form.interest}
        onChange={(e) => set("interest", e.target.value)}
      />
      <Input
        label="Etiquetas (separadas por comas)"
        placeholder="premium, seguimiento, urgente"
        value={form.tags}
        onChange={(e) => set("tags", e.target.value)}
      />
      <ModalFooter>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Guardar cambios" : "Crear lead"}
        </Button>
      </ModalFooter>
    </form>
  );
}

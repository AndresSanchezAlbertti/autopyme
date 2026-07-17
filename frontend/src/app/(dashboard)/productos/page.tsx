"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, BookOpen, Award, ToggleLeft, ToggleRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { productsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types";

// ─── Form ──────────────────────────────────────────────────────────────────

function ProductForm({
  product,
  onSuccess,
  onCancel,
}: {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:        product?.name        ?? "",
    description: product?.description ?? "",
    score:       product?.score       ?? "",
    status:      product?.status      ?? "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        score:       form.score.trim() || undefined,
        status:      form.status,
      };
      if (product) {
        await productsApi.update(product.id, payload);
        toast("Producto actualizado");
      } else {
        await productsApi.create(payload);
        toast("Producto creado");
      }
      onSuccess();
    } catch {
      toast("Error al guardar el producto", "error");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof typeof form, opts?: { textarea?: boolean; placeholder?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder}
          rows={4}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                     placeholder:text-gray-400 focus:border-brand-500 focus:outline-none
                     focus:ring-2 focus:ring-brand-100 resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          placeholder={opts?.placeholder}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900
                     placeholder:text-gray-400 focus:border-brand-500 focus:outline-none
                     focus:ring-2 focus:ring-brand-100"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {field("Nombre del curso *", "name", { placeholder: "Ej: Especialización en Literatura Infantil" })}
      {field("Descripción", "description", {
        textarea: true,
        placeholder: "Describí de qué trata el curso, a quién está dirigido, modalidad, etc.",
      })}
      {field("Puntaje", "score", { placeholder: "Ej: 4 puntos, 2.5, Puntaje A" })}

      {/* Estado */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Estado</label>
        <div className="flex gap-2">
          {(["active", "inactive"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors
                ${form.status === s
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              {s === "active" ? "Activo" : "Inactivo"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ProductosPage() {
  const toast = useToast();
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [createOpen, setCreateOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch {
      toast("Error al cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteProduct.id);
      toast("Producto eliminado");
      setDeleteProduct(null);
      load();
    } catch {
      toast("Error al eliminar", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Productos / Cursos"
        subtitle={`${products.length} producto${products.length !== 1 ? "s" : ""} configurado${products.length !== 1 ? "s" : ""}`}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Nuevo producto
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <PageSpinner />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="rounded-full bg-gray-100 p-5">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">Sin productos todavía</p>
              <p className="text-sm text-gray-400">Creá tu primer curso con el botón de arriba.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl bg-white border border-gray-100 shadow-card p-5 flex flex-col gap-3"
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium
                    ${p.status === "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"}`}
                  >
                    {p.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Descripción */}
                {p.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>
                )}

                {/* Puntaje */}
                {p.score && (
                  <div className="flex items-center gap-1.5 text-xs text-brand-700 font-medium">
                    <Award className="h-3.5 w-3.5" />
                    {p.score}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-1 pt-1 border-t border-gray-50 mt-auto">
                  <button
                    onClick={() => setEditProduct(p)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs
                               text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteProduct(p)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs
                               text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo producto" size="md">
        <ProductForm onSuccess={() => { setCreateOpen(false); load(); }} onCancel={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Editar producto" size="md">
        {editProduct && (
          <ProductForm
            product={editProduct}
            onSuccess={() => { setEditProduct(null); load(); }}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      {/* Delete */}
      <Modal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="¿Eliminar producto?"
        description={`Esto eliminará "${deleteProduct?.name}" de forma permanente.`}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteProduct(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}

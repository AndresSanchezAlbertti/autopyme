"use client";

import { useState } from "react";
import { MessageSquare, Search, Phone, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn, timeAgo } from "@/lib/utils";

// Demo data while API is wired up
const DEMO_CONVERSATIONS = [
  {
    id: "1",
    contact: "María González",
    channel: "whatsapp" as const,
    lastMessage: "Hola, quiero información sobre el producto premium",
    lastAt: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "open" as const,
    unread: 3,
  },
  {
    id: "2",
    contact: "Carlos Rodríguez",
    channel: "email" as const,
    lastMessage: "¿Cuáles son los precios para el plan anual?",
    lastAt: new Date(Date.now() - 30 * 60000).toISOString(),
    status: "pending" as const,
    unread: 1,
  },
  {
    id: "3",
    contact: "Ana López",
    channel: "whatsapp" as const,
    lastMessage: "Perfecto, confirmo la reunión para el martes.",
    lastAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: "open" as const,
    unread: 0,
  },
  {
    id: "4",
    contact: "Pedro Martínez",
    channel: "web_form" as const,
    lastMessage: "Completó el formulario de contacto.",
    lastAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: "closed" as const,
    unread: 0,
  },
];

const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  web_form: "Formulario",
  instagram: "Instagram",
  manual: "Manual",
};

const channelColor: Record<string, string> = {
  whatsapp: "text-green-600 bg-green-100",
  email: "text-blue-600 bg-blue-100",
  web_form: "text-purple-600 bg-purple-100",
  instagram: "text-pink-600 bg-pink-100",
};

const statusLabel: Record<string, { label: string; color: string }> = {
  open:    { label: "Abierta",  color: "bg-green-100 text-green-700" },
  pending: { label: "Pendiente",color: "bg-amber-100 text-amber-700" },
  closed:  { label: "Cerrada",  color: "bg-gray-100 text-gray-600"   },
  archived:{ label: "Archivada",color: "bg-gray-100 text-gray-500"   },
};

export default function ConversationsPage() {
  const [search, setSearch]   = useState("");
  const [channel, setChannel] = useState("");
  const [selected, setSelected] = useState<string | null>(DEMO_CONVERSATIONS[0].id);

  const CHANNEL_OPTIONS = [
    { value: "whatsapp",  label: "WhatsApp"   },
    { value: "email",     label: "Email"      },
    { value: "web_form",  label: "Formulario" },
    { value: "instagram", label: "Instagram"  },
  ];

  const filtered = DEMO_CONVERSATIONS.filter((c) => {
    const matchSearch = !search || c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    const matchChannel = !channel || c.channel === channel;
    return matchSearch && matchChannel;
  });

  const active = DEMO_CONVERSATIONS.find((c) => c.id === selected);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Conversaciones"
        subtitle={`${DEMO_CONVERSATIONS.filter((c) => c.status === "open").length} abiertas`}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel – conversation list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-gray-100 bg-white">
          <div className="space-y-2 p-3 border-b border-gray-100">
            <Input
              placeholder="Buscar…"
              leftIcon={<Search className="h-3.5 w-3.5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              placeholder="Todos los canales"
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">Sin resultados</p>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-3.5 text-left border-b border-gray-50 transition-colors",
                    selected === conv.id
                      ? "bg-brand-50"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                      {conv.contact[0]}
                    </div>
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn(
                        "text-sm truncate",
                        conv.unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                      )}>
                        {conv.contact}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {timeAgo(conv.lastAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", channelColor[conv.channel] ?? "bg-gray-100 text-gray-600")}>
                        {channelLabel[conv.channel] ?? conv.channel}
                      </span>
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", statusLabel[conv.status]?.color)}>
                        {statusLabel[conv.status]?.label}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel – conversation detail */}
        <div className="flex flex-1 flex-col bg-gray-50">
          {active ? (
            <>
              {/* Conv header */}
              <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-5 py-3.5">
                <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                  {active.contact[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{active.contact}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", channelColor[active.channel] ?? "bg-gray-100 text-gray-600")}>
                      {channelLabel[active.channel] ?? active.channel}
                    </span>
                  </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusLabel[active.status]?.color)}>
                  {statusLabel[active.status]?.label}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {/* Demo messages */}
                <div className="flex justify-start">
                  <div className="max-w-xs rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-2.5 shadow-card">
                    <p className="text-sm text-gray-800">{active.lastMessage}</p>
                    <p className="mt-1 text-[10px] text-gray-400 text-right">{timeAgo(active.lastAt)}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-xs rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-2.5">
                    <p className="text-sm text-white">¡Hola! Gracias por contactarnos. En breve te respondemos.</p>
                    <p className="mt-1 text-[10px] text-brand-200 text-right">hace 2m</p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 bg-white px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    placeholder="Escribí un mensaje…"
                    className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                  <button className="rounded-xl bg-brand-500 p-2.5 text-white hover:bg-brand-600 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-gray-100 p-5">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Seleccioná una conversación</p>
                <p className="text-sm text-gray-400">Elegí un contacto de la lista para ver los mensajes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

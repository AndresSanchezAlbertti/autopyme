// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "won"
  | "lost"
  | "inactive"
  | "archived";

export type LeadSource =
  | "whatsapp"
  | "web_form"
  | "instagram"
  | "manual"
  | string;

export interface Lead {
  id: string;
  tenant_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  source: LeadSource | null;
  status: LeadStatus;
  interest: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadCreate {
  full_name?: string;
  phone?: string;
  email?: string;
  source?: string;
  interest?: string;
  tags?: string;
}

export interface LeadUpdate {
  full_name?: string;
  phone?: string;
  email?: string;
  status?: LeadStatus;
  interest?: string;
  tags?: string;
  assigned_to?: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// ─── Conversations ────────────────────────────────────────────────────────────

export type ConversationChannel =
  | "whatsapp"
  | "email"
  | "web_form"
  | "instagram"
  | "manual";

export type ConversationStatus = "open" | "pending" | "closed" | "archived";

export interface Conversation {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  channel: ConversationChannel;
  external_conversation_id: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface Message {
  id: string;
  tenant_id: string;
  conversation_id: string;
  direction: MessageDirection;
  channel: ConversationChannel;
  content: string | null;
  external_message_id: string | null;
  status: MessageStatus | null;
  created_at: string;
}

// ─── Automations ─────────────────────────────────────────────────────────────

export type AutomationStatus = "inactive" | "active" | "paused" | "error";

export interface AutomationTemplate {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TenantAutomation {
  id: string;
  tenant_id: string;
  template_id: string | null;
  name: string;
  config: Record<string, unknown> | null;
  n8n_workflow_id: string | null;
  status: AutomationStatus;
  created_at: string;
  updated_at: string;
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export type IntegrationProvider =
  | "whatsapp"
  | "gmail"
  | "google_sheets"
  | "smtp"
  | "n8n";

export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface Integration {
  id: string;
  tenant_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  score: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  score?: string;
  status?: "active" | "inactive";
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  score?: string;
  status?: "active" | "inactive";
}

// ─── Generic ─────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  detail: string;
}

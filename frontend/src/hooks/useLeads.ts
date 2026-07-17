import useSWR from "swr";
import { leadsApi } from "@/lib/api";
import type { LeadFilters, LeadListResponse, Lead } from "@/types";

export function useLeads(filters: LeadFilters = {}) {
  const params: Record<string, string | number> = {};
  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.q) params.q = filters.q;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const key = ["/leads", JSON.stringify(params)];

  const { data, error, isLoading, mutate } = useSWR<LeadListResponse>(
    key,
    () => leadsApi.list(params),
    { revalidateOnFocus: false }
  );

  return {
    leads: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    isLoading,
    error,
    mutate,
  };
}

export function useLead(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Lead>(
    id ? `/leads/${id}` : null,
    () => leadsApi.get(id!),
    { revalidateOnFocus: false }
  );

  return { lead: data ?? null, isLoading, error, mutate };
}

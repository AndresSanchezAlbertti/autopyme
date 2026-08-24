import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await apiClient.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  },
  me: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
};

// ─── Leads ───────────────────────────────────────────────────────────────────

export const leadsApi = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const res = await apiClient.get("/leads", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get(`/leads/${id}`);
    return res.data;
  },
  create: async (data: Record<string, unknown>) => {
    const res = await apiClient.post("/leads", data);
    return res.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const res = await apiClient.patch(`/leads/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/leads/${id}`);
  },
};

// ─── Products ────────────────────────────────────────────────────────────────

export const productsApi = {
  list: async () => {
    const res = await apiClient.get("/products");
    return res.data;
  },
  create: async (data: Record<string, unknown>) => {
    const res = await apiClient.post("/products", data);
    return res.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const res = await apiClient.patch(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/products/${id}`);
  },
};

// ─── SWR fetcher ─────────────────────────────────────────────────────────────

export const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data);

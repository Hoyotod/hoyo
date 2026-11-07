const API_BASE = import.meta.env.VITE_API_URL || "";

export interface GameAccount {
  id: string;
  name: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  webhook: string | null;
  createdAt: string;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw Object.assign(new Error("api error"), { status: res.status, data });
  return data as T;
}

export const api = {
  health: () => req<{ ok: boolean }>("/api/health"),
  me: () => req<{ user: UserProfile }>("/api/users/me"),
  updateMe: (body: { name: string; email: string; password?: string; webhook?: string | null }) =>
    req<{ user: { name: string; email: string; webhook: string | null }; passwordChanged: boolean }>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  accounts: () => req<{ accounts: GameAccount[] }>("/api/accounts"),
  createAccount: (body: { name: string; accountId: string; cookieToken: string }) =>
    req<{ account: GameAccount }>("/api/accounts", { method: "POST", body: JSON.stringify(body) }),
  updateAccount: (id: string, body: { name: string; accountId: string; cookieToken?: string }) =>
    req<{ account: GameAccount }>(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteAccount: (id: string) => req<{ success: boolean }>(`/api/accounts/${id}`, { method: "DELETE" }),
  getToken: (id: string) => req<{ cookieToken: string }>(`/api/accounts/${id}/token`),
};

export function extractErrorMessage(e: unknown): string {
  const err = e as { data?: { error?: string; message?: string } | string | unknown; message?: string };
  if (typeof err.data === "string" && err.data) return err.data;
  if (typeof err.data === "object" && err.data) {
    return (err.data as { error?: string; message?: string }).error
      || (err.data as { message?: string }).message
      || "Request failed";
  }
  return err.message || "Request failed";
}

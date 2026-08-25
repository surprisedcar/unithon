const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "")
export interface ApiErrorBody { code: string; message: string; timestamp: string }
export class ApiError extends Error { constructor(public status: number, public body: ApiErrorBody) { super(body.message) } }
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } })
  if (!response.ok) { const body = await response.json().catch(() => ({ code: "UNKNOWN", message: response.statusText, timestamp: "" })); throw new ApiError(response.status, body) }
  return response.json() as Promise<T>
}

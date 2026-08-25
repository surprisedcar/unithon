import { apiRequest } from "./client"

export type SessionRole = "STUDENT" | "HOSPITAL"
export interface LoginSession { token: string; role: SessionRole; expiresAt: string }

export const SESSION_TOKEN_KEY = "unwork.loginSessionToken"
export const STUDENT_SESSION_KEY = "unwork.studentSession"

export const createLoginSession = (username: string, password: string) =>
  apiRequest<LoginSession>("/api/v1/auth/sessions", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })

export const getCurrentLoginSession = (token: string) =>
  apiRequest<LoginSession>("/api/v1/auth/sessions/current", {
    headers: { Authorization: `Bearer ${token}` },
  })

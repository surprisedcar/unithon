const API_BASE = `${window.location.protocol}//${window.location.hostname}:8080/api/v1`

export type UserRole = "STUDENT" | "HOSPITAL"

export interface AuthSession {
  accessToken: string
  user: {
    id: string
    role: UserRole
    name: string
  }
}

export interface QrTokenResponse {
  token: string
  qrContent: string
  hospitalId: string
  hospitalName: string
  status: "ISSUED" | "USED" | "EXPIRED"
  expiresAt: string
}

export interface QrContext {
  hospitalId: string
  hospitalName: string
  affiliated: boolean
  status: "ISSUED" | "USED" | "EXPIRED"
  expiresAt: string
}

export type VisitStatus = "WAITING" | "TREATMENT_COMPLETED" | "SENT"

export interface Visit {
  visitId: string
  linkId: string
  studentId: string
  studentName: string
  hospitalId: string
  hospitalName: string
  status: VisitStatus
  checkedInAt: string
  treatmentCompletedAt: string | null
  sentAt: string | null
}

interface ApiErrorBody {
  message?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.message || `요청에 실패했습니다. (${response.status})`)
  }

  return response.json() as Promise<T>
}

export function login(loginId: string, password: string) {
  return request<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId, password }),
  })
}

export function createQrToken(accessToken: string, hospitalId: string) {
  return request<QrTokenResponse>("/qr-tokens", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ hospitalId, expiresInSeconds: 300 }),
  })
}

export function verifyQrToken(token: string) {
  return request<QrContext>(`/qr-tokens/${encodeURIComponent(token)}`)
}

export function verifyStudent(token: string, studentNumber: string, name: string) {
  return request<{ verificationId: string; studentId: string; expiresAt: string }>(
    "/auth/student-verifications",
    {
      method: "POST",
      body: JSON.stringify({ qrToken: token, studentNumber, name }),
    },
  )
}

export function createVisit(token: string, studentVerificationId: string) {
  return request<Visit>("/visits", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      qrToken: token,
      studentVerificationId,
      consent: { agreed: true, termsVersion: "2026-08-01" },
    }),
  })
}

export function getVisit(visitId: string) {
  return request<Visit>(`/visits/${encodeURIComponent(visitId)}`)
}

export function getHospitalVisits(accessToken: string, period: "TODAY" | "WEEK", query: string) {
  const params = new URLSearchParams({ period, query })
  return request<{ counts: { waiting: number; treatmentCompleted: number; sent: number }; items: Visit[] }>(
    `/hospital/visits?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
}

export function completeTreatment(accessToken: string, visitId: string) {
  return request<Visit>(`/hospital/visits/${encodeURIComponent(visitId)}/complete-treatment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

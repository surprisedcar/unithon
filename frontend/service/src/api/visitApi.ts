import { apiRequest } from "./client"
export type VisitStatus = "WAITING_HOSPITAL_CONFIRMATION" | "VISIT_CONFIRMED" | "SENT_TO_UNIVERSITY" | "COMPLETED"
export interface Visit { visitId: string; status: VisitStatus; student: { name: string; studentNumber: string }; hospital: { id: number; name: string }; university: { id: number; name: string }; consentedAt: string; hospitalConfirmedAt: string | null; sentToUniversityAt: string | null; completedAt: string | null }
export interface StudentVisit { visitId: string; hospitalName: string; status: VisitStatus; createdAt: string }
export interface VerifiedQr { valid: boolean; hospital: { id: number; name: string }; expiresAt: string }
export const verifyQrToken = (token: string) => apiRequest<VerifiedQr>(`/api/v1/qr-tokens/${encodeURIComponent(token)}`)
export const createVisit = (studentId: number, qrToken: string) => apiRequest<{ visitId: string; status: VisitStatus }>("/api/v1/visits", { method: "POST", body: JSON.stringify({ studentId, qrToken, consent: true }) })
export const getVisit = (visitId: string) => apiRequest<Visit>(`/api/v1/visits/${visitId}`)
export const getStudentVisits = (studentId: number) => apiRequest<StudentVisit[]>(`/api/v1/students/${studentId}/visits`)
export const sendToUniversity = (visitId: string) => apiRequest<{ visitId: string; status: VisitStatus }>(`/api/v1/visits/${visitId}/send-to-university`, { method: "POST" })

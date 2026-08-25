import { apiRequest } from "./client"
import type { VisitStatus } from "./visitApi"
export interface HospitalVisit { visitId: string; studentName: string; studentNumber: string; universityName: string; status: VisitStatus; createdAt: string }
export interface CreatedQrToken { token: string; hospitalId: number; hospitalName: string; expiresAt: string }
export const createQrToken = (hospitalId: number) => apiRequest<CreatedQrToken>(`/api/v1/hospitals/${hospitalId}/qr-tokens`, { method: "POST" })
export const getHospitalVisits = (hospitalId: number) => apiRequest<HospitalVisit[]>(`/api/v1/hospitals/${hospitalId}/visits`)
export const confirmHospitalVisit = (hospitalId: number, visitId: string) => apiRequest<{ visitId: string; status: VisitStatus; hospitalConfirmedAt: string }>(`/api/v1/hospitals/${hospitalId}/visits/${visitId}/confirm`, { method: "POST" })

import { apiRequest } from "./client"
export type VisitStatus = "WAITING_HOSPITAL_CONFIRMATION" | "VISIT_CONFIRMED" | "SENT_TO_UNIVERSITY" | "COMPLETED"
export interface UniversityVisit { visitId: string; studentName: string; studentNumber: string; hospitalName: string; status: VisitStatus; hospitalConfirmedAt: string | null; sentToUniversityAt: string | null; createdAt: string }
export const getUniversityVisits = (universityId: number) => apiRequest<UniversityVisit[]>(`/api/v1/universities/${universityId}/visits`)
export const completeUniversityVisit = (universityId: number, visitId: string) => apiRequest<{ visitId: string; status: VisitStatus; completedAt: string }>(`/api/v1/universities/${universityId}/visits/${visitId}/complete`, { method: "POST" })

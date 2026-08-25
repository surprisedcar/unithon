import { apiRequest } from "./client"
export interface StudentInfo { studentId: number; studentNumber: string; name: string; university: { id: number; name: string; code: string } }
export function verifyStudent(universityCode: string, studentNumber: string, name: string) { return apiRequest<StudentInfo>("/api/v1/auth/students/verify", { method: "POST", body: JSON.stringify({ universityCode, studentNumber, name }) }) }

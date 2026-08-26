import { apiRequest } from "@/api/client";

export interface StudentInfo {
  studentId: number;
  studentNumber: string;
  name: string;
  university: { id: number; name: string; code: string };
}

export function loginStudent(studentNumber: string, password: string) {
  return apiRequest<StudentInfo>("/api/v1/auth/students/login", {
    method: "POST",
    body: JSON.stringify({ studentNumber, password }),
  });
}

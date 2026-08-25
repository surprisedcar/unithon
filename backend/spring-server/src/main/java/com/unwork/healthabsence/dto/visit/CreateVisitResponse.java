package com.unwork.healthabsence.dto.visit;
import com.unwork.healthabsence.entity.VisitStatus;
import java.time.Instant;
import java.util.UUID;
public record CreateVisitResponse(
    UUID visitId,
    VisitStatus status,
    StudentInfo student,
    HospitalInfo hospital,
    UniversityInfo university,
    Instant createdAt
) {
    public record StudentInfo(String name, String studentNumber) {}
    public record HospitalInfo(Long id, String name) {}
    public record UniversityInfo(Long id, String name) {}
}

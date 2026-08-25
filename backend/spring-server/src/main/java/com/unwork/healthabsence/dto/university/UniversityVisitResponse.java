package com.unwork.healthabsence.dto.university;

import com.unwork.healthabsence.entity.VisitStatus;
import java.time.Instant;
import java.util.UUID;

public record UniversityVisitResponse(
    UUID visitId,
    String studentName,
    String studentNumber,
    String hospitalName,
    VisitStatus status,
    Instant hospitalConfirmedAt,
    Instant sentToUniversityAt,
    Instant createdAt
) {}

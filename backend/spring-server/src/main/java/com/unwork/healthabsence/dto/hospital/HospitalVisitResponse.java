package com.unwork.healthabsence.dto.hospital;

import com.unwork.healthabsence.entity.VisitStatus;
import java.time.Instant;
import java.util.UUID;

public record HospitalVisitResponse(
    UUID visitId,
    String studentName,
    String studentNumber,
    String universityName,
    VisitStatus status,
    Instant createdAt
) {}

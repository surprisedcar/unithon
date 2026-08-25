package com.unwork.healthabsence.dto.university;

import com.unwork.healthabsence.entity.VisitStatus;
import java.time.Instant;
import java.util.UUID;

public record UniversityVisitCompleteResponse(
    UUID visitId,
    VisitStatus status,
    Instant completedAt
) {}

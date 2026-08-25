package com.unwork.healthabsence.dto.hospital;

import com.unwork.healthabsence.entity.VisitStatus;
import java.time.Instant;
import java.util.UUID;

public record HospitalVisitConfirmResponse(
    UUID visitId,
    VisitStatus status,
    Instant hospitalConfirmedAt
) {}

package com.unwork.healthabsence.dto.visit;
import com.unwork.healthabsence.entity.VisitStatus;
import java.time.Instant;
import java.util.UUID;
public record StudentVisitResponse(UUID visitId, String hospitalName, VisitStatus status, Instant createdAt) {}

package com.unwork.healthabsence.dto.visit;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record CreateVisitRequest(
    @NotNull Long studentId,
    @NotBlank String qrToken,
    @AssertTrue(message = "consent must be true") boolean consent
) {}

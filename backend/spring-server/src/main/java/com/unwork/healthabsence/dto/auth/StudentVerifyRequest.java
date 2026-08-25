package com.unwork.healthabsence.dto.auth;
import jakarta.validation.constraints.NotBlank;
public record StudentVerifyRequest(
    @NotBlank String universityCode,
    @NotBlank String studentNumber,
    @NotBlank String name
) {}

package com.unwork.healthabsence.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record StudentLoginRequest(
    @NotBlank String studentNumber,
    @NotBlank String password
) {}

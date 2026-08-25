package com.unwork.healthabsence.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record SessionCreateRequest(
    @NotBlank String username,
    @NotBlank String password
) {}

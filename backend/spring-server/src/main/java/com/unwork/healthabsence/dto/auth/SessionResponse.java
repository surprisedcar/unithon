package com.unwork.healthabsence.dto.auth;

import com.unwork.healthabsence.entity.LoginRole;
import java.time.Instant;

public record SessionResponse(String token, LoginRole role, Instant expiresAt) {}

package com.unwork.healthabsence.dto.qr;
import java.time.Instant;
public record QrTokenCreateResponse(String token, Long hospitalId, String hospitalName, Instant expiresAt) {}

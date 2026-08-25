package com.unwork.healthabsence.dto.qr;
import java.time.Instant;
public record QrTokenVerifyResponse(boolean valid, HospitalInfo hospital, Instant expiresAt) {
    public record HospitalInfo(Long id, String name) {}
}

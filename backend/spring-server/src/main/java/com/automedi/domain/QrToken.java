package com.automedi.domain;

import java.time.OffsetDateTime;

public class QrToken {
    private final String id;
    private final String tokenHash;
    private final String hospitalId;
    private final OffsetDateTime expiresAt;
    private QrTokenStatus status;
    private OffsetDateTime usedAt;

    public QrToken(String id, String tokenHash, String hospitalId, OffsetDateTime expiresAt) {
        this.id = id;
        this.tokenHash = tokenHash;
        this.hospitalId = hospitalId;
        this.expiresAt = expiresAt;
        this.status = QrTokenStatus.ISSUED;
    }

    public String id() { return id; }
    public String tokenHash() { return tokenHash; }
    public String hospitalId() { return hospitalId; }
    public OffsetDateTime expiresAt() { return expiresAt; }
    public QrTokenStatus status() { return status; }
    public OffsetDateTime usedAt() { return usedAt; }

    public boolean isExpired(OffsetDateTime now) {
        return !expiresAt.isAfter(now);
    }

    public void expire() {
        status = QrTokenStatus.EXPIRED;
    }

    public void use(OffsetDateTime now) {
        status = QrTokenStatus.USED;
        usedAt = now;
    }
}


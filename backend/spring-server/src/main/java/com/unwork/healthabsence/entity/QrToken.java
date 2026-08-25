package com.unwork.healthabsence.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name = "qr_tokens", indexes = @Index(name = "idx_qr_token_hash", columnList = "token_hash")) @Getter @Setter @NoArgsConstructor
public class QrToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "hospital_id", nullable = false) private Hospital hospital;
    @Column(name = "token_hash", nullable = false, unique = true, length = 255) private String tokenHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private QrTokenStatus status;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "used_at") private Instant usedAt;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}

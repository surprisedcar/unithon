package com.unwork.healthabsence.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name = "visits", indexes = {
    @Index(name = "idx_visit_student", columnList = "student_id"),
    @Index(name = "idx_visit_hospital_status", columnList = "hospital_id, status"),
    @Index(name = "idx_visit_university_status", columnList = "university_id, status")
}) @Getter @Setter @NoArgsConstructor
public class Visit {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false) private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "hospital_id", nullable = false) private Hospital hospital;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "university_id", nullable = false) private University university;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "qr_token_id", nullable = false, unique = true) private QrToken qrToken;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40) private VisitStatus status;
    @Column(name = "consented_at", nullable = false) private Instant consentedAt;
    @Column(name = "hospital_confirmed_at") private Instant hospitalConfirmedAt;
    @Column(name = "sent_to_university_at") private Instant sentToUniversityAt;
    @Column(name = "completed_at") private Instant completedAt;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @PrePersist void onCreate() { var now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
}

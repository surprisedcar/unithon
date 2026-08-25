package com.unwork.healthabsence.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name = "students", uniqueConstraints = @UniqueConstraint(name = "uk_student_university_number", columnNames = {"university_id", "student_number"}), indexes = @Index(name = "idx_student_university_number", columnList = "university_id, student_number")) @Getter @Setter @NoArgsConstructor
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "university_id", nullable = false) private University university;
    @Column(name = "student_number", nullable = false, length = 30) private String studentNumber;
    @Column(nullable = false, length = 50) private String name;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @PrePersist void onCreate() { var now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
}

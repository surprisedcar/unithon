package com.automedi.domain;

import java.time.OffsetDateTime;

public class Visit {
    private final String id;
    private final String linkId;
    private final String studentId;
    private final String hospitalId;
    private final String qrTokenId;
    private final OffsetDateTime checkedInAt;
    private VisitStatus status;
    private OffsetDateTime treatmentCompletedAt;
    private OffsetDateTime sentAt;

    public Visit(String id, String linkId, String studentId, String hospitalId, String qrTokenId, OffsetDateTime checkedInAt) {
        this.id = id;
        this.linkId = linkId;
        this.studentId = studentId;
        this.hospitalId = hospitalId;
        this.qrTokenId = qrTokenId;
        this.checkedInAt = checkedInAt;
        this.status = VisitStatus.WAITING;
    }

    public String id() { return id; }
    public String linkId() { return linkId; }
    public String studentId() { return studentId; }
    public String hospitalId() { return hospitalId; }
    public String qrTokenId() { return qrTokenId; }
    public OffsetDateTime checkedInAt() { return checkedInAt; }
    public VisitStatus status() { return status; }
    public OffsetDateTime treatmentCompletedAt() { return treatmentCompletedAt; }
    public OffsetDateTime sentAt() { return sentAt; }

    public void completeTreatment(OffsetDateTime now) {
        status = VisitStatus.TREATMENT_COMPLETED;
        treatmentCompletedAt = now;
    }

    public void markSent(OffsetDateTime now) {
        status = VisitStatus.SENT;
        sentAt = now;
    }
}


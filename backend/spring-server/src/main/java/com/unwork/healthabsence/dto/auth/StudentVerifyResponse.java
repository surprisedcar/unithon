package com.unwork.healthabsence.dto.auth;
public record StudentVerifyResponse(
    Long studentId,
    String studentNumber,
    String name,
    UniversityInfo university
) {
    public record UniversityInfo(Long id, String name, String code) {}
}

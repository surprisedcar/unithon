package com.automedi.api;

import com.automedi.domain.QrTokenStatus;
import com.automedi.domain.Role;
import com.automedi.domain.VisitStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public final class ApiDtos {
    private ApiDtos() {}

    public record LoginRequest(@NotBlank String loginId, @NotBlank String password) {}
    public record UserResponse(String id, Role role, String name) {}
    public record LoginResponse(String accessToken, long expiresIn, UserResponse user) {}
    public record StudentEnrollmentVerificationRequest(
        @NotBlank String university,
        @Size(min = 8, max = 20) String studentNumber,
        @Size(min = 2, max = 50) String name,
        @NotBlank String verificationCode
    ) {}
    public record StudentEnrollmentVerificationResponse(String verificationId, OffsetDateTime expiresAt) {}
    public record StudentSignupRequest(
        @Size(min = 4, max = 40) String loginId,
        @Size(min = 8, max = 72) String password,
        @NotBlank String verificationId,
        @NotBlank String department,
        @Min(1) @Max(8) int grade
    ) {}
    public record HospitalSignupRequest(
        @Size(min = 4, max = 40) String loginId,
        @Size(min = 8, max = 72) String password,
        @NotBlank String hospitalCode,
        @NotBlank String registrationKey,
        @Size(min = 2, max = 50) String managerName
    ) {}
    public record SignupResponse(String accountId, String loginId, Role role, String status) {}

    public record StudentVerificationRequest(
        @NotBlank String qrToken,
        @Size(min = 8, max = 20) String studentNumber,
        @Size(min = 2, max = 50) String name
    ) {}
    public record StudentVerificationResponse(String verificationId, String studentId, OffsetDateTime expiresAt) {}

    public record CreateQrTokenRequest(
        @NotBlank String hospitalId,
        @Min(30) @Max(900) int expiresInSeconds
    ) {}
    public record QrTokenResponse(
        String token,
        String qrContent,
        String hospitalId,
        String hospitalName,
        QrTokenStatus status,
        OffsetDateTime expiresAt
    ) {}
    public record QrContextResponse(
        String hospitalId,
        String hospitalName,
        boolean affiliated,
        QrTokenStatus status,
        OffsetDateTime expiresAt
    ) {}

    public record ConsentRequest(
        @AssertTrue(message = "정보 제공 동의가 필요합니다.") boolean agreed,
        @NotBlank String termsVersion
    ) {}
    public record CreateVisitRequest(
        @NotBlank String qrToken,
        @NotBlank String studentVerificationId,
        @NotNull @Valid ConsentRequest consent
    ) {}
    public record VisitResponse(
        String visitId,
        String linkId,
        String studentId,
        String studentName,
        String hospitalId,
        String hospitalName,
        VisitStatus status,
        OffsetDateTime checkedInAt,
        OffsetDateTime treatmentCompletedAt,
        OffsetDateTime sentAt
    ) {}

    public record VisitCounts(long waiting, long treatmentCompleted, long sent) {}
    public record HospitalVisitsResponse(VisitCounts counts, List<VisitResponse> items) {}
    public record StudentProfile(String name, String university, String department, int grade) {}
    public record DashboardResponse(
        StudentProfile student,
        long semesterCompletedCount,
        VisitResponse lastCompletedVisit,
        List<VisitResponse> recentVisits,
        int unreadNotificationCount
    ) {}
    public record HospitalResponse(String id, String code, String name, String area, double distanceKm, boolean active) {}
    public record PreferencesRequest(boolean automaticTransferConsent, boolean pushNotificationEnabled) {}
    public record PreferencesResponse(boolean automaticTransferConsent, boolean pushNotificationEnabled) {}
    public record HealthResponse(String status) {}
    public record NotificationResponse(String id, String title, String body, boolean read, OffsetDateTime createdAt) {}
    public record StatusHistoryResponse(String visitId, List<Map<String, Object>> history) {}
}

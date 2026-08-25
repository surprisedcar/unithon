package com.automedi.service;

import com.automedi.api.ApiDtos;
import com.automedi.common.ApiException;
import com.automedi.domain.Hospital;
import com.automedi.domain.QrToken;
import com.automedi.domain.QrTokenStatus;
import com.automedi.domain.Student;
import com.automedi.domain.Visit;
import com.automedi.domain.VisitStatus;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AutoMediService {
    private record Verification(String id, String studentId, String qrHash, OffsetDateTime expiresAt) {}
    private record EnrollmentVerification(
        String id,
        String university,
        String studentNumber,
        String name,
        OffsetDateTime expiresAt
    ) {}
    private record Notice(String id, String studentId, String title, String body, OffsetDateTime createdAt) {}

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, Hospital> hospitals = new ConcurrentHashMap<>();
    private final Map<String, String> hospitalRegistrationKeys = new ConcurrentHashMap<>();
    private final Map<String, Student> students = new ConcurrentHashMap<>();
    private final Map<String, QrToken> qrTokensByHash = new ConcurrentHashMap<>();
    private final Map<String, Verification> verifications = new ConcurrentHashMap<>();
    private final Map<String, EnrollmentVerification> enrollmentVerifications = new ConcurrentHashMap<>();
    private final Map<String, String> universityVerificationCodes = new ConcurrentHashMap<>();
    private final Map<String, Visit> visits = new ConcurrentHashMap<>();
    private final Map<String, String> idempotencyKeys = new ConcurrentHashMap<>();
    private final List<Notice> notices = new ArrayList<>();

    public AutoMediService() {
        hospitals.put("hospital-1", new Hospital("hospital-1", "H001", "연세세브란스병원", "서대문구", 37.5623, 126.9408, true));
        hospitals.put("hospital-2", new Hospital("hospital-2", "H002", "서울대학교병원", "종로구", 37.5796, 126.9990, true));
        hospitals.put("hospital-3", new Hospital("hospital-3", "H003", "가톨릭대학교서울성모병원", "서초구", 37.5018, 127.0048, true));
        students.put("student-1", new Student("student-1", "2023123456", "김지수", "한국대학교", "컴퓨터공학과", 2));
        hospitalRegistrationKeys.put("H001", "AUTO-H001");
        hospitalRegistrationKeys.put("H002", "AUTO-H002");
        hospitalRegistrationKeys.put("H003", "AUTO-H003");
        universityVerificationCodes.put("한국대학교", "UNIV-2026");
    }

    public synchronized ApiDtos.StudentEnrollmentVerificationResponse verifyStudentEnrollment(
        ApiDtos.StudentEnrollmentVerificationRequest request
    ) {
        String expectedCode = universityVerificationCodes.get(request.university());
        if (expectedCode == null || !MessageDigest.isEqual(
            expectedCode.getBytes(StandardCharsets.UTF_8),
            request.verificationCode().getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "STUDENT_ENROLLMENT_VERIFICATION_FAILED", "학교 재학 정보를 확인할 수 없습니다.");
        }
        boolean alreadyRegistered = students.values().stream().anyMatch(student ->
            student.university().equals(request.university()) && student.studentNumber().equals(request.studentNumber())
        );
        if (alreadyRegistered) {
            throw new ApiException(HttpStatus.CONFLICT, "STUDENT_ALREADY_REGISTERED", "이미 가입된 학번입니다.");
        }
        String verificationId = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10);
        enrollmentVerifications.put(verificationId, new EnrollmentVerification(
            verificationId,
            request.university(),
            request.studentNumber(),
            request.name(),
            expiresAt
        ));
        return new ApiDtos.StudentEnrollmentVerificationResponse(verificationId, expiresAt);
    }

    public synchronized Student registerStudent(ApiDtos.StudentSignupRequest request) {
        EnrollmentVerification verification = enrollmentVerifications.get(request.verificationId());
        if (verification == null || !verification.expiresAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "STUDENT_ENROLLMENT_VERIFICATION_INVALID", "학생 인증이 만료되었거나 유효하지 않습니다.");
        }
        boolean duplicated = students.values().stream()
            .anyMatch(student -> student.university().equals(verification.university()) && student.studentNumber().equals(verification.studentNumber()));
        if (duplicated) {
            throw new ApiException(HttpStatus.CONFLICT, "STUDENT_ALREADY_REGISTERED", "이미 가입된 학번입니다.");
        }
        String studentId = UUID.randomUUID().toString();
        Student student = new Student(
            studentId,
            verification.studentNumber(),
            verification.name(),
            verification.university(),
            request.department(),
            request.grade()
        );
        students.put(studentId, student);
        enrollmentVerifications.remove(verification.id());
        return student;
    }

    public Hospital verifyHospitalRegistration(String hospitalCode, String registrationKey) {
        String expectedKey = hospitalRegistrationKeys.get(hospitalCode);
        if (expectedKey == null || !MessageDigest.isEqual(
            expectedKey.getBytes(StandardCharsets.UTF_8),
            registrationKey.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "HOSPITAL_REGISTRATION_INVALID", "병원 코드 또는 등록 키가 올바르지 않습니다.");
        }
        return hospitals.values().stream()
            .filter(hospital -> hospital.code().equals(hospitalCode) && hospital.active())
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOSPITAL_NOT_FOUND", "제휴 병원을 찾을 수 없습니다."));
    }

    public synchronized ApiDtos.QrTokenResponse createQrToken(String authenticatedHospitalId, ApiDtos.CreateQrTokenRequest request) {
        if (!authenticatedHospitalId.equals(request.hospitalId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "HOSPITAL_MISMATCH", "다른 병원의 QR은 생성할 수 없습니다.");
        }
        Hospital hospital = requireHospital(request.hospitalId());
        byte[] random = new byte[32];
        secureRandom.nextBytes(random);
        String plainToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        String hash = hash(plainToken);
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(request.expiresInSeconds());
        QrToken qrToken = new QrToken(UUID.randomUUID().toString(), hash, hospital.id(), expiresAt);
        qrTokensByHash.put(hash, qrToken);
        return new ApiDtos.QrTokenResponse(
            plainToken,
            "/qr?token=" + plainToken,
            hospital.id(),
            hospital.name(),
            qrToken.status(),
            expiresAt
        );
    }

    public synchronized ApiDtos.QrContextResponse verifyQrToken(String plainToken) {
        QrToken token = requireUsableQr(plainToken);
        Hospital hospital = requireHospital(token.hospitalId());
        return new ApiDtos.QrContextResponse(hospital.id(), hospital.name(), hospital.active(), token.status(), token.expiresAt());
    }

    public synchronized ApiDtos.StudentVerificationResponse verifyStudent(ApiDtos.StudentVerificationRequest request) {
        QrToken qrToken = requireUsableQr(request.qrToken());
        Student student = students.values().stream()
            .filter(item -> item.studentNumber().equals(request.studentNumber()) && item.name().equals(request.name()))
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "STUDENT_VERIFICATION_FAILED", "학생 정보를 확인할 수 없습니다."));
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10);
        String verificationId = UUID.randomUUID().toString();
        verifications.put(verificationId, new Verification(verificationId, student.id(), qrToken.tokenHash(), expiresAt));
        return new ApiDtos.StudentVerificationResponse(verificationId, student.id(), expiresAt);
    }

    public synchronized ApiDtos.VisitResponse createVisit(String idempotencyKey, ApiDtos.CreateVisitRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key 헤더가 필요합니다.");
        }
        String existingVisitId = idempotencyKeys.get(idempotencyKey);
        if (existingVisitId != null) {
            return toVisitResponse(requireVisit(existingVisitId));
        }

        QrToken qrToken = requireUsableQr(request.qrToken());
        Verification verification = verifications.get(request.studentVerificationId());
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (verification == null || !verification.expiresAt().isAfter(now) || !verification.qrHash().equals(qrToken.tokenHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "STUDENT_VERIFICATION_INVALID", "학생 확인 정보가 유효하지 않습니다.");
        }

        String visitId = UUID.randomUUID().toString();
        String linkId = "STU-" + visitId.substring(0, 4).toUpperCase(Locale.ROOT);
        Visit visit = new Visit(visitId, linkId, verification.studentId(), qrToken.hospitalId(), qrToken.id(), now);
        qrToken.use(now);
        visits.put(visitId, visit);
        idempotencyKeys.put(idempotencyKey, visitId);
        verifications.remove(verification.id());
        return toVisitResponse(visit);
    }

    public ApiDtos.VisitResponse getVisit(String visitId) {
        return toVisitResponse(requireVisit(visitId));
    }

    public List<ApiDtos.HospitalResponse> searchHospitals(String query) {
        String keyword = query == null ? "" : query.strip().toLowerCase(Locale.ROOT);
        return hospitals.values().stream()
            .filter(hospital -> hospital.name().toLowerCase(Locale.ROOT).contains(keyword) || hospital.area().toLowerCase(Locale.ROOT).contains(keyword))
            .sorted(Comparator.comparing(Hospital::name))
            .map(hospital -> new ApiDtos.HospitalResponse(hospital.id(), hospital.code(), hospital.name(), hospital.area(), 0, hospital.active()))
            .toList();
    }

    public ApiDtos.HospitalVisitsResponse hospitalVisits(String hospitalId, String period, String query) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        String keyword = query == null ? "" : query.strip().toLowerCase(Locale.ROOT);
        List<Visit> hospitalVisits = visits.values().stream()
            .filter(visit -> visit.hospitalId().equals(hospitalId))
            .filter(visit -> !"TODAY".equalsIgnoreCase(period) || visit.checkedInAt().toLocalDate().equals(now.toLocalDate()))
            .filter(visit -> {
                Student student = students.get(visit.studentId());
                return student.name().toLowerCase(Locale.ROOT).contains(keyword) || visit.linkId().toLowerCase(Locale.ROOT).contains(keyword);
            })
            .sorted(Comparator.comparing(Visit::checkedInAt).reversed())
            .toList();
        ApiDtos.VisitCounts counts = new ApiDtos.VisitCounts(
            hospitalVisits.stream().filter(v -> v.status() == VisitStatus.WAITING).count(),
            hospitalVisits.stream().filter(v -> v.status() == VisitStatus.TREATMENT_COMPLETED).count(),
            hospitalVisits.stream().filter(v -> v.status() == VisitStatus.SENT).count()
        );
        return new ApiDtos.HospitalVisitsResponse(counts, hospitalVisits.stream().map(this::toVisitResponse).toList());
    }

    public synchronized ApiDtos.VisitResponse completeTreatment(String hospitalId, String visitId) {
        Visit visit = requireVisit(visitId);
        if (!visit.hospitalId().equals(hospitalId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "VISIT_HOSPITAL_MISMATCH", "다른 병원의 방문은 처리할 수 없습니다.");
        }
        if (visit.status() != VisitStatus.WAITING) {
            throw new ApiException(HttpStatus.CONFLICT, "VISIT_INVALID_STATUS", "현재 상태에서는 진료 완료 처리를 할 수 없습니다.");
        }
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        visit.completeTreatment(now);
        return toVisitResponse(visit);
    }

    public ApiDtos.DashboardResponse dashboard(String studentId) {
        Student student = requireStudent(studentId);
        List<Visit> studentVisits = visitsForStudent(studentId);
        List<ApiDtos.VisitResponse> completed = studentVisits.stream()
            .filter(visit -> visit.status() == VisitStatus.SENT)
            .map(this::toVisitResponse)
            .toList();
        return new ApiDtos.DashboardResponse(
            new ApiDtos.StudentProfile(student.name(), student.university(), student.department(), student.grade()),
            completed.size(),
            completed.isEmpty() ? null : completed.getFirst(),
            studentVisits.stream().limit(3).map(this::toVisitResponse).toList(),
            (int) notices.stream().filter(notice -> notice.studentId().equals(studentId)).count()
        );
    }

    public List<ApiDtos.VisitResponse> studentVisits(String studentId, VisitStatus status) {
        return visitsForStudent(studentId).stream()
            .filter(visit -> status == null || visit.status() == status)
            .map(this::toVisitResponse)
            .toList();
    }

    public ApiDtos.PreferencesResponse updatePreferences(String studentId, ApiDtos.PreferencesRequest request) {
        Student student = requireStudent(studentId);
        student.updatePreferences(request.automaticTransferConsent(), request.pushNotificationEnabled());
        return new ApiDtos.PreferencesResponse(student.automaticTransferConsent(), student.pushNotificationEnabled());
    }

    public List<ApiDtos.NotificationResponse> notifications(String studentId) {
        return notices.stream()
            .filter(notice -> notice.studentId().equals(studentId))
            .sorted(Comparator.comparing(Notice::createdAt).reversed())
            .map(notice -> new ApiDtos.NotificationResponse(notice.id(), notice.title(), notice.body(), false, notice.createdAt()))
            .toList();
    }

    private List<Visit> visitsForStudent(String studentId) {
        requireStudent(studentId);
        return visits.values().stream()
            .filter(visit -> visit.studentId().equals(studentId))
            .sorted(Comparator.comparing(Visit::checkedInAt).reversed())
            .toList();
    }

    private QrToken requireUsableQr(String plainToken) {
        QrToken token = qrTokensByHash.get(hash(plainToken));
        if (token == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "QR_NOT_FOUND", "QR 토큰을 찾을 수 없습니다.");
        }
        if (token.status() == QrTokenStatus.USED) {
            throw new ApiException(HttpStatus.CONFLICT, "QR_ALREADY_USED", "이미 사용된 QR 토큰입니다.");
        }
        if (token.status() == QrTokenStatus.REVOKED) {
            throw new ApiException(HttpStatus.GONE, "QR_REVOKED", "폐기된 QR 토큰입니다.");
        }
        if (token.isExpired(OffsetDateTime.now(ZoneOffset.UTC))) {
            token.expire();
            throw new ApiException(HttpStatus.GONE, "QR_EXPIRED", "만료된 QR 토큰입니다.");
        }
        return token;
    }

    private Hospital requireHospital(String id) {
        Hospital hospital = hospitals.get(id);
        if (hospital == null || !hospital.active()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "HOSPITAL_NOT_FOUND", "제휴 병원을 찾을 수 없습니다.");
        }
        return hospital;
    }

    private Student requireStudent(String id) {
        Student student = students.get(id);
        if (student == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND", "학생을 찾을 수 없습니다.");
        }
        return student;
    }

    private Visit requireVisit(String id) {
        Visit visit = visits.get(id);
        if (visit == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "VISIT_NOT_FOUND", "방문 세션을 찾을 수 없습니다.");
        }
        return visit;
    }

    private ApiDtos.VisitResponse toVisitResponse(Visit visit) {
        Student student = students.get(visit.studentId());
        Hospital hospital = hospitals.get(visit.hospitalId());
        return new ApiDtos.VisitResponse(
            visit.id(), visit.linkId(), student.id(), student.name(), hospital.id(), hospital.name(), visit.status(),
            visit.checkedInAt(), visit.treatmentCompletedAt(), visit.sentAt()
        );
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}

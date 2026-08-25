package com.unwork.healthabsence.service.visit;

import com.unwork.healthabsence.dto.visit.*;
import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.*;
import com.unwork.healthabsence.service.qr.QrTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class VisitCreationService {
    private final StudentRepository studentRepository;
    private final QrTokenRepository qrTokenRepository;
    private final VisitRepository visitRepository;
    private final QrTokenService qrTokenService;

    @Transactional
    public CreateVisitResponse create(CreateVisitRequest request) {
        if (!request.consent()) {
            throw new ApiException("INVALID_REQUEST", "정보 제공 동의가 필요합니다.", HttpStatus.BAD_REQUEST);
        }
        Student student = studentRepository.findById(request.studentId())
            .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", "학생 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        QrToken token = qrTokenRepository.findByTokenHashForUpdate(qrTokenService.hash(request.qrToken()))
            .orElseThrow(() -> new ApiException("QR_TOKEN_NOT_FOUND", "QR 코드를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        qrTokenService.validateUsable(token);

        Instant now = Instant.now();
        Visit visit = new Visit();
        visit.setStudent(student);
        visit.setUniversity(student.getUniversity());
        visit.setHospital(token.getHospital());
        visit.setQrToken(token);
        visit.setStatus(VisitStatus.WAITING_HOSPITAL_CONFIRMATION);
        visit.setConsentedAt(now);
        token.setStatus(QrTokenStatus.USED);
        token.setUsedAt(now);
        Visit saved = visitRepository.save(visit);
        return map(saved);
    }

    private CreateVisitResponse map(Visit visit) {
        Student student = visit.getStudent();
        Hospital hospital = visit.getHospital();
        University university = visit.getUniversity();
        return new CreateVisitResponse(visit.getId(), visit.getStatus(),
            new CreateVisitResponse.StudentInfo(student.getName(), student.getStudentNumber()),
            new CreateVisitResponse.HospitalInfo(hospital.getId(), hospital.getName()),
            new CreateVisitResponse.UniversityInfo(university.getId(), university.getName()), visit.getCreatedAt());
    }
}

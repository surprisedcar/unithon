package com.unwork.healthabsence.service.university;

import com.unwork.healthabsence.dto.university.*;
import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UniversityVisitService {
    private final UniversityRepository universityRepository;
    private final VisitRepository visitRepository;

    @Transactional(readOnly = true)
    public List<UniversityVisitResponse> getVisits(Long universityId, VisitStatus status) {
        University university = findUniversity(universityId);
        List<Visit> visits = status == null
            ? visitRepository.findByUniversityOrderByCreatedAtDesc(university)
            : visitRepository.findByUniversityAndStatusOrderByCreatedAtDesc(university, status);
        return visits.stream().map(this::toResponse).toList();
    }

    @Transactional
    public UniversityVisitCompleteResponse complete(Long universityId, UUID visitId) {
        University university = findUniversity(universityId);
        Visit visit = visitRepository.findByIdForUpdate(visitId)
            .orElseThrow(() -> new ApiException("VISIT_NOT_FOUND", "Visit을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        if (!visit.getUniversity().getId().equals(university.getId())) {
            throw new ApiException("VISIT_UNIVERSITY_MISMATCH", "해당 학교의 Visit이 아닙니다.", HttpStatus.CONFLICT);
        }
        if (visit.getStatus() != VisitStatus.SENT_TO_UNIVERSITY) {
            throw new ApiException("INVALID_VISIT_STATUS",
                "현재 상태에서는 보건결석 완료 처리를 할 수 없습니다.", HttpStatus.CONFLICT);
        }
        Instant now = Instant.now();
        visit.setStatus(VisitStatus.COMPLETED);
        visit.setCompletedAt(now);
        return new UniversityVisitCompleteResponse(visit.getId(), visit.getStatus(), now);
    }

    private University findUniversity(Long universityId) {
        return universityRepository.findById(universityId)
            .orElseThrow(() -> new ApiException("UNIVERSITY_NOT_FOUND", "학교를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    private UniversityVisitResponse toResponse(Visit visit) {
        return new UniversityVisitResponse(visit.getId(), visit.getStudent().getName(),
            visit.getStudent().getStudentNumber(), visit.getHospital().getName(), visit.getStatus(),
            visit.getHospitalConfirmedAt(), visit.getSentToUniversityAt(), visit.getCreatedAt());
    }
}

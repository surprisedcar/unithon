package com.unwork.healthabsence.service.hospital;

import com.unwork.healthabsence.dto.hospital.*;
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
public class HospitalVisitService {
    private final HospitalRepository hospitalRepository;
    private final VisitRepository visitRepository;

    @Transactional(readOnly = true)
    public List<HospitalVisitResponse> getVisits(Long hospitalId, VisitStatus status) {
        Hospital hospital = findHospital(hospitalId);
        List<Visit> visits = status == null
            ? visitRepository.findByHospitalOrderByCreatedAtDesc(hospital)
            : visitRepository.findByHospitalAndStatusOrderByCreatedAtDesc(hospital, status);
        return visits.stream().map(this::toResponse).toList();
    }

    @Transactional
    public HospitalVisitConfirmResponse confirm(Long hospitalId, UUID visitId) {
        Hospital hospital = findHospital(hospitalId);
        Visit visit = visitRepository.findByIdForUpdate(visitId)
            .orElseThrow(() -> new ApiException("VISIT_NOT_FOUND", "Visit을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        if (!visit.getHospital().getId().equals(hospital.getId())) {
            throw new ApiException("VISIT_HOSPITAL_MISMATCH", "해당 병원의 Visit이 아닙니다.", HttpStatus.CONFLICT);
        }
        requireStatus(visit, VisitStatus.WAITING_HOSPITAL_CONFIRMATION, "진료 완료 처리");
        Instant now = Instant.now();
        visit.setStatus(VisitStatus.VISIT_CONFIRMED);
        visit.setHospitalConfirmedAt(now);
        return new HospitalVisitConfirmResponse(visit.getId(), visit.getStatus(), now);
    }

    private Hospital findHospital(Long hospitalId) {
        return hospitalRepository.findById(hospitalId)
            .orElseThrow(() -> new ApiException("HOSPITAL_NOT_FOUND", "병원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    private void requireStatus(Visit visit, VisitStatus expected, String action) {
        if (visit.getStatus() != expected) {
            throw new ApiException("INVALID_VISIT_STATUS",
                "현재 상태에서는 " + action + "를 할 수 없습니다.", HttpStatus.CONFLICT);
        }
    }

    private HospitalVisitResponse toResponse(Visit visit) {
        return new HospitalVisitResponse(visit.getId(), visit.getStudent().getName(),
            visit.getStudent().getStudentNumber(), visit.getUniversity().getName(),
            visit.getStatus(), visit.getCreatedAt());
    }
}

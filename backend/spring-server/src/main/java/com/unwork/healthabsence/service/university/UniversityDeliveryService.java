package com.unwork.healthabsence.service.university;

import com.unwork.healthabsence.dto.university.UniversityDeliveryResponse;
import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UniversityDeliveryService {
    private final VisitRepository visitRepository;

    @Transactional
    public UniversityDeliveryResponse send(UUID visitId) {
        Visit visit = visitRepository.findByIdForUpdate(visitId)
            .orElseThrow(() -> new ApiException("VISIT_NOT_FOUND", "Visit을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        if (visit.getStatus() != VisitStatus.VISIT_CONFIRMED) {
            throw new ApiException("INVALID_VISIT_STATUS",
                "현재 상태에서는 학교 전달 처리를 할 수 없습니다.", HttpStatus.CONFLICT);
        }
        Instant now = Instant.now();
        visit.setStatus(VisitStatus.SENT_TO_UNIVERSITY);
        visit.setSentToUniversityAt(now);
        return new UniversityDeliveryResponse(visit.getId(), visit.getStatus(), now);
    }
}

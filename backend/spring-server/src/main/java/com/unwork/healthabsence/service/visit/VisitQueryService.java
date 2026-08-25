package com.unwork.healthabsence.service.visit;

import com.unwork.healthabsence.dto.visit.*;
import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service @RequiredArgsConstructor
public class VisitQueryService {
    private final VisitRepository visitRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public VisitResponse get(UUID visitId) {
        Visit visit = visitRepository.findById(visitId)
            .orElseThrow(() -> new ApiException("VISIT_NOT_FOUND", "Visit을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        Student student = visit.getStudent();
        Hospital hospital = visit.getHospital();
        University university = visit.getUniversity();
        return new VisitResponse(visit.getId(), visit.getStatus(),
            new VisitResponse.StudentInfo(student.getName(), student.getStudentNumber()),
            new VisitResponse.HospitalInfo(hospital.getId(), hospital.getName()),
            new VisitResponse.UniversityInfo(university.getId(), university.getName()),
            visit.getConsentedAt(), visit.getHospitalConfirmedAt(), visit.getSentToUniversityAt(), visit.getCompletedAt());
    }

    @Transactional(readOnly = true)
    public List<StudentVisitResponse> getStudentVisits(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", "학생 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return visitRepository.findByStudentOrderByCreatedAtDesc(student).stream()
            .map(visit -> new StudentVisitResponse(visit.getId(), visit.getHospital().getName(),
                visit.getStatus(), visit.getCreatedAt()))
            .toList();
    }
}

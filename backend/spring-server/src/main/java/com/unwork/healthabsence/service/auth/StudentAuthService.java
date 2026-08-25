package com.unwork.healthabsence.service.auth;

import com.unwork.healthabsence.dto.auth.*;
import com.unwork.healthabsence.entity.Student;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class StudentAuthService {
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public StudentVerifyResponse verify(StudentVerifyRequest request) {
        Student student = studentRepository
            .findByUniversityCodeAndStudentNumberAndName(request.universityCode(), request.studentNumber(), request.name())
            .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", "학생 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        var university = student.getUniversity();
        return new StudentVerifyResponse(student.getId(), student.getStudentNumber(), student.getName(),
            new StudentVerifyResponse.UniversityInfo(university.getId(), university.getName(), university.getCode()));
    }
}

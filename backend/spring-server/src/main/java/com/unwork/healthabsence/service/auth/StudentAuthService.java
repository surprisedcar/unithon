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
    // 해커톤 데모용 Mock 인증 비밀번호. 실제 인증 정보로 사용하지 않습니다.
    private static final String DEMO_STUDENT_PASSWORD = "1234";

    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public StudentVerifyResponse verify(StudentVerifyRequest request) {
        Student student = studentRepository
            .findByUniversityCodeAndStudentNumberAndName(request.universityCode(), request.studentNumber(), request.name())
            .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", "학생 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return toResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentVerifyResponse login(StudentLoginRequest request) {
        Student student = studentRepository.findFirstByStudentNumber(request.studentNumber())
            .orElseThrow(this::invalidCredentials);

        if (!DEMO_STUDENT_PASSWORD.equals(request.password())) {
            throw invalidCredentials();
        }

        return toResponse(student);
    }

    private ApiException invalidCredentials() {
        return new ApiException("INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
    }

    private StudentVerifyResponse toResponse(Student student) {
        var university = student.getUniversity();
        return new StudentVerifyResponse(student.getId(), student.getStudentNumber(), student.getName(),
            new StudentVerifyResponse.UniversityInfo(university.getId(), university.getName(), university.getCode()));
    }
}

package com.unwork.healthabsence.service;

import com.unwork.healthabsence.dto.auth.StudentLoginRequest;
import com.unwork.healthabsence.entity.Student;
import com.unwork.healthabsence.entity.University;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.StudentRepository;
import com.unwork.healthabsence.service.auth.StudentAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class StudentAuthServiceTest {
    @Mock StudentRepository studentRepository;

    @Test
    void loginReturnsStudentForDemoCredentials() {
        Student student = student();
        when(studentRepository.findFirstByStudentNumber("20231234")).thenReturn(Optional.of(student));

        var response = new StudentAuthService(studentRepository)
            .login(new StudentLoginRequest("20231234", "1234"));

        assertEquals(1L, response.studentId());
        assertEquals("20231234", response.studentNumber());
        assertEquals("홍길동", response.name());
        assertEquals("숭실대학교", response.university().name());
    }

    @Test
    void loginRejectsInvalidPassword() {
        when(studentRepository.findFirstByStudentNumber("20231234")).thenReturn(Optional.of(student()));

        ApiException exception = assertThrows(ApiException.class, () -> new StudentAuthService(studentRepository)
            .login(new StudentLoginRequest("20231234", "wrong")));

        assertEquals("INVALID_CREDENTIALS", exception.getCode());
        assertEquals(401, exception.getStatus().value());
    }

    private Student student() {
        University university = new University();
        university.setId(1L);
        university.setName("숭실대학교");
        university.setCode("SSU");

        Student student = new Student();
        student.setId(1L);
        student.setStudentNumber("20231234");
        student.setName("홍길동");
        student.setUniversity(university);
        return student;
    }
}

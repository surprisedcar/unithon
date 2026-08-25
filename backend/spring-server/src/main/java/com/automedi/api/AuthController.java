package com.automedi.api;

import com.automedi.service.AuthService;
import com.automedi.service.AutoMediService;
import com.automedi.domain.Hospital;
import com.automedi.domain.Student;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AutoMediService autoMediService;

    public AuthController(AuthService authService, AutoMediService autoMediService) {
        this.authService = authService;
        this.autoMediService = autoMediService;
    }

    @PostMapping("/login")
    public ApiDtos.LoginResponse login(@Valid @RequestBody ApiDtos.LoginRequest request) {
        return authService.login(request.loginId(), request.password());
    }

    @PostMapping("/student-enrollment-verifications")
    public ApiDtos.StudentEnrollmentVerificationResponse verifyStudentEnrollment(
        @Valid @RequestBody ApiDtos.StudentEnrollmentVerificationRequest request
    ) {
        return autoMediService.verifyStudentEnrollment(request);
    }

    @PostMapping("/signup/student")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiDtos.SignupResponse signupStudent(@Valid @RequestBody ApiDtos.StudentSignupRequest request) {
        Student student = autoMediService.registerStudent(request);
        return authService.registerStudent(request.loginId(), request.password(), student.id(), student.name());
    }

    @PostMapping("/signup/hospital")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiDtos.SignupResponse signupHospital(@Valid @RequestBody ApiDtos.HospitalSignupRequest request) {
        Hospital hospital = autoMediService.verifyHospitalRegistration(request.hospitalCode(), request.registrationKey());
        return authService.registerHospital(request.loginId(), request.password(), hospital.id(), request.managerName());
    }

    @PostMapping("/student-verifications")
    public ApiDtos.StudentVerificationResponse verifyStudent(@Valid @RequestBody ApiDtos.StudentVerificationRequest request) {
        return autoMediService.verifyStudent(request);
    }
}

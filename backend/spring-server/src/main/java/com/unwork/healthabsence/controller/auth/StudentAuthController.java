package com.unwork.healthabsence.controller.auth;
import com.unwork.healthabsence.dto.auth.*;
import com.unwork.healthabsence.service.auth.StudentAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/auth/students") @RequiredArgsConstructor
public class StudentAuthController {
    private final StudentAuthService studentAuthService;
    @PostMapping("/verify")
    public StudentVerifyResponse verify(@Valid @RequestBody StudentVerifyRequest request) {
        return studentAuthService.verify(request);
    }
}

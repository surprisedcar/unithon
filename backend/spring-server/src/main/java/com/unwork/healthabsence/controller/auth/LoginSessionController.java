package com.unwork.healthabsence.controller.auth;

import com.unwork.healthabsence.dto.auth.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.service.auth.LoginSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth/sessions") @RequiredArgsConstructor
public class LoginSessionController {
    private final LoginSessionService loginSessionService;

    @PostMapping
    public SessionResponse create(@Valid @RequestBody SessionCreateRequest request) {
        return loginSessionService.create(request);
    }

    @GetMapping("/current")
    public SessionResponse current(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return loginSessionService.validate(readBearerToken(authorization));
    }

    @DeleteMapping("/current")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String authorization) {
        loginSessionService.delete(readBearerToken(authorization));
    }

    private String readBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.length() <= 7) {
            throw new ApiException("LOGIN_REQUIRED", "로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }
        return authorization.substring(7);
    }
}

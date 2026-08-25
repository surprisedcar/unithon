package com.automedi.api;

import com.automedi.domain.Role;
import com.automedi.service.AuthService;
import com.automedi.service.AutoMediService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/qr-tokens")
public class QrController {
    private final AuthService authService;
    private final AutoMediService autoMediService;

    public QrController(AuthService authService, AutoMediService autoMediService) {
        this.authService = authService;
        this.autoMediService = autoMediService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiDtos.QrTokenResponse create(
        @RequestHeader("Authorization") String authorization,
        @Valid @RequestBody ApiDtos.CreateQrTokenRequest request
    ) {
        var session = authService.require(authorization, Role.HOSPITAL);
        return autoMediService.createQrToken(session.userId(), request);
    }

    @GetMapping("/{token}")
    public ApiDtos.QrContextResponse verify(@PathVariable String token) {
        return autoMediService.verifyQrToken(token);
    }
}


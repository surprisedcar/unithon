package com.automedi.api;

import com.automedi.domain.Role;
import com.automedi.domain.VisitStatus;
import com.automedi.service.AuthService;
import com.automedi.service.AutoMediService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/students/me")
public class StudentController {
    private final AuthService authService;
    private final AutoMediService autoMediService;

    public StudentController(AuthService authService, AutoMediService autoMediService) {
        this.authService = authService;
        this.autoMediService = autoMediService;
    }

    @GetMapping("/dashboard")
    public ApiDtos.DashboardResponse dashboard(@RequestHeader("Authorization") String authorization) {
        var session = authService.require(authorization, Role.STUDENT);
        return autoMediService.dashboard(session.userId());
    }

    @GetMapping("/visits")
    public List<ApiDtos.VisitResponse> visits(
        @RequestHeader("Authorization") String authorization,
        @RequestParam(required = false) VisitStatus status
    ) {
        var session = authService.require(authorization, Role.STUDENT);
        return autoMediService.studentVisits(session.userId(), status);
    }

    @GetMapping("/notifications")
    public List<ApiDtos.NotificationResponse> notifications(@RequestHeader("Authorization") String authorization) {
        var session = authService.require(authorization, Role.STUDENT);
        return autoMediService.notifications(session.userId());
    }

    @PatchMapping("/preferences")
    public ApiDtos.PreferencesResponse preferences(
        @RequestHeader("Authorization") String authorization,
        @Valid @RequestBody ApiDtos.PreferencesRequest request
    ) {
        var session = authService.require(authorization, Role.STUDENT);
        return autoMediService.updatePreferences(session.userId(), request);
    }
}


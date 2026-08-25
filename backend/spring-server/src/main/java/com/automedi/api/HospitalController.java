package com.automedi.api;

import com.automedi.domain.Role;
import com.automedi.service.AuthService;
import com.automedi.service.AutoMediService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HospitalController {
    private final AuthService authService;
    private final AutoMediService autoMediService;

    public HospitalController(AuthService authService, AutoMediService autoMediService) {
        this.authService = authService;
        this.autoMediService = autoMediService;
    }

    @GetMapping("/hospitals")
    public List<ApiDtos.HospitalResponse> hospitals(@RequestParam(defaultValue = "") String query) {
        return autoMediService.searchHospitals(query);
    }

    @GetMapping("/hospital/visits")
    public ApiDtos.HospitalVisitsResponse visits(
        @RequestHeader("Authorization") String authorization,
        @RequestParam(defaultValue = "TODAY") String period,
        @RequestParam(defaultValue = "") String query
    ) {
        var session = authService.require(authorization, Role.HOSPITAL);
        return autoMediService.hospitalVisits(session.userId(), period, query);
    }

    @PostMapping("/hospital/visits/{visitId}/complete-treatment")
    public ApiDtos.VisitResponse completeTreatment(
        @RequestHeader("Authorization") String authorization,
        @PathVariable String visitId
    ) {
        var session = authService.require(authorization, Role.HOSPITAL);
        return autoMediService.completeTreatment(session.userId(), visitId);
    }
}


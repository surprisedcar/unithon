package com.automedi.api;

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
@RequestMapping("/api/v1/visits")
public class VisitController {
    private final AutoMediService autoMediService;

    public VisitController(AutoMediService autoMediService) {
        this.autoMediService = autoMediService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiDtos.VisitResponse create(
        @RequestHeader("Idempotency-Key") String idempotencyKey,
        @Valid @RequestBody ApiDtos.CreateVisitRequest request
    ) {
        return autoMediService.createVisit(idempotencyKey, request);
    }

    @GetMapping("/{visitId}")
    public ApiDtos.VisitResponse get(@PathVariable String visitId) {
        return autoMediService.getVisit(visitId);
    }
}


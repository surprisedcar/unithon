package com.unwork.healthabsence.controller.hospital;

import com.unwork.healthabsence.dto.hospital.*;
import com.unwork.healthabsence.entity.VisitStatus;
import com.unwork.healthabsence.service.hospital.HospitalVisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hospitals/{hospitalId}/visits")
@RequiredArgsConstructor
public class HospitalVisitController {
    private final HospitalVisitService hospitalVisitService;

    @GetMapping
    public List<HospitalVisitResponse> getVisits(
        @PathVariable Long hospitalId,
        @RequestParam(required = false) VisitStatus status
    ) {
        return hospitalVisitService.getVisits(hospitalId, status);
    }

    @PostMapping("/{visitId}/confirm")
    public HospitalVisitConfirmResponse confirm(
        @PathVariable Long hospitalId,
        @PathVariable UUID visitId
    ) {
        return hospitalVisitService.confirm(hospitalId, visitId);
    }
}

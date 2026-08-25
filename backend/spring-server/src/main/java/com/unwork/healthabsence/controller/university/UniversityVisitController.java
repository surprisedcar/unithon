package com.unwork.healthabsence.controller.university;

import com.unwork.healthabsence.dto.university.*;
import com.unwork.healthabsence.entity.VisitStatus;
import com.unwork.healthabsence.service.university.UniversityVisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/universities/{universityId}/visits")
@RequiredArgsConstructor
public class UniversityVisitController {
    private final UniversityVisitService universityVisitService;

    @GetMapping
    public List<UniversityVisitResponse> getVisits(
        @PathVariable Long universityId,
        @RequestParam(required = false) VisitStatus status
    ) {
        return universityVisitService.getVisits(universityId, status);
    }

    @PostMapping("/{visitId}/complete")
    public UniversityVisitCompleteResponse complete(
        @PathVariable Long universityId,
        @PathVariable UUID visitId
    ) {
        return universityVisitService.complete(universityId, visitId);
    }
}

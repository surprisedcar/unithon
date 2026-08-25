package com.unwork.healthabsence.controller.visit;

import com.unwork.healthabsence.dto.university.UniversityDeliveryResponse;
import com.unwork.healthabsence.service.university.UniversityDeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/visits")
@RequiredArgsConstructor
public class VisitProcessingController {
    private final UniversityDeliveryService universityDeliveryService;

    @PostMapping("/{visitId}/send-to-university")
    public UniversityDeliveryResponse sendToUniversity(@PathVariable UUID visitId) {
        return universityDeliveryService.send(visitId);
    }
}

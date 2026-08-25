package com.unwork.healthabsence.controller;
import com.unwork.healthabsence.dto.HealthResponse;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1")
public class HealthController {
    @GetMapping("/health")
    public HealthResponse health() { return new HealthResponse("UP"); }
}

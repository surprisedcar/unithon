package com.unwork.healthabsence.controller.visit;
import com.unwork.healthabsence.dto.visit.*;
import com.unwork.healthabsence.service.visit.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class VisitController {
    private final VisitCreationService visitCreationService;
    private final VisitQueryService visitQueryService;
    @PostMapping("/visits")
    public ResponseEntity<CreateVisitResponse> create(@Valid @RequestBody CreateVisitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(visitCreationService.create(request));
    }
    @GetMapping("/visits/{visitId}")
    public VisitResponse get(@PathVariable UUID visitId) { return visitQueryService.get(visitId); }
    @GetMapping("/students/{studentId}/visits")
    public List<StudentVisitResponse> getStudentVisits(@PathVariable Long studentId) {
        return visitQueryService.getStudentVisits(studentId);
    }
}

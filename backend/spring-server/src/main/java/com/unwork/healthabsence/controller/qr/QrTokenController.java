package com.unwork.healthabsence.controller.qr;
import com.unwork.healthabsence.dto.qr.*;
import com.unwork.healthabsence.service.qr.QrTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class QrTokenController {
    private final QrTokenService qrTokenService;
    @PostMapping("/hospitals/{hospitalId}/qr-tokens")
    public ResponseEntity<QrTokenCreateResponse> create(@PathVariable Long hospitalId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(qrTokenService.create(hospitalId));
    }
    @GetMapping("/qr-tokens/{token}")
    public QrTokenVerifyResponse verify(@PathVariable String token) { return qrTokenService.verify(token); }
}

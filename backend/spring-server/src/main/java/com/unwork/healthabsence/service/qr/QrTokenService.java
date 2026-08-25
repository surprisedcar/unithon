package com.unwork.healthabsence.service.qr;

import com.unwork.healthabsence.dto.qr.*;
import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.Base64;
import java.util.HexFormat;

@Service @RequiredArgsConstructor
public class QrTokenService {
    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final HospitalRepository hospitalRepository;
    private final QrTokenRepository qrTokenRepository;

    @Transactional
    public QrTokenCreateResponse create(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
            .orElseThrow(() -> new ApiException("HOSPITAL_NOT_FOUND", "병원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        Instant expiresAt = Instant.now().plus(TOKEN_LIFETIME);
        QrToken token = new QrToken();
        token.setHospital(hospital);
        token.setTokenHash(hash(rawToken));
        token.setStatus(QrTokenStatus.ACTIVE);
        token.setExpiresAt(expiresAt);
        qrTokenRepository.save(token);
        return new QrTokenCreateResponse(rawToken, hospital.getId(), hospital.getName(), expiresAt);
    }

    @Transactional
    public QrTokenVerifyResponse verify(String rawToken) {
        QrToken token = qrTokenRepository.findByTokenHash(hash(rawToken))
            .orElseThrow(this::notFound);
        validateUsable(token);
        Hospital hospital = token.getHospital();
        return new QrTokenVerifyResponse(true,
            new QrTokenVerifyResponse.HospitalInfo(hospital.getId(), hospital.getName()), token.getExpiresAt());
    }

    public void validateUsable(QrToken token) {
        if (token.getStatus() == QrTokenStatus.USED) {
            throw new ApiException("QR_TOKEN_ALREADY_USED", "이미 사용된 QR 코드입니다.", HttpStatus.CONFLICT);
        }
        if (token.getStatus() == QrTokenStatus.EXPIRED || !token.getExpiresAt().isAfter(Instant.now())) {
            token.setStatus(QrTokenStatus.EXPIRED);
            throw new ApiException("QR_TOKEN_EXPIRED", "만료된 QR 코드입니다.", HttpStatus.BAD_REQUEST);
        }
        if (token.getStatus() != QrTokenStatus.ACTIVE) {
            throw notFound();
        }
    }

    public String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private ApiException notFound() {
        return new ApiException("QR_TOKEN_NOT_FOUND", "QR 코드를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}

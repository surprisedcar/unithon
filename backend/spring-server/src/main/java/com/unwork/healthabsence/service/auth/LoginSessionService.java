package com.unwork.healthabsence.service.auth;

import com.unwork.healthabsence.dto.auth.*;
import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.LoginSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class LoginSessionService {
    private static final Duration SESSION_LIFETIME = Duration.ofDays(7);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final LoginSessionRepository loginSessionRepository;

    @Transactional
    public SessionResponse create(SessionCreateRequest request) {
        LoginRole role = resolveRole(request.username(), request.password());
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        LoginSession session = new LoginSession();
        session.setTokenHash(hash(rawToken));
        session.setRole(role);
        session.setExpiresAt(Instant.now().plus(SESSION_LIFETIME));
        loginSessionRepository.save(session);
        return new SessionResponse(rawToken, role, session.getExpiresAt());
    }

    @Transactional
    public SessionResponse validate(String rawToken) {
        LoginSession session = loginSessionRepository.findByTokenHash(hash(rawToken))
            .orElseThrow(this::unauthorized);
        if (!session.getExpiresAt().isAfter(Instant.now())) {
            loginSessionRepository.delete(session);
            throw unauthorized();
        }
        return new SessionResponse(rawToken, session.getRole(), session.getExpiresAt());
    }

    @Transactional
    public void delete(String rawToken) {
        loginSessionRepository.findByTokenHash(hash(rawToken)).ifPresent(loginSessionRepository::delete);
    }

    private LoginRole resolveRole(String username, String password) {
        if (!"1234".equals(password)) throw unauthorized();
        if ("student".equals(username)) return LoginRole.STUDENT;
        if ("hospital".equals(username)) return LoginRole.HOSPITAL;
        throw unauthorized();
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private ApiException unauthorized() {
        return new ApiException("INVALID_LOGIN_SESSION", "로그인 정보가 올바르지 않거나 세션이 만료되었습니다.", HttpStatus.UNAUTHORIZED);
    }
}

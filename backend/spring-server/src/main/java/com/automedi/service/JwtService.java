package com.automedi.service;

import com.automedi.common.ApiException;
import com.automedi.domain.Role;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    public record JwtPrincipal(String userId, String name, Role role) {}

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final String HEADER = ENCODER.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final String issuer;
    private final long accessTokenSeconds;

    public JwtService(
        ObjectMapper objectMapper,
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.issuer}") String issuer,
        @Value("${app.jwt.access-token-seconds}") long accessTokenSeconds
    ) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must contain at least 32 bytes");
        }
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.issuer = issuer;
        this.accessTokenSeconds = accessTokenSeconds;
    }

    public String issue(String userId, String name, Role role) {
        long issuedAt = Instant.now().getEpochSecond();
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("iss", issuer);
        claims.put("sub", userId);
        claims.put("name", name);
        claims.put("role", role.name());
        claims.put("iat", issuedAt);
        claims.put("exp", issuedAt + accessTokenSeconds);
        try {
            String payload = ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
            String content = HEADER + "." + payload;
            return content + "." + ENCODER.encodeToString(sign(content));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT creation failed", exception);
        }
    }

    public JwtPrincipal verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw invalidToken();
            }
            String content = parts[0] + "." + parts[1];
            if (!MessageDigest.isEqual(sign(content), DECODER.decode(parts[2]))) {
                throw invalidToken();
            }
            JsonNode header = objectMapper.readTree(DECODER.decode(parts[0]));
            JsonNode claims = objectMapper.readTree(DECODER.decode(parts[1]));
            if (!"HS256".equals(header.path("alg").asText())
                || !issuer.equals(claims.path("iss").asText())
                || claims.path("exp").asLong(0) <= Instant.now().getEpochSecond()) {
                throw invalidToken();
            }
            return new JwtPrincipal(
                claims.path("sub").asText(),
                claims.path("name").asText(),
                Role.valueOf(claims.path("role").asText())
            );
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw invalidToken();
        }
    }

    public long accessTokenSeconds() {
        return accessTokenSeconds;
    }

    private byte[] sign(String content) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(content.getBytes(StandardCharsets.US_ASCII));
    }

    private ApiException invalidToken() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_INVALID_TOKEN", "인증 토큰이 유효하지 않습니다.");
    }
}

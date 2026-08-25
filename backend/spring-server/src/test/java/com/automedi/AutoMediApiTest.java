package com.automedi;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AutoMediApiTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void hospitalCanCreateVerifyAndConsumeOneTimeQrToken() throws Exception {
        String loginBody = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"hospital\",\"password\":\"1234\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(loginBody).get("accessToken").asText();

        String qrBody = mockMvc.perform(post("/api/v1/qr-tokens")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"hospitalId\":\"hospital-1\",\"expiresInSeconds\":300}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token", notNullValue()))
            .andReturn().getResponse().getContentAsString();
        JsonNode qr = objectMapper.readTree(qrBody);

        mockMvc.perform(get("/api/v1/qr-tokens/{token}", qr.get("token").asText()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hospitalName").value("연세세브란스병원"))
            .andExpect(jsonPath("$.status").value("ISSUED"));

        String verificationBody = mockMvc.perform(post("/api/v1/auth/student-verifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"qrToken\":\"" + qr.get("token").asText() + "\",\"studentNumber\":\"2023123456\",\"name\":\"김지수\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String verificationId = objectMapper.readTree(verificationBody).get("verificationId").asText();

        mockMvc.perform(post("/api/v1/visits")
                .header("Idempotency-Key", "test-visit-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"qrToken\":\"" + qr.get("token").asText() + "\",\"studentVerificationId\":\"" + verificationId + "\",\"consent\":{\"agreed\":true,\"termsVersion\":\"2026-08-01\"}}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("WAITING"));

        mockMvc.perform(get("/api/v1/qr-tokens/{token}", qr.get("token").asText()))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("QR_ALREADY_USED"));
    }

    @Test
    void invalidQrTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/qr-tokens/not-a-token"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("QR_NOT_FOUND"));
    }

    @Test
    void verifiedStudentCanSignUpLoginAndUseJwt() throws Exception {
        String verificationBody = mockMvc.perform(post("/api/v1/auth/student-enrollment-verifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"university\":\"한국대학교\",\"studentNumber\":\"2023999999\",\"name\":\"홍길동\",\"verificationCode\":\"UNIV-2026\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String verificationId = objectMapper.readTree(verificationBody).get("verificationId").asText();

        mockMvc.perform(post("/api/v1/auth/signup/student")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"new-student\",\"password\":\"Student!2026\",\"verificationId\":\"" + verificationId + "\",\"department\":\"컴퓨터공학과\",\"grade\":1}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.role").value("STUDENT"))
            .andExpect(jsonPath("$.status").value("ACTIVE"));

        String loginBody = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"new-student\",\"password\":\"Student!2026\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String jwt = objectMapper.readTree(loginBody).get("accessToken").asText();

        if (jwt.split("\\.").length != 3) {
            throw new AssertionError("Expected a compact JWT");
        }
        mockMvc.perform(get("/api/v1/students/me/dashboard").header("Authorization", "Bearer " + jwt))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.student.name").value("홍길동"));
    }
}

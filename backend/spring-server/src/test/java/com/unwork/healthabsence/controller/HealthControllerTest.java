package com.unwork.healthabsence.controller;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(HealthController.class)
class HealthControllerTest {
    @Autowired MockMvc mockMvc;
    @Test void returnsUp() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
            .andExpect(status().isOk()).andExpect(content().json("{\"status\":\"UP\"}"));
    }
}

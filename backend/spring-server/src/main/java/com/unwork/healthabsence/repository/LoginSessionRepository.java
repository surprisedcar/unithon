package com.unwork.healthabsence.repository;

import com.unwork.healthabsence.entity.LoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {
    Optional<LoginSession> findByTokenHash(String tokenHash);
}

package com.unwork.healthabsence.repository;
import com.unwork.healthabsence.entity.QrToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface QrTokenRepository extends JpaRepository<QrToken, Long> {
    Optional<QrToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from QrToken token where token.tokenHash = :tokenHash")
    Optional<QrToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);
}

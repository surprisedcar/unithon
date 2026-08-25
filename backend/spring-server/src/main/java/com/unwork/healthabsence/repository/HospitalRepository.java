package com.unwork.healthabsence.repository;
import com.unwork.healthabsence.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByCode(String code);
}

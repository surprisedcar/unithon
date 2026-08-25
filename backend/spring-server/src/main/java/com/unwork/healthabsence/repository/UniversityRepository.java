package com.unwork.healthabsence.repository;
import com.unwork.healthabsence.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UniversityRepository extends JpaRepository<University, Long> {
    Optional<University> findByCode(String code);
}

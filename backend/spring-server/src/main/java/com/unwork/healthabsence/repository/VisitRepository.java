package com.unwork.healthabsence.repository;
import com.unwork.healthabsence.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface VisitRepository extends JpaRepository<Visit, UUID> {
    List<Visit> findByStudent(Student student);
    List<Visit> findByStudentOrderByCreatedAtDesc(Student student);
    List<Visit> findByHospitalAndStatus(Hospital hospital, VisitStatus status);
    List<Visit> findByUniversityAndStatus(University university, VisitStatus status);
    List<Visit> findByHospitalOrderByCreatedAtDesc(Hospital hospital);
    List<Visit> findByHospitalAndStatusOrderByCreatedAtDesc(Hospital hospital, VisitStatus status);
    List<Visit> findByUniversityOrderByCreatedAtDesc(University university);
    List<Visit> findByUniversityAndStatusOrderByCreatedAtDesc(University university, VisitStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select visit from Visit visit where visit.id = :visitId")
    Optional<Visit> findByIdForUpdate(@Param("visitId") UUID visitId);
}

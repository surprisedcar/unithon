package com.unwork.healthabsence.repository;
import com.unwork.healthabsence.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUniversityAndStudentNumber(University university, String studentNumber);
    Optional<Student> findByUniversityCodeAndStudentNumberAndName(String universityCode, String studentNumber, String name);
}

package com.unwork.healthabsence.config.seed;

import com.unwork.healthabsence.entity.Hospital;
import com.unwork.healthabsence.entity.Student;
import com.unwork.healthabsence.entity.University;
import com.unwork.healthabsence.repository.HospitalRepository;
import com.unwork.healthabsence.repository.StudentRepository;
import com.unwork.healthabsence.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SeedDataInitializer implements ApplicationRunner {
    private static final String UNIVERSITY_CODE = "SSU";
    private static final String STUDENT_NUMBER = "20231234";
    private static final String HOSPITAL_CODE = "HOSPITAL_001";

    private final UniversityRepository universityRepository;
    private final StudentRepository studentRepository;
    private final HospitalRepository hospitalRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        University university = universityRepository.findByCode(UNIVERSITY_CODE).orElseGet(() -> {
            University value = new University();
            value.setName("숭실대학교");
            value.setCode(UNIVERSITY_CODE);
            return universityRepository.save(value);
        });

        studentRepository.findByUniversityAndStudentNumber(university, STUDENT_NUMBER).orElseGet(() -> {
            Student value = new Student();
            value.setUniversity(university);
            value.setStudentNumber(STUDENT_NUMBER);
            value.setName("홍길동");
            return studentRepository.save(value);
        });

        hospitalRepository.findByCode(HOSPITAL_CODE).orElseGet(() -> {
            Hospital value = new Hospital();
            value.setName("유니톤의원");
            value.setCode(HOSPITAL_CODE);
            value.setActive(true);
            return hospitalRepository.save(value);
        });
    }
}

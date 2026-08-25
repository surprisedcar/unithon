package com.unwork.healthabsence.service;

import com.unwork.healthabsence.entity.*;
import com.unwork.healthabsence.exception.ApiException;
import com.unwork.healthabsence.repository.*;
import com.unwork.healthabsence.service.hospital.HospitalVisitService;
import com.unwork.healthabsence.service.university.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class VisitProcessingServiceTest {
    @Mock HospitalRepository hospitalRepository;
    @Mock UniversityRepository universityRepository;
    @Mock VisitRepository visitRepository;

    @Test
    void confirmChangesWaitingVisitToConfirmed() {
        Hospital hospital = hospital(1L);
        Visit visit = visit(hospital, university(1L), VisitStatus.WAITING_HOSPITAL_CONFIRMATION);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(visitRepository.findByIdForUpdate(visit.getId())).thenReturn(Optional.of(visit));

        var response = new HospitalVisitService(hospitalRepository, visitRepository).confirm(1L, visit.getId());

        assertEquals(VisitStatus.VISIT_CONFIRMED, response.status());
        assertNotNull(response.hospitalConfirmedAt());
        assertEquals(response.hospitalConfirmedAt(), visit.getHospitalConfirmedAt());
    }

    @Test
    void completeRejectsWaitingVisit() {
        University university = university(1L);
        Visit visit = visit(hospital(1L), university, VisitStatus.WAITING_HOSPITAL_CONFIRMATION);
        when(universityRepository.findById(1L)).thenReturn(Optional.of(university));
        when(visitRepository.findByIdForUpdate(visit.getId())).thenReturn(Optional.of(visit));

        ApiException exception = assertThrows(ApiException.class,
            () -> new UniversityVisitService(universityRepository, visitRepository).complete(1L, visit.getId()));

        assertEquals("INVALID_VISIT_STATUS", exception.getCode());
        assertEquals(409, exception.getStatus().value());
    }

    @Test
    void confirmRejectsCompletedVisit() {
        Hospital hospital = hospital(1L);
        Visit visit = visit(hospital, university(1L), VisitStatus.COMPLETED);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(visitRepository.findByIdForUpdate(visit.getId())).thenReturn(Optional.of(visit));

        ApiException exception = assertThrows(ApiException.class,
            () -> new HospitalVisitService(hospitalRepository, visitRepository).confirm(1L, visit.getId()));

        assertEquals("INVALID_VISIT_STATUS", exception.getCode());
        assertEquals(409, exception.getStatus().value());
    }

    @Test
    void deliveryChangesConfirmedVisitToSent() {
        Visit visit = visit(hospital(1L), university(1L), VisitStatus.VISIT_CONFIRMED);
        when(visitRepository.findByIdForUpdate(visit.getId())).thenReturn(Optional.of(visit));

        var response = new UniversityDeliveryService(visitRepository).send(visit.getId());

        assertEquals(VisitStatus.SENT_TO_UNIVERSITY, response.status());
        assertNotNull(response.sentToUniversityAt());
    }

    private Hospital hospital(Long id) {
        Hospital hospital = new Hospital();
        hospital.setId(id);
        return hospital;
    }

    private University university(Long id) {
        University university = new University();
        university.setId(id);
        return university;
    }

    private Visit visit(Hospital hospital, University university, VisitStatus status) {
        Visit visit = new Visit();
        visit.setId(UUID.randomUUID());
        visit.setHospital(hospital);
        visit.setUniversity(university);
        visit.setStatus(status);
        return visit;
    }
}

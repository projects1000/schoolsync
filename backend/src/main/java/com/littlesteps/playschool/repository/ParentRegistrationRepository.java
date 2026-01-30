package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.ParentRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRegistrationRepository extends MongoRepository<ParentRegistration, String> {

    // Find by registration code
    Optional<ParentRegistration> findByRegistrationCode(String registrationCode);

    // Check if registration code exists
    boolean existsByRegistrationCode(String registrationCode);

    // Find all pending registrations
    List<ParentRegistration> findByStatus(ParentRegistration.RegistrationStatus status);

    // Find registrations created by a specific admin
    List<ParentRegistration> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    // Find all registrations ordered by creation date (newest first)
    List<ParentRegistration> findAllByOrderByCreatedAtDesc();

    // Count registrations by status
    long countByStatus(ParentRegistration.RegistrationStatus status);

    // Find registrations created within a date range
    List<ParentRegistration> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find by parent email or phone (to prevent duplicates)
    Optional<ParentRegistration> findByParentEmailOrParentPhone(String email, String phone);
}
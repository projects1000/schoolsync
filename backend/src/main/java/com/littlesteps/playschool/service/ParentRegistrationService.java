package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.ParentRegistrationRequest;
import com.littlesteps.playschool.dto.ParentRegistrationResponse;
import com.littlesteps.playschool.entity.ParentRegistration;
import com.littlesteps.playschool.repository.ParentRegistrationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ParentRegistrationService {

    private final ParentRegistrationRepository parentRegistrationRepository;

    public ParentRegistrationService(ParentRegistrationRepository parentRegistrationRepository) {
        this.parentRegistrationRepository = parentRegistrationRepository;
    }

    public ParentRegistrationResponse createParentRegistration(ParentRegistrationRequest request, String createdBy) {
        // Check if parent already has a registration
        Optional<ParentRegistration> existing = parentRegistrationRepository
                .findByParentEmailOrParentPhone(request.getParentEmail(), request.getParentPhone());

        if (existing.isPresent() && existing.get().getStatus() == ParentRegistration.RegistrationStatus.PENDING) {
            throw new RuntimeException("Parent registration already exists with status PENDING");
        }

        // Generate unique registration code
        String registrationCode = generateRegistrationCode(request.getParentName(), request.getParentPhone());

        // Ensure code is unique
        while (parentRegistrationRepository.existsByRegistrationCode(registrationCode)) {
            registrationCode = generateRegistrationCode(request.getParentName(), request.getParentPhone());
        }

        // Create new registration
        ParentRegistration registration = new ParentRegistration();
        registration.setParentName(request.getParentName());
        registration.setParentEmail(request.getParentEmail());
        registration.setParentPhone(request.getParentPhone());
        registration.setStudentName(request.getStudentName());
        registration.setStudentClass(request.getStudentClass());
        registration.setRegistrationCode(registrationCode);
        registration.setStatus(ParentRegistration.RegistrationStatus.PENDING);
        registration.setCreatedAt(LocalDateTime.now());
        registration.setCreatedBy(createdBy);

        ParentRegistration saved = parentRegistrationRepository.save(registration);

        return mapToResponse(saved);
    }

    public List<ParentRegistrationResponse> getAllRegistrations() {
        return parentRegistrationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ParentRegistrationResponse> getRegistrationsByStatus(ParentRegistration.RegistrationStatus status) {
        return parentRegistrationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<ParentRegistrationResponse> getRegistrationByCode(String code) {
        return parentRegistrationRepository.findByRegistrationCode(code)
                .map(this::mapToResponse);
    }

    public boolean validateRegistrationCode(String code) {
        Optional<ParentRegistration> registration = parentRegistrationRepository.findByRegistrationCode(code);
        return registration.isPresent()
                && registration.get().getStatus() == ParentRegistration.RegistrationStatus.PENDING;
    }

    public void markCodeAsUsed(String code) {
        Optional<ParentRegistration> registration = parentRegistrationRepository.findByRegistrationCode(code);
        if (registration.isPresent()) {
            ParentRegistration reg = registration.get();
            reg.setStatus(ParentRegistration.RegistrationStatus.USED);
            reg.setUsedAt(LocalDateTime.now());
            parentRegistrationRepository.save(reg);
        }
    }

    public void deleteRegistration(String id) {
        parentRegistrationRepository.deleteById(id);
    }

    private String generateRegistrationCode(String parentName, String phone) {
        // Format: PARENT_LASTNAME_PHONE4DIGITS_TIMESTAMP
        String[] nameParts = parentName.trim().split("\\s+");
        String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
        String phoneLast4 = phone.length() >= 4 ? phone.substring(phone.length() - 4) : phone;
        String timestamp = String.valueOf(System.currentTimeMillis() % 10000);

        return String.format("PARENT_%s_%s_%s",
                lastName.toUpperCase().replaceAll("[^A-Z]", ""),
                phoneLast4,
                timestamp);
    }

    private ParentRegistrationResponse mapToResponse(ParentRegistration registration) {
        ParentRegistrationResponse response = new ParentRegistrationResponse();
        response.setId(registration.getId());
        response.setParentName(registration.getParentName());
        response.setParentEmail(registration.getParentEmail());
        response.setParentPhone(registration.getParentPhone());
        response.setStudentName(registration.getStudentName());
        response.setStudentClass(registration.getStudentClass());
        response.setRegistrationCode(registration.getRegistrationCode());
        response.setStatus(registration.getStatus().name());
        response.setCreatedAt(registration.getCreatedAt());
        response.setUsedAt(registration.getUsedAt());
        response.setCreatedBy(registration.getCreatedBy());
        response.setSchoolId(registration.getSchoolId());
        return response;
    }
}
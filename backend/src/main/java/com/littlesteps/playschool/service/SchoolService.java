package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.SchoolResponseDTO;
import com.littlesteps.playschool.dto.SchoolUpdateDTO;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SchoolService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    public List<SchoolResponseDTO> getAllSchools() {
        List<School> schools = schoolRepository.findAll();
        return schools.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    private SchoolResponseDTO mapToResponseDTO(School school) {
        SchoolResponseDTO dto = new SchoolResponseDTO(school);

        List<User> admins = userRepository.findBySchoolIdAndRole(school.getId(), User.Role.ADMIN);
        if (!admins.isEmpty()) {
            User admin = admins.get(0); // Take the first one if multiple exist
            Map<String, String> adminInfo = new HashMap<>();
            adminInfo.put("id", admin.getId());
            adminInfo.put("name", admin.getName());
            adminInfo.put("email", admin.getEmail());
            dto.setAdmin(adminInfo);
        } else if (school.getPrincipalName() != null && !school.getPrincipalName().isEmpty()) {
            Map<String, String> adminInfo = new HashMap<>();
            adminInfo.put("name", school.getPrincipalName());
            adminInfo.put("email", school.getPrincipalEmail());
            dto.setAdmin(adminInfo);
        }

        return dto;
    }

    public Optional<School> getSchoolById(String id) {
        return schoolRepository.findById(id);
    }

    @Transactional
    public School createSchool(School school) {
        if (schoolRepository.existsByCode(school.getCode())) {
            throw new IllegalArgumentException("School with code " + school.getCode() + " already exists.");
        }
        school.setCreatedAt(LocalDateTime.now());
        school.setUpdatedAt(LocalDateTime.now());
        school.setStatus(School.Status.ACTIVE);

        School savedSchool = schoolRepository.save(school);

        auditService.logAction("SUPERADMIN", "CREATE", "SCHOOL", savedSchool.getId(), savedSchool,
                "Created new school: " + savedSchool.getName());

        return savedSchool;
    }

    public School getSchoolProfile(String schoolId) {
        if (schoolId == null) {
            return null;
        }
        return schoolRepository.findById(schoolId).orElse(null);
    }

    @Transactional
    public School updateSchoolProfile(String schoolId, SchoolUpdateDTO updateDTO, String updatedBy) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));

        if (updateDTO.getTimings() != null)
            school.setTimings(updateDTO.getTimings());
        if (updateDTO.getPhone() != null)
            school.setPhone(updateDTO.getPhone());
        if (updateDTO.getEmail() != null)
            school.setEmail(updateDTO.getEmail());
        if (updateDTO.getLogo() != null)
            school.setLogo(updateDTO.getLogo());
        if (updateDTO.getAddress() != null)
            school.setAddress(updateDTO.getAddress());
        if (updateDTO.getCity() != null)
            school.setCity(updateDTO.getCity());
        if (updateDTO.getState() != null)
            school.setState(updateDTO.getState());
        if (updateDTO.getPincode() != null)
            school.setPincode(updateDTO.getPincode());

        School updatedSchool = schoolRepository.save(school);

        auditService.logAction(updatedBy, "UPDATE_SCHOOL_PROFILE", "SCHOOL", schoolId, updateDTO,
                "Updated school profile");

        return updatedSchool;
    }

    @Transactional
    public School updateSchool(String id, School schoolDetails) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        // ... existing update logic ...
        school.setName(schoolDetails.getName());
        school.setAddress(schoolDetails.getAddress());
        // ... (keep usage of exisitng methods if needed or rely on new one)
        // For safety, keeping existing methods as is
        school.setCity(schoolDetails.getCity());
        school.setState(schoolDetails.getState());
        school.setPincode(schoolDetails.getPincode());
        school.setPhone(schoolDetails.getPhone());
        school.setEmail(schoolDetails.getEmail());
        school.setPrincipalName(schoolDetails.getPrincipalName());
        school.setPrincipalEmail(schoolDetails.getPrincipalEmail());
        school.setUpdatedAt(LocalDateTime.now());

        return schoolRepository.save(school);
    }

    @Transactional
    public void updateSchoolStatus(String id, School.Status status) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        school.setStatus(status);
        school.setUpdatedAt(LocalDateTime.now());
        schoolRepository.save(school);

        auditService.logAction("SUPERADMIN", "UPDATE_STATUS", "SCHOOL", id, status,
                "Updated school status to: " + status);
    }

    @Transactional
    public void deleteSchool(String id) {
        // Business Rule: Cannot delete school if students exist (ignoring schoolId
        // usage for now)
        // Ideally check studentRepository.existsBySchoolId(id) if available.

        schoolRepository.deleteById(id);

        auditService.logAction("SUPERADMIN", "DELETE", "SCHOOL", id, null, "Deleted school with ID: " + id);
    }
}

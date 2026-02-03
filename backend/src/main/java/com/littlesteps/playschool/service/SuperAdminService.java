package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.AdminResponse;
import com.littlesteps.playschool.dto.CreateAdminRequest;
import com.littlesteps.playschool.dto.CreateSchoolRequest;
import com.littlesteps.playschool.dto.SchoolResponse;
import com.littlesteps.playschool.dto.AdminSummary;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<SchoolResponse> getAllSchools() {
        List<School> schools = schoolRepository.findAll();
        return schools.stream().map(this::mapToSchoolResponse).collect(Collectors.toList());
    }

    private SchoolResponse mapToSchoolResponse(School school) {
        AdminSummary adminSummary = null;
        if (school.getAdminId() != null) {
            User admin = userRepository.findById(school.getAdminId()).orElse(null);
            if (admin != null) {
                adminSummary = new AdminSummary(admin.getId(), admin.getName(), admin.getEmail());
            }
        }

        int studentCount = (int) studentRepository.countBySchoolId(school.getId());
        int teacherCount = (int) teacherRepository.countBySchoolId(school.getId());

        return SchoolResponse.fromEntity(school, adminSummary, studentCount, teacherCount);
    }

    @Transactional(readOnly = true)
    public List<AdminResponse> getAllAdmins() {
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);

        // Optimize school fetching by ID
        List<String> schoolIds = admins.stream()
                .map(User::getSchoolId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        List<School> schools = schoolRepository.findAllById(schoolIds);
        Map<String, String> schoolIdToNameMap = schools.stream()
                .collect(Collectors.toMap(School::getId, School::getName));

        return admins.stream().map(admin -> {
            String schoolName = null;
            if (admin.getSchoolId() != null) {
                schoolName = schoolIdToNameMap.getOrDefault(admin.getSchoolId(), "Unknown School");
            }
            return AdminResponse.fromUser(admin, schoolName);
        }).collect(Collectors.toList());
    }

    @Transactional
    public School createSchool(CreateSchoolRequest request) {
        if (schoolRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("School with this code already exists");
        }

        School school = new School();
        school.setName(request.getName());
        school.setCode(request.getCode());
        school.setAddress(request.getAddress());
        school.setCity(request.getCity());
        school.setState(request.getState());
        school.setPincode(request.getPincode());
        school.setPhone(request.getPhone());
        school.setEmail(request.getEmail());
        school.setStatus(School.Status.ACTIVE);

        // Add CreatedAt if not handled by auditing (assuming manual for now as entity
        // seemed simple)
        school.setCreatedAt(LocalDateTime.now());
        school.setUpdatedAt(LocalDateTime.now());

        return schoolRepository.save(school);
    }

    @Transactional
    public School updateSchool(String schoolId, School updateData) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));

        if (updateData.getName() != null)
            school.setName(updateData.getName());
        if (updateData.getAddress() != null)
            school.setAddress(updateData.getAddress());
        if (updateData.getCity() != null)
            school.setCity(updateData.getCity());
        if (updateData.getState() != null)
            school.setState(updateData.getState());
        if (updateData.getPincode() != null)
            school.setPincode(updateData.getPincode());
        if (updateData.getPhone() != null)
            school.setPhone(updateData.getPhone());
        if (updateData.getEmail() != null)
            school.setEmail(updateData.getEmail());
        if (updateData.getStatus() != null)
            school.setStatus(updateData.getStatus());

        school.setUpdatedAt(LocalDateTime.now());

        return schoolRepository.save(school);
    }

    @Transactional
    public void deleteSchool(String schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));

        // 1. Unlink Admin
        if (school.getAdminId() != null) {
            User admin = userRepository.findById(school.getAdminId()).orElse(null);
            if (admin != null) {
                admin.setSchoolId(null);
                userRepository.save(admin);
            }
        }

        // 2. Delete or unlink students/teachers?
        // Ideally we should delete or deactivate them. For now, strict deletion.
        // Or check if students exist and block deletion?
        // Assuming cascade deletion isn't automatic in MongoRepository without DBRefs
        // or events.
        // Let's keep it simple: just delete the school doc. Frontend Logic handles
        // warning.

        schoolRepository.delete(school);
    }

    @Transactional
    public User createAdminForSchool(String schoolId, CreateAdminRequest request, String createdByUserId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));

        if (school.getAdminId() != null) {
            throw new RuntimeException("School already has an admin assigned");
        }

        if (school.getStatus() != School.Status.ACTIVE) {
            throw new RuntimeException("Cannot assign admin to an INACTIVE school");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        User admin = new User();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setPhone(request.getPhone());
        admin.setRole(User.Role.ADMIN);
        admin.setSchoolId(school.getId());
        admin.setActive(true);
        admin.setCreatedBy(createdByUserId);
        admin.setStatus(User.Status.ACTIVE);

        User savedAdmin = userRepository.save(admin);

        // Link admin to school
        school.setAdminId(savedAdmin.getId());
        school.setPrincipalName(savedAdmin.getName());
        school.setPrincipalEmail(savedAdmin.getEmail());
        schoolRepository.save(school);

        // Audit Log
        auditService.logSchoolAction(
                createdByUserId,
                "CREATE_ADMIN",
                "USER",
                admin.getId(),
                school.getId(),
                Map.of("schoolName", school.getName()),
                "Created new admin for school " + school.getName());

        return admin;
    }

    @Transactional
    public User createAdmin(CreateAdminRequest request, String createdBy) {
        if (request.getSchoolId() == null || request.getSchoolId().isEmpty()) {
            throw new RuntimeException("School ID is required");
        }
        return createAdminForSchool(request.getSchoolId(), request, createdBy);
    }

    @Transactional
    public void assignAdminToSchool(String schoolId, String adminId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("User is not an admin");
        }

        // Check if school already has an admin assigned (Strict Rule: Cannot change
        // once assigned)
        if (school.getAdminId() != null) {
            throw new RuntimeException("School already has an admin assigned. Cannot re-assign.");
        }

        // If admin already has school, decide logic. For now, unlink from previous
        // school?
        // Or throw error? Let's unlink from previous school to be safe.
        if (admin.getSchoolId() != null && !admin.getSchoolId().equals(schoolId)) {
            School prevSchool = schoolRepository.findById(admin.getSchoolId()).orElse(null);
            if (prevSchool != null) {
                prevSchool.setAdminId(null);
                prevSchool.setPrincipalName(null);
                prevSchool.setPrincipalEmail(null);
                schoolRepository.save(prevSchool);
            }
        }

        school.setAdminId(admin.getId());
        school.setPrincipalName(admin.getName());
        school.setPrincipalEmail(admin.getEmail());

        admin.setSchoolId(school.getId());

        schoolRepository.save(school);
        userRepository.save(admin);
    }

    @Transactional
    public void reassignAdmin(String oldAdminId, String newAdminId, String performedBy) {
        User oldAdmin = userRepository.findById(oldAdminId)
                .orElseThrow(() -> new RuntimeException("Old Admin not found"));

        User newAdmin = userRepository.findById(newAdminId)
                .orElseThrow(() -> new RuntimeException("New Admin not found"));

        if (!oldAdmin.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Old user is not an Admin");
        }
        if (!newAdmin.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("New user is not an Admin");
        }

        String schoolId = oldAdmin.getSchoolId();
        if (schoolId == null) {
            throw new RuntimeException("Old admin is not assigned to any school");
        }

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));

        // 1. Block Old Admin (Invalidate Access)
        oldAdmin.setStatus(User.Status.BLOCKED);
        oldAdmin.setSchoolId(null);
        userRepository.save(oldAdmin);

        // 2. Unlink School from Old Admin (Double check consistency)
        if (school.getAdminId() != null && school.getAdminId().equals(oldAdminId)) {
            school.setAdminId(null); // Temporarily clear
        }

        // 3. Assign New Admin (Reuse existing assignment logic or manual)
        // Ensure new admin is not already assigned
        if (newAdmin.getSchoolId() != null) {
            throw new RuntimeException("New admin is already assigned to a school");
        }

        newAdmin.setSchoolId(school.getId());
        userRepository.save(newAdmin);

        school.setAdminId(newAdmin.getId());
        school.setPrincipalName(newAdmin.getName());
        school.setPrincipalEmail(newAdmin.getEmail());
        schoolRepository.save(school);

        // 4. Audit Log
        auditService.logSchoolAction(
                performedBy,
                "REASSIGN_ADMIN",
                "SCHOOL",
                school.getId(),
                school.getId(),
                Map.of(
                        "oldAdminId", oldAdminId,
                        "newAdminId", newAdminId,
                        "schoolName", school.getName()),
                "Reassigned admin for school " + school.getName() + " from " + oldAdmin.getEmail() + " to "
                        + newAdmin.getEmail());
    }

    @Transactional
    public void updateAdminStatus(String adminId, String statusStr, String performedBy) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("User is not an Admin");
        }

        User.Status newStatus;
        try {
            newStatus = User.Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }

        if (newStatus != User.Status.ACTIVE && newStatus != User.Status.BLOCKED && newStatus != User.Status.SUSPENDED) {
            throw new RuntimeException("Only ACTIVE, BLOCKED or SUSPENDED status updates are allowed via this API");
        }

        // Blocked/Active logic
        admin.setStatus(newStatus);

        // If blocking, maybe ensure active boolean is sync? Or rely on Enum.
        // Let's keep Active boolean true usually, relying on Status Enum for finer
        // control as per new logic.

        userRepository.save(admin);

        String schoolId = admin.getSchoolId();
        String actionName = (newStatus == User.Status.BLOCKED) ? "BLOCK_ADMIN" : "UNBLOCK_ADMIN";

        auditService.logSchoolAction(
                performedBy,
                actionName,
                "USER",
                admin.getId(),
                schoolId,
                Map.of("oldStatus", admin.getStatus(), "newStatus", newStatus),
                "Updated admin status to " + newStatus);
    }

    @Transactional
    public void resetAdminPassword(String adminId, String performedBy) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("User is not an Admin");
        }

        String defaultPassword = "password123";
        admin.setPassword(passwordEncoder.encode(defaultPassword));
        userRepository.save(admin);

        auditService.logSchoolAction(
                performedBy,
                "RESET_PASSWORD",
                "USER",
                admin.getId(),
                admin.getSchoolId(),
                null,
                "Reset password for admin " + admin.getEmail());
    }

    @Transactional(readOnly = true)
    public com.littlesteps.playschool.dto.DashboardStats getDashboardData() {
        long totalSchools = schoolRepository.count();
        long activeSchools = schoolRepository.countByStatus(School.Status.ACTIVE);
        long inactiveSchools = totalSchools - activeSchools;
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();

        com.littlesteps.playschool.dto.DashboardStats stats = new com.littlesteps.playschool.dto.DashboardStats(
                totalSchools, activeSchools, inactiveSchools, totalStudents, totalTeachers);

        // Populate Recent Schools (Top 5)
        // Note: Ideally use a custom repository method for efficiency, here doing
        // stream for simplicity as School volume is likely low initially
        List<Map<String, Object>> recentSchools = schoolRepository.findAll().stream()
                .sorted((s1, s2) -> {
                    LocalDateTime t1 = s1.getCreatedAt();
                    LocalDateTime t2 = s2.getCreatedAt();
                    if (t1 == null && t2 == null)
                        return 0;
                    if (t1 == null)
                        return 1;
                    if (t2 == null)
                        return -1;
                    return t2.compareTo(t1);
                })
                .limit(5)
                .map(s -> Map.<String, Object>of(
                        "name", s.getName() != null ? s.getName() : "Unknown",
                        "date", s.getCreatedAt() != null ? s.getCreatedAt().toString() : LocalDateTime.now().toString(),
                        "status", s.getStatus() != null ? s.getStatus().toString() : "UNKNOWN",
                        "students", studentRepository.countBySchoolId(s.getId()) // N+1 but ok for 5 items
                ))
                .collect(Collectors.toList());
        stats.setRecentSchools(recentSchools);

        // Populate Active Admins (Top 5)
        List<Map<String, Object>> activeAdmins = userRepository.findByRole(User.Role.ADMIN).stream()
                .filter(u -> u.getStatus() == User.Status.ACTIVE)
                .limit(5)
                .map(u -> Map.<String, Object>of(
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "school", u.getSchoolId() != null ? "Assigned" : "Unassigned" // Could fetch school name but
                                                                                      // keeping simple
                ))
                .collect(Collectors.toList());
        stats.setActiveAdmins(activeAdmins);

        return stats;
    }
}

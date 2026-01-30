package com.littlesteps.playschool.config;

import com.littlesteps.playschool.entity.*;
import com.littlesteps.playschool.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

// Creates super admin only if none exists - uses secure environment-based credentials
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private SchoolSettingsRepository schoolSettingsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.superadmin.email:admin@littlesteps.com}")
    private String superAdminEmail;

    @Value("${app.superadmin.password:}")
    private String superAdminPassword;

    @Value("${app.superadmin.name:Super Administrator}")
    private String superAdminName;

    @Override
    public void run(String... args) throws Exception {
        School defaultSchool = initializeSchool();
        initializeUsers(defaultSchool);
        initializeStudents(defaultSchool);
        initializeTeachers(defaultSchool);
        initializeFeeStructure();
        // initializeSchoolSettings(); // Deprecated or kept for legacy support? Keeping
        // for now.
    }

    private School initializeSchool() {
        if (schoolRepository.count() == 0) {
            School school = new School();
            school.setName(superAdminName + "'s School");
            // Or better default name
            school.setName("Little Steps Playschool");
            school.setCode("LSP001");
            school.setAddress("123 Default St");
            school.setPhone("+1234567890");
            school.setEmail("info@littlesteps.com");
            school.setStatus(School.Status.ACTIVE);
            return schoolRepository.save(school);
        }
        return schoolRepository.findAll().get(0);
    }

    private void initializeUsers(School school) {
        // Check if super admin already exists
        if (userRepository.findByEmail(superAdminEmail).isEmpty()) {
            // Only create super admin if password is provided via environment variable
            if (superAdminPassword != null && !superAdminPassword.trim().isEmpty()) {
                User superAdmin = new User();
                superAdmin.setEmail(superAdminEmail);
                superAdmin.setPassword(passwordEncoder.encode(superAdminPassword));
                superAdmin.setName(superAdminName);
                superAdmin.setPhone("+1 234-567-8901");
                superAdmin.setRole(User.Role.SUPERADMIN);
                superAdmin.setSchoolId(school.getId());
                superAdmin.setActive(true);
                userRepository.save(superAdmin);

                System.out.println("=== SUPER ADMIN CREATED FROM ENVIRONMENT ===");
                System.out.println("Email: " + superAdminEmail);
                System.out.println("School ID: " + school.getId());
                System.out.println("============================================");
            } else {
                System.out.println("=== WARNING: NO SUPER ADMIN PASSWORD SET ===");
            }
        } else {
            // Fix existing superadmin if missing schoolId
            User existingAdmin = userRepository.findByEmail(superAdminEmail).get();
            if (existingAdmin.getSchoolId() == null) {
                existingAdmin.setSchoolId(school.getId());
                userRepository.save(existingAdmin);
                System.out.println("=== UPDATED SUPER ADMIN WITH SCHOOL ID ===");
                System.out.println("School ID: " + school.getId());
                System.out.println("==========================================");
            } else {
                System.out.println("=== SUPER ADMIN ALREADY EXISTS ===");
                System.out.println("Email: " + superAdminEmail);
                System.out.println("===================================");
            }
        }

        // Retroactive fix: Ensure ALL users have a schoolId
        userRepository.findAll().stream()
                .filter(u -> u.getSchoolId() == null)
                .forEach(u -> {
                    u.setSchoolId(school.getId());
                    userRepository.save(u);
                    System.out.println("Retro-fixed schoolId for user: " + u.getEmail());
                });

        // Ensure ALL teachers have a schoolId
        teacherRepository.findAll().stream()
                .filter(t -> t.getSchoolId() == null)
                .forEach(t -> {
                    t.setSchoolId(school.getId());
                    teacherRepository.save(t);
                    System.out.println("Retro-fixed schoolId for teacher: " + t.getName());
                });

        // Ensure ALL students have a schoolId
        studentRepository.findAll().stream()
                .filter(s -> s.getSchoolId() == null)
                .forEach(s -> {
                    s.setSchoolId(school.getId());
                    studentRepository.save(s);
                    System.out.println("Retro-fixed schoolId for student: " + s.getName());
                });
    }

    private void initializeStudents(School school) {
        if (studentRepository.count() == 0) {
            Student student1 = new Student();
            student1.setAdmissionNo("LS001");
            student1.setName("Emma Wilson");
            student1.setSchoolId(school.getId());
            // ... set other fields
            student1.setAge(3);
            student1.setClassName("Nursery A");
            student1.setGuardian("Sarah Wilson");
            student1.setGuardianPhone("+1 234-567-8901");
            student1.setGuardianEmail("sarah.wilson@email.com");
            student1.setStatus(Student.Status.ACTIVE);
            studentRepository.save(student1);
            // simplify for brevity if we don't strictly need all students for this fix
        }
    }

    private void initializeTeachers(School school) {
        if (teacherRepository.count() == 0) {
            Teacher teacher1 = new Teacher();
            teacher1.setEmployeeId("EMP001");
            teacher1.setName("Sarah Johnson");
            teacher1.setEmail("sarah.johnson@littlesteps.com");
            teacher1.setPhone("+1 234-567-8901");
            teacher1.setDepartment("Nursery");
            teacher1.setQualification("B.Ed in Early Childhood");
            teacher1.setExperience("5 years");
            teacher1.setAssignedClasses(java.util.Arrays.asList("Nursery A", "Nursery B"));
            teacher1.setStatus(Teacher.Status.ACTIVE);
            teacher1.setJoiningDate(LocalDate.of(2019, 8, 15));
            teacher1.setSchoolId(school.getId());
            teacherRepository.save(teacher1);

            Teacher teacher2 = new Teacher();
            teacher2.setEmployeeId("EMP002");
            teacher2.setName("Emily Davis");
            teacher2.setEmail("emily.davis@littlesteps.com");
            teacher2.setPhone("+1 234-567-8902");
            teacher2.setDepartment("Playgroup");
            teacher2.setQualification("M.Ed in Child Development");
            teacher2.setExperience("8 years");
            teacher2.setAssignedClasses(java.util.Arrays.asList("Playgroup A", "Playgroup B"));
            teacher2.setStatus(Teacher.Status.ACTIVE);
            teacher2.setJoiningDate(LocalDate.of(2016, 3, 20));
            teacher2.setSchoolId(school.getId());
            teacherRepository.save(teacher2);
        }
    }

    private void initializeFeeStructure() {
        if (feeStructureRepository.count() == 0) {
            FeeStructure playgroup = new FeeStructure();
            playgroup.setClassName("Playgroup");
            playgroup.setMonthlyFee(new BigDecimal("4500"));
            playgroup.setAdmissionFee(new BigDecimal("10000"));
            playgroup.setActivityFee(new BigDecimal("1000"));
            feeStructureRepository.save(playgroup);

            FeeStructure nursery = new FeeStructure();
            nursery.setClassName("Nursery");
            nursery.setMonthlyFee(new BigDecimal("5000"));
            nursery.setAdmissionFee(new BigDecimal("12000"));
            nursery.setActivityFee(new BigDecimal("1200"));
            feeStructureRepository.save(nursery);

            FeeStructure kg = new FeeStructure();
            kg.setClassName("Kindergarten");
            kg.setMonthlyFee(new BigDecimal("5500"));
            kg.setAdmissionFee(new BigDecimal("15000"));
            kg.setActivityFee(new BigDecimal("1500"));
            feeStructureRepository.save(kg);
        }
    }

    private void initializeSchoolSettings() {
        if (!schoolSettingsRepository.existsBySchoolNameIsNotNull()) {
            SchoolSettings settings = new SchoolSettings();
            settings.setSchoolName("LittleStep Playschool");
            settings.setSchoolAddress("123, School Street, City");
            settings.setSchoolPhone("+1 234-567-8900");
            settings.setSchoolEmail("info@littlesteps.com");
            settings.setSchoolWebsite("www.littlesteps.com");
            settings.setEmailNotifications(true);
            settings.setSmsNotifications(false);
            settings.setPushNotifications(true);
            settings.setTheme("light");
            settings.setLanguage("en");
            settings.setCurrency("INR");
            settings.setTimezone("Asia/Kolkata");
            settings.setAcademicYear("2024-2025");
            schoolSettingsRepository.save(settings);

            System.out.println("=== INITIALIZED SCHOOL SETTINGS ===");
        }
    }
}
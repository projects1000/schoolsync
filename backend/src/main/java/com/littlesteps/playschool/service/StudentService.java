package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.repository.StudentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@CacheConfig(cacheNames = "students")
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ParentStudentMapRepository parentStudentMapRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ParentRepository parentRepository;

    @Autowired
    private com.littlesteps.playschool.repository.UserRepository userRepository;

    @Cacheable(key = "#schoolId + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<StudentDTO> getAllStudents(String schoolId, Pageable pageable) {
        return studentRepository.findBySchoolIdAndStatusNot(schoolId, Student.Status.DELETED, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(key = "{#schoolId, #classId}")
    public List<StudentDTO> getStudentsByClassId(String schoolId, String classId) {
        return studentRepository.findBySchoolIdAndClassIdAndStatusNot(schoolId, classId, Student.Status.DELETED)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(key = "#schoolId + '_' + #classId + '_byClassId_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<StudentDTO> getStudentsByClassId(String schoolId, String classId, Pageable pageable) {
        return studentRepository.findBySchoolIdAndClassIdAndStatusNot(schoolId, classId, Student.Status.DELETED, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(key = "{#schoolId, 'deleted'}")
    public List<StudentDTO> getDeletedStudents(String schoolId) {
        return studentRepository.findBySchoolIdAndStatus(schoolId, Student.Status.DELETED)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(key = "#schoolId + '_deleted_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<StudentDTO> getDeletedStudents(String schoolId, Pageable pageable) {
        return studentRepository.findBySchoolIdAndStatus(schoolId, Student.Status.DELETED, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(key = "#id")
    public StudentDTO getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return convertToDTO(student);
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public StudentDTO createStudent(StudentDTO studentDTO, String schoolId) {
        // Auto-generate Admission No
        String admissionNo = generateAdmissionNo();

        Student newStudent = modelMapper.map(studentDTO, Student.class);
        newStudent.setAdmissionNo(admissionNo);
        newStudent.setStatus(Student.Status.ACTIVE); // Default status
        newStudent.setSchoolId(schoolId);

        // Resolve Class/Section Name if ID provided
        if (studentDTO.getClassId() != null) {
            classesRepository.findById(studentDTO.getClassId())
                    .ifPresent(cls -> {
                        newStudent.setClassName(cls.getName());
                        newStudent.setSectionId(cls.getSection());
                    });
        }

        // 1. Fetch existing students
        // 2. Add new student to list
        // 3. Sort list alphabetically
        // 4. Reassign roll numbers
        // 5. Save (Atomic)

        if (newStudent.getClassId() != null && newStudent.getSectionId() != null) {
            // Save first (without roll no initially or with logic)
            // But strict rule: "Roll number must be auto-assigned by backend"
            // We can save with null/default rollNo, then recalculate.

            Student savedStudent = studentRepository.save(newStudent);

            // Recalculate Roll Numbers for the section (includes the new student)
            recalculateRollNumbers(schoolId, savedStudent.getClassId(), savedStudent.getSectionId());

            // Refetch to get assigned roll number
            return convertToDTO(studentRepository.findById(savedStudent.getId()).orElse(savedStudent));
        } else {
            // Fallback if no class/section assigned
            Student saved = studentRepository.save(newStudent);
            return convertToDTO(saved);
        }
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public StudentDTO updateStudent(String id, StudentDTO studentDTO) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String schoolId = existingStudent.getSchoolId();
        String oldName = existingStudent.getName();
        String oldClassId = existingStudent.getClassId();
        String oldSectionId = existingStudent.getSectionId();

        // Update fields
        if (studentDTO.getAdmissionNo() != null
                && !existingStudent.getAdmissionNo().equals(studentDTO.getAdmissionNo())) {
            if (studentRepository.existsByAdmissionNo(studentDTO.getAdmissionNo())) {
                throw new RuntimeException("Admission number already exists");
            }
            existingStudent.setAdmissionNo(studentDTO.getAdmissionNo());
        }

        existingStudent.setName(studentDTO.getName());
        existingStudent.setAge(studentDTO.getAge());
        existingStudent.setGuardian(studentDTO.getGuardian());
        existingStudent.setGuardianPhone(studentDTO.getGuardianPhone());
        existingStudent.setGuardianEmail(studentDTO.getGuardianEmail());
        existingStudent.setAddress(studentDTO.getAddress());

        // Profile fields
        if (studentDTO.getDateOfBirth() != null) {
            existingStudent.setDateOfBirth(studentDTO.getDateOfBirth());
        }
        if (studentDTO.getGender() != null) {
            existingStudent.setGender(studentDTO.getGender());
        }
        if (studentDTO.getBloodGroup() != null) {
            existingStudent.setBloodGroup(studentDTO.getBloodGroup());
        }
        if (studentDTO.getNewToEducation() != null) {
            existingStudent.setNewToEducation(studentDTO.getNewToEducation());
        }
        if (studentDTO.getPreviousSchool() != null) {
            existingStudent.setPreviousSchool(studentDTO.getPreviousSchool());
        }
        if (studentDTO.getMedicalConditions() != null) {
            existingStudent.setMedicalConditions(studentDTO.getMedicalConditions());
        }
        if (studentDTO.getTransportMode() != null) {
            existingStudent.setTransportMode(studentDTO.getTransportMode());
        }
        if (studentDTO.getProfileCompleted() != null) {
            existingStudent.setProfileCompleted(studentDTO.getProfileCompleted());
        }

        if (studentDTO.getClassId() != null) {
            existingStudent.setClassId(studentDTO.getClassId());
            classesRepository.findById(studentDTO.getClassId())
                    .ifPresent(cls -> {
                        existingStudent.setClassName(cls.getName());
                        existingStudent.setSectionId(cls.getSection());
                    });
        }
        if (studentDTO.getSectionId() != null) {
            existingStudent.setSectionId(studentDTO.getSectionId());
        }

        if (studentDTO.getStatus() != null) {
            existingStudent.setStatus(Student.Status.valueOf(studentDTO.getStatus().toUpperCase()));
        }

        Student savedStudent = studentRepository.save(existingStudent);

        // Check for Section Change
        boolean sectionChanged = (studentDTO.getClassId() != null && !studentDTO.getClassId().equals(oldClassId)) ||
                (studentDTO.getSectionId() != null && !studentDTO.getSectionId().equals(oldSectionId)) ||
                (existingStudent.getSectionId() != null && !existingStudent.getSectionId().equals(oldSectionId));

        if (sectionChanged) {
            // Recalc Old Section Logic
            if (oldClassId != null && oldSectionId != null) {
                recalculateRollNumbers(schoolId, oldClassId, oldSectionId);
            }
            // Recalc New Section Logic
            recalculateRollNumbers(schoolId, savedStudent.getClassId(), savedStudent.getSectionId());

            // Refetch to ensure we return the latest state
            savedStudent = studentRepository.findById(savedStudent.getId()).orElse(savedStudent);

        } else if (studentDTO.getName() != null && !studentDTO.getName().equals(oldName)) {
            // Name Change Logic: Recalculate current section
            recalculateRollNumbers(savedStudent.getSchoolId(), savedStudent.getClassId(), savedStudent.getSectionId());
            savedStudent = studentRepository.findById(savedStudent.getId()).orElse(savedStudent);
        }

        return convertToDTO(savedStudent);
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public void promoteStudent(String id, String newClassId, String newSectionId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String oldClassId = student.getClassId();
        String oldSectionId = student.getSectionId();
        String schoolId = student.getSchoolId();

        student.setClassId(newClassId);

        // Lookup class to set name and resolve sectionId if needed
        classesRepository.findById(newClassId).ifPresent(cls -> {
            student.setClassName(cls.getName());
            if (newSectionId == null || newSectionId.isEmpty()) {
                student.setSectionId(cls.getSection());
            } else {
                student.setSectionId(newSectionId);
            }
        });

        String finalizedSectionId = student.getSectionId();

        // Save first to be included in the new section query
        studentRepository.save(student);

        // Recalculate Roll No for new class/section
        recalculateRollNumbers(schoolId, newClassId, finalizedSectionId);

        // Recalculate Roll No for old class/section to close gaps
        if (oldClassId != null && oldSectionId != null) {
            recalculateRollNumbers(schoolId, oldClassId, oldSectionId);
        }

        studentRepository.save(student);
    }

    @CacheEvict(allEntries = true)
    public void updateStudentStatus(String id, String status) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setStatus(Student.Status.valueOf(status.toUpperCase()));
        studentRepository.save(student);
    }

    @CacheEvict(allEntries = true)
    public void deleteStudent(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getStatus() == Student.Status.DELETED) {
            throw new RuntimeException("Student is already deleted");
        }

        String schoolId = student.getSchoolId();

        // 1. Soft Delete Student
        student.setStatus(Student.Status.DELETED);
        studentRepository.save(student);

        // 2. Recalculate roll numbers for the section they were removed from
        if (student.getClassId() != null && student.getSectionId() != null) {
            recalculateRollNumbers(schoolId, student.getClassId(), student.getSectionId());
        }

        // 3. Find and soft-delete mapped parents (Cascade)
        List<com.littlesteps.playschool.entity.ParentStudentMap> mappings = parentStudentMapRepository
                .findByStudentIdAndSchoolId(id, schoolId);

        for (com.littlesteps.playschool.entity.ParentStudentMap mapping : mappings) {
            String parentId = mapping.getParentId();
            // Check if this parent has other ACTIVE children
            long activeChildrenCount = parentStudentMapRepository.findByParentIdAndSchoolId(parentId, schoolId).stream()
                    .filter(m -> {
                        return studentRepository.findById(m.getStudentId())
                                .map(s -> s.getStatus() != Student.Status.DELETED)
                                .orElse(false);
                    }).count();

            // If no active children left, soft-delete the parent too
            // Admin can choose to restore them later.
            if (activeChildrenCount == 0) {
                com.littlesteps.playschool.entity.Parent parent = parentRepository.findById(parentId).orElse(null);
                if (parent != null && parent.getStatus() != com.littlesteps.playschool.entity.Parent.Status.DELETED) {
                    parent.setStatus(com.littlesteps.playschool.entity.Parent.Status.DELETED);
                    parentRepository.save(parent);

                    // Disable User account for parent
                    if (parent.getUserId() != null) {
                        userRepository.findById(parent.getUserId()).ifPresent(user -> {
                            user.setStatus(com.littlesteps.playschool.entity.User.Status.DELETED);
                            user.setActive(false);
                            userRepository.save(user);
                        });
                    }
                }
            }
        }

        String username = "SYSTEM";
        try {
            username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                    .getName();
        } catch (Exception e) {
        }
        auditService.logAction(username, "DELETE", "STUDENT", id, null, "Soft deleted student: " + student.getName());
    }

    @CacheEvict(allEntries = true)
    public void restoreStudent(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getStatus() != Student.Status.DELETED) {
            throw new RuntimeException("Student is not deleted");
        }

        String schoolId = student.getSchoolId();

        // 1. Restore Student to INACTIVE status
        student.setStatus(Student.Status.INACTIVE);
        studentRepository.save(student);

        // 2. Find and restore mapped parents if they were deleted
        List<com.littlesteps.playschool.entity.ParentStudentMap> mappings = parentStudentMapRepository
                .findByStudentIdAndSchoolId(id, schoolId);

        for (com.littlesteps.playschool.entity.ParentStudentMap mapping : mappings) {
            String parentId = mapping.getParentId();
            com.littlesteps.playschool.entity.Parent parent = parentRepository.findById(parentId).orElse(null);

            if (parent != null && parent.getStatus() == com.littlesteps.playschool.entity.Parent.Status.DELETED) {
                parent.setStatus(com.littlesteps.playschool.entity.Parent.Status.INACTIVE);
                parentRepository.save(parent);

                // Re-enable User account for parent
                if (parent.getUserId() != null) {
                    userRepository.findById(parent.getUserId()).ifPresent(user -> {
                        user.setStatus(com.littlesteps.playschool.entity.User.Status.ACTIVE);
                        user.setActive(true);
                        userRepository.save(user);
                    });
                }
            }
        }

        String username = "SYSTEM";
        try {
            username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                    .getName();
        } catch (Exception e) {
        }
        auditService.logAction(username, "RESTORE", "STUDENT", id, null,
                "Restored soft deleted student: " + student.getName());
    }

    @Cacheable(key = "#schoolId + '_' + #classId + '_byClass_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<StudentDTO> getStudentsByClass(String schoolId, String classId, Pageable pageable) {
        return studentRepository.findBySchoolIdAndClassName(schoolId, classId, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(key = "#schoolId + '_' + #searchTerm + '_search_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<StudentDTO> searchStudents(String schoolId, String searchTerm, Pageable pageable) {
        return studentRepository.searchStudents(schoolId, searchTerm, pageable)
                .map(this::convertToDTO);
    }

    private String generateAdmissionNo() {
        String prefix = "ADM";
        String year = String.valueOf(java.time.Year.now().getValue());
        String admissionNo;
        do {
            int randomPart = new java.security.SecureRandom().nextInt(10000);
            admissionNo = prefix + year + String.format("%04d", randomPart);
        } while (studentRepository.existsByAdmissionNo(admissionNo));
        return admissionNo;
    }

    @Autowired
    private AuditService auditService;

    // ... (existing helper methods)

    private void recalculateRollNumbers(String schoolId, String classId, String sectionId) {
        List<Student> students = studentRepository.findBySchoolIdAndClassIdAndSectionIdAndStatus(
                schoolId, classId, sectionId, Student.Status.ACTIVE);

        // Sort alphabetically: Trim spaces, lowercase, A->Z
        students.sort((s1, s2) -> {
            String n1 = s1.getName() != null ? s1.getName().trim().toLowerCase() : "";
            String n2 = s2.getName() != null ? s2.getName().trim().toLowerCase() : "";
            return n1.compareTo(n2);
        });

        // Assign Roll Numbers
        int rollNo = 1;
        boolean changed = false;
        List<String> affectedIds = new java.util.ArrayList<>();

        for (Student s : students) {
            // Optimization: Only save if rollNo changes
            if (s.getRollNo() == null || s.getRollNo() != rollNo) {
                s.setRollNo(rollNo);
                studentRepository.save(s);
                changed = true;
            }
            affectedIds.add(s.getId());
            rollNo++;
        }

        if (changed || !affectedIds.isEmpty()) { // Log even if just verification/initial assignment? User requested
                                                 // "Log roll number changes".
            // "affectedStudentIds" implies we should log who was in the specific
            // calculation.
            // We'll log if we ran the calculation.
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            // Assuming authentication is available (it should be for Admin/Teacher actions)
            // If triggered by system/startup, might need handling. But requirements say
            // "Admin login... exists".
            if (username != null && !username.equals("anonymousUser")) {
                auditService.logRollNumberRecalculation(username, classId, sectionId, affectedIds, schoolId);
            }
        }
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public void unassignStudentsFromClass(String classId) {
        List<Student> students = studentRepository.findByClassId(classId);
        for (Student student : students) {
            student.setClassId(null);
            student.setSectionId(null);
            student.setClassName(null);
            studentRepository.save(student);
        }
    }

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = modelMapper.map(student, StudentDTO.class);
        return dto;
    }
}
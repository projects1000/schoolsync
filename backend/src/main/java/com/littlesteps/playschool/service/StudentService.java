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

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    public List<StudentDTO> getAllStudents(String schoolId) {
        return studentRepository.findBySchoolId(schoolId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return convertToDTO(student);
    }

    @Transactional
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
                    .ifPresent(cls -> newStudent.setClassName(cls.getName()));
        }

        // 1. Fetch existing students
        // 2. Add new student to list
        // 3. Sort list alphabetically
        // 4. Reassign roll numbers
        // 5. Save (Atomic)

        if (studentDTO.getClassId() != null && studentDTO.getSectionId() != null) {
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
                    .ifPresent(cls -> existingStudent.setClassName(cls.getName()));
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
                (studentDTO.getSectionId() != null && !studentDTO.getSectionId().equals(oldSectionId));

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
    public void promoteStudent(String id, String newClassId, String newSectionId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String oldClassId = student.getClassId();
        String oldSectionId = student.getSectionId();
        String schoolId = student.getSchoolId();

        student.setClassId(newClassId);
        student.setSectionId(newSectionId);

        // Save first to be included in the new section query
        studentRepository.save(student);

        // Recalculate Roll No for new class/section
        recalculateRollNumbers(schoolId, newClassId, newSectionId);

        // Recalculate Roll No for old class/section to close gaps
        if (oldClassId != null && oldSectionId != null) {
            recalculateRollNumbers(schoolId, oldClassId, oldSectionId);
        }

        // Update class name for display
        classesRepository.findById(newClassId)
                .ifPresent(cls -> student.setClassName(cls.getName()));

        studentRepository.save(student);
    }

    public void updateStudentStatus(String id, String status) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setStatus(Student.Status.valueOf(status.toUpperCase()));
        studentRepository.save(student);
    }

    public void deleteStudent(String id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }
        studentRepository.deleteById(id);
    }

    public List<StudentDTO> getStudentsByClass(String schoolId, String classId) {
        return studentRepository.findBySchoolIdAndClassName(schoolId, classId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> searchStudents(String schoolId, String searchTerm) {
        return studentRepository.searchStudents(schoolId, searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = modelMapper.map(student, StudentDTO.class);
        return dto;
    }
}
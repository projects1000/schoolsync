package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.repository.StudentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    private com.littlesteps.playschool.repository.SectionRepository sectionRepository;

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

    public StudentDTO createStudent(StudentDTO studentDTO, String schoolId) {
        // Auto-generate Admission No
        String admissionNo = generateAdmissionNo();

        Student student = modelMapper.map(studentDTO, Student.class);
        student.setAdmissionNo(admissionNo);
        student.setStatus(Student.Status.ACTIVE); // Default status
        student.setSchoolId(schoolId);

        // Resolve Class/Section Names if IDs are provided
        if (studentDTO.getClassId() != null) {
            classesRepository.findById(studentDTO.getClassId())
                    .ifPresent(cls -> student.setClassName(cls.getName()));
        }

        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    public StudentDTO updateStudent(String id, StudentDTO studentDTO) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Don't allow changing admission no manually easily, or check uniqueness if we
        // do
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
        return convertToDTO(savedStudent);
    }

    public void promoteStudent(String id, String newClassId, String newSectionId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setClassId(newClassId);
        student.setSectionId(newSectionId);

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

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = modelMapper.map(student, StudentDTO.class);
        // Ensure manual mapping if strictness needed, but ModelMapper should handle it
        return dto;
    }
}
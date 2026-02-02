package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private UserRepository userRepository;

    private String getSchoolId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getSchoolId();
    }

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents(Authentication authentication) {
        String schoolId = getSchoolId(authentication.getName());
        List<StudentDTO> students = studentService.getAllStudents(schoolId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable String id) {
        try {
            StudentDTO student = studentService.getStudentById(id);
            return ResponseEntity.ok(student);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication.getName());
            StudentDTO createdStudent = studentService.createStudent(studentDTO, schoolId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable String id, @RequestBody StudentDTO studentDTO) {
        try {
            StudentDTO updatedStudent = studentService.updateStudent(id, studentDTO);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<List<StudentDTO>> getStudentsByClass(@PathVariable String className,
            Authentication authentication) {
        String schoolId = getSchoolId(authentication.getName());
        List<StudentDTO> students = studentService.getStudentsByClass(schoolId, className);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudentDTO>> searchStudents(@RequestParam String term, Authentication authentication) {
        String schoolId = getSchoolId(authentication.getName());
        List<StudentDTO> students = studentService.searchStudents(schoolId, term);
        return ResponseEntity.ok(students);
    }

    @PatchMapping("/{id}/promote")
    public ResponseEntity<Void> promoteStudent(@PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String classId = request.get("classId");
            String sectionId = request.get("sectionId");
            studentService.promoteStudent(id, classId, sectionId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStudentStatus(@PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String status = request.get("status");
            studentService.updateStudentStatus(id, status);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
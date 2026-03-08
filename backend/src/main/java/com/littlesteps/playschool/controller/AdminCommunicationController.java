package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Communication;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.entity.ParentStudentMap;
import com.littlesteps.playschool.service.AdminCommunicationService;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.ClassesRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.ParentStudentMapRepository;
import com.littlesteps.playschool.repository.ParentRepository;
import com.littlesteps.playschool.dto.ParentStudentDropdownDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin/communications")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class AdminCommunicationController {

    @Autowired
    private AdminCommunicationService adminCommunicationService;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ParentStudentMapRepository parentStudentMapRepository;

    @PostMapping("/direct")
    public ResponseEntity<Communication> sendDirectMessage(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(adminCommunicationService.sendDirectMessage(email, payload));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Communication> sendBroadcast(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(adminCommunicationService.sendBroadcast(email, payload));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Communication>> getHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(adminCommunicationService.getHistory(email));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<Communication>> getInbox(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(adminCommunicationService.getInbox(email));
    }

    // Helper endpoints for the frontend dropdowns

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getTeachers(Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(teacherRepository.findBySchoolId(admin.getSchoolId()));
    }

    @GetMapping("/classes")
    public ResponseEntity<List<Classes>> getClasses(Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(classesRepository.findBySchoolId(admin.getSchoolId()));
    }

    @GetMapping("/parents/{classId}")
    public ResponseEntity<List<ParentStudentDropdownDTO>> getParentsByClass(
            @PathVariable String classId,
            Authentication authentication) {
        // Just verify admin exists for security
        userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        List<Student> students = studentRepository.findByClassId(classId);
        List<ParentStudentDropdownDTO> dropdownData = new ArrayList<>();

        for (Student student : students) {
            List<ParentStudentMap> mappings = parentStudentMapRepository.findByStudentId(student.getId());
            for (ParentStudentMap map : mappings) {
                parentRepository.findById(map.getParentId()).ifPresent(parent -> {
                    if (parent.getUserId() != null) {
                        // verify the user actually exists
                        userRepository.findById(parent.getUserId()).ifPresent(user -> {
                            String label = student.getName() + " (" + parent.getName() + ")";
                            dropdownData.add(new ParentStudentDropdownDTO(user.getId(), student.getId(), label));
                        });
                    }
                });
            }
        }

        return ResponseEntity.ok(dropdownData);
    }
}

package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.dto.ParentAssignmentDTO;
import com.littlesteps.playschool.service.ParentService;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('PARENT')")
public class ParentAccessController {

        @Autowired
        private ParentService parentService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ParentRepository parentRepository;

        @GetMapping("/students")
        public ResponseEntity<List<StudentDTO>> getMyStudents(Authentication authentication) {
                return getMyChildren(authentication);
        }

        @GetMapping("/me")
        public ResponseEntity<?> getMyProfile(Authentication authentication) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return parentRepository.findByUserId(user.getId())
                                .map(parent -> {
                                        // We can reuse the service converter logic if exposed, or simple response.
                                        // Since service methods are school-scoped, we can use them if we know ID.
                                        return ResponseEntity.ok(parentService.getParentById(parent.getId(),
                                                        parent.getSchoolId()));
                                })
                                .orElseThrow(() -> new RuntimeException("Parent profile not confirmed for this user"));
        }

        @GetMapping("/children")
        public ResponseEntity<List<StudentDTO>> getMyChildren(Authentication authentication) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                return ResponseEntity.ok(parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId()));
        }

        @GetMapping("/children/{studentId}/attendance")
        public ResponseEntity<?> getChildAttendance(
                        @PathVariable String studentId,
                        @RequestParam(required = false) String startDate,
                        @RequestParam(required = false) String endDate,
                        Authentication authentication) {

                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                // Verify that the student belongs to this parent
                List<StudentDTO> children = parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId());
                boolean isParentOfStudent = children.stream().anyMatch(child -> child.getId().equals(studentId));

                if (!isParentOfStudent) {
                        throw new RuntimeException("Unauthorized: You are not the parent of this student");
                }

                // Fetch attendance from attendance service
                return ResponseEntity.ok(parentService.getStudentAttendance(studentId, startDate, endDate));
        }

        @GetMapping("/messages")
        public ResponseEntity<?> getMyMessages(Authentication authentication) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                // Get all children of this parent
                List<StudentDTO> children = parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId());

                // Fetch messages for this parent
                return ResponseEntity.ok(parentService.getParentMessages(parent.getId(), children));
        }

        @GetMapping("/messages/{studentId}")
        public ResponseEntity<List<com.littlesteps.playschool.entity.Message>> getChildMessages(
                        @PathVariable String studentId,
                        Authentication authentication) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                // Verify that the student belongs to this parent
                List<StudentDTO> children = parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId());
                StudentDTO targetStudent = children.stream()
                                .filter(child -> child.getId().equals(studentId))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "Unauthorized: You are not the parent of this student"));

                return ResponseEntity.ok(parentService.getChildMessages(studentId, targetStudent.getClassId()));
        }

        @GetMapping("/assignments/{studentId}")
        public ResponseEntity<List<com.littlesteps.playschool.dto.ParentAssignmentDTO>> getChildAssignments(
                        @PathVariable String studentId,
                        Authentication authentication) {

                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                // Verify that the student belongs to this parent
                List<StudentDTO> children = parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId());
                boolean isParentOfStudent = children.stream().anyMatch(child -> child.getId().equals(studentId));

                if (!isParentOfStudent) {
                        throw new RuntimeException("Unauthorized: You are not the parent of this student");
                }

                // Fetch assignments for the student's class
                return ResponseEntity.ok(parentService.getStudentAssignments(studentId));
        }

        @GetMapping("/study-materials/{studentId}")
        public ResponseEntity<?> getChildStudyMaterials(
                        @PathVariable String studentId,
                        Authentication authentication) {

                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                // Verify that the student belongs to this parent
                List<StudentDTO> children = parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId());
                boolean isParentOfStudent = children.stream().anyMatch(child -> child.getId().equals(studentId));

                if (!isParentOfStudent) {
                        throw new RuntimeException("Unauthorized: You are not the parent of this student");
                }

                // Fetch study materials for the student's class
                return ResponseEntity.ok(parentService.getStudentStudyMaterials(studentId));
        }

        @GetMapping("/academic-info")
        public ResponseEntity<java.util.List<com.littlesteps.playschool.dto.ParentAcademicInfoDTO>> getAcademicInfo(
                        Authentication authentication) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

                return ResponseEntity
                                .ok(parentService.getAcademicInfoForChildren(parent.getId(), parent.getSchoolId()));
        }
}

package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.CourseHandoutDTO;
import com.littlesteps.playschool.dto.CreateCourseHandoutDTO;
import com.littlesteps.playschool.service.CourseHandoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher/course-handouts")
@CrossOrigin(origins = "*")
public class TeacherCourseHandoutController {

    @Autowired
    private CourseHandoutService courseHandoutService;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getHandouts(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<CourseHandoutDTO> handouts = courseHandoutService.getPaginatedHandoutsByTeacher(email, classId, subject,
                pageable);
        return ResponseEntity.ok(handouts);
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createHandout(@RequestBody CreateCourseHandoutDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            CourseHandoutDTO created = courseHandoutService.createHandout(email, dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{handoutId}/topics/{topicIndex}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateTopicCompletion(
            @PathVariable String handoutId,
            @PathVariable int topicIndex,
            @RequestBody Map<String, Boolean> body) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            Boolean completed = body.get("completed");
            if (completed == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing 'completed' field"));
            }
            CourseHandoutDTO updated = courseHandoutService.updateTopicCompletion(email, handoutId, topicIndex,
                    completed);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT endpoint with topicId as per user request
    @PutMapping("/{handoutId}/topics/{topicId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateTopicById(
            @PathVariable String handoutId,
            @PathVariable String topicId,
            @RequestBody Map<String, Boolean> body) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            Boolean completed = body.get("completed");
            if (completed == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing 'completed' field"));
            }
            CourseHandoutDTO updated = courseHandoutService.updateTopicById(email, handoutId, topicId, completed);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

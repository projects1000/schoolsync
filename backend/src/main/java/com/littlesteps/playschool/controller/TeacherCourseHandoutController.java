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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher/course-handouts")
@CrossOrigin(origins = "*")
public class TeacherCourseHandoutController {

    @Autowired
    private CourseHandoutService courseHandoutService;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<CourseHandoutDTO>> getHandouts(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String subject) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        List<CourseHandoutDTO> handouts = courseHandoutService.getHandoutsByTeacher(email, classId, subject);
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

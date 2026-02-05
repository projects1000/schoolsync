package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.CourseHandoutDTO;
import com.littlesteps.playschool.service.ParentCourseHandoutService;
import com.littlesteps.playschool.service.ParentCourseHandoutService.CourseProgressDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin(origins = "*")
public class ParentCourseHandoutController {

    @Autowired
    private ParentCourseHandoutService parentCourseHandoutService;

    /**
     * Get course progress summary for parent dashboard widget
     */
    @GetMapping("/course-progress/{studentId}")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getCourseProgress(@PathVariable String studentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            List<CourseProgressDTO> progress = parentCourseHandoutService.getCourseProgress(email, studentId);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get list of course handouts for a student
     */
    @GetMapping("/course-handouts/{studentId}")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getCourseHandouts(@PathVariable String studentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            List<CourseHandoutDTO> handouts = parentCourseHandoutService.getHandoutsForStudent(email, studentId);
            return ResponseEntity.ok(handouts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get course handout details by ID
     */
    @GetMapping("/course-handouts/details/{handoutId}")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getHandoutDetails(
            @PathVariable String handoutId,
            @RequestParam String studentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            CourseHandoutDTO handout = parentCourseHandoutService.getHandoutDetails(email, handoutId, studentId);
            return ResponseEntity.ok(handout);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Message;
import com.littlesteps.playschool.service.TeacherCommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher/messages")
@CrossOrigin(origins = "*")
public class TeacherCommunicationController {

    @Autowired
    private TeacherCommunicationService teacherCommunicationService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String classId = payload.get("classId");
        String content = payload.get("content");
        String recipientId = payload.get("recipientId");

        return ResponseEntity.ok(teacherCommunicationService.sendMessage(email, classId, content, recipientId));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Message>> getMessagesByClass(@PathVariable String classId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherCommunicationService.getMessagesByClass(email, classId));
    }
}

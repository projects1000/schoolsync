package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicStatsController {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSchools", schoolRepository.count());
        stats.put("totalStudents", studentRepository.count());
        stats.put("uptime", "99.9%"); // Mocked for now, could be dynamic
        return ResponseEntity.ok(stats);
    }
}

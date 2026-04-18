package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.service.DataVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class DataVersionController {

    private final DataVersionService dataVersionService;

    @GetMapping("/data-version")
    public ResponseEntity<Map<String, Object>> getDataVersion() {
        return ResponseEntity.ok(dataVersionService.getSnapshot());
    }
}

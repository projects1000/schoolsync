package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.SchoolSettingsDTO;
import com.littlesteps.playschool.service.SchoolSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class SchoolSettingsController {

    @Autowired
    private SchoolSettingsService schoolSettingsService;

    @GetMapping
    public ResponseEntity<SchoolSettingsDTO> getSchoolSettings() {
        try {
            SchoolSettingsDTO settings = schoolSettingsService.getSchoolSettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping
    public ResponseEntity<SchoolSettingsDTO> updateSchoolSettings(@RequestBody SchoolSettingsDTO settingsDTO) {
        try {
            SchoolSettingsDTO updatedSettings = schoolSettingsService.saveSchoolSettings(settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/school-info")
    public ResponseEntity<SchoolSettingsDTO> updateSchoolInfo(@RequestBody SchoolSettingsDTO schoolInfoDTO) {
        try {
            SchoolSettingsDTO updatedSettings = schoolSettingsService.updateSchoolInfo(schoolInfoDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/notifications")
    public ResponseEntity<SchoolSettingsDTO> updateNotificationSettings(@RequestBody SchoolSettingsDTO notificationDTO) {
        try {
            SchoolSettingsDTO updatedSettings = schoolSettingsService.updateNotificationSettings(notificationDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/appearance")
    public ResponseEntity<SchoolSettingsDTO> updateAppearanceSettings(@RequestBody SchoolSettingsDTO appearanceDTO) {
        try {
            SchoolSettingsDTO updatedSettings = schoolSettingsService.updateAppearanceSettings(appearanceDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/general")
    public ResponseEntity<SchoolSettingsDTO> updateGeneralSettings(@RequestBody SchoolSettingsDTO generalDTO) {
        try {
            SchoolSettingsDTO updatedSettings = schoolSettingsService.updateGeneralSettings(generalDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
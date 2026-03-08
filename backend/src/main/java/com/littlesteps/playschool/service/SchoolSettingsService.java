package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.SchoolSettingsDTO;
import com.littlesteps.playschool.entity.SchoolSettings;
import com.littlesteps.playschool.repository.SchoolSettingsRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
@CacheConfig(cacheNames = "schoolSettings")
public class SchoolSettingsService {

    @Autowired
    private SchoolSettingsRepository schoolSettingsRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    @Cacheable(key = "'default'")
    public SchoolSettingsDTO getSchoolSettings() {
        SchoolSettings settings = schoolSettingsRepository.findFirstByOrderByIdAsc()
                .orElse(getDefaultSettings());
        
        return modelMapper.map(settings, SchoolSettingsDTO.class);
    }

    @CacheEvict(allEntries = true)
    public SchoolSettingsDTO saveSchoolSettings(SchoolSettingsDTO settingsDTO) {
        SchoolSettings existingSettings = schoolSettingsRepository.findFirstByOrderByIdAsc()
                .orElse(new SchoolSettings());

        // Map DTO to entity, preserving existing ID if present
        modelMapper.map(settingsDTO, existingSettings);
        
        // Save the settings
        SchoolSettings savedSettings = schoolSettingsRepository.save(existingSettings);
        
        return modelMapper.map(savedSettings, SchoolSettingsDTO.class);
    }

    @CacheEvict(allEntries = true)
    public SchoolSettingsDTO updateSchoolInfo(SchoolSettingsDTO schoolInfoDTO) {
        SchoolSettings existingSettings = schoolSettingsRepository.findFirstByOrderByIdAsc()
                .orElse(new SchoolSettings());

        // Update only school information fields
        existingSettings.setSchoolName(schoolInfoDTO.getSchoolName());
        existingSettings.setSchoolAddress(schoolInfoDTO.getSchoolAddress());
        existingSettings.setSchoolPhone(schoolInfoDTO.getSchoolPhone());
        existingSettings.setSchoolEmail(schoolInfoDTO.getSchoolEmail());
        existingSettings.setSchoolWebsite(schoolInfoDTO.getSchoolWebsite());

        SchoolSettings savedSettings = schoolSettingsRepository.save(existingSettings);
        return modelMapper.map(savedSettings, SchoolSettingsDTO.class);
    }

    @CacheEvict(allEntries = true)
    public SchoolSettingsDTO updateNotificationSettings(SchoolSettingsDTO notificationDTO) {
        SchoolSettings existingSettings = schoolSettingsRepository.findFirstByOrderByIdAsc()
                .orElse(new SchoolSettings());

        // Update only notification settings
        existingSettings.setEmailNotifications(notificationDTO.getEmailNotifications());
        existingSettings.setSmsNotifications(notificationDTO.getSmsNotifications());
        existingSettings.setPushNotifications(notificationDTO.getPushNotifications());

        SchoolSettings savedSettings = schoolSettingsRepository.save(existingSettings);
        return modelMapper.map(savedSettings, SchoolSettingsDTO.class);
    }

    @CacheEvict(allEntries = true)
    public SchoolSettingsDTO updateAppearanceSettings(SchoolSettingsDTO appearanceDTO) {
        SchoolSettings existingSettings = schoolSettingsRepository.findFirstByOrderByIdAsc()
                .orElse(new SchoolSettings());

        // Update only appearance settings
        existingSettings.setTheme(appearanceDTO.getTheme());

        SchoolSettings savedSettings = schoolSettingsRepository.save(existingSettings);
        return modelMapper.map(savedSettings, SchoolSettingsDTO.class);
    }

    @CacheEvict(allEntries = true)
    public SchoolSettingsDTO updateGeneralSettings(SchoolSettingsDTO generalDTO) {
        SchoolSettings existingSettings = schoolSettingsRepository.findFirstByOrderByIdAsc()
                .orElse(new SchoolSettings());

        // Update only general settings
        existingSettings.setLanguage(generalDTO.getLanguage());
        existingSettings.setCurrency(generalDTO.getCurrency());
        existingSettings.setTimezone(generalDTO.getTimezone());
        existingSettings.setAcademicYear(generalDTO.getAcademicYear());

        SchoolSettings savedSettings = schoolSettingsRepository.save(existingSettings);
        return modelMapper.map(savedSettings, SchoolSettingsDTO.class);
    }

    private SchoolSettings getDefaultSettings() {
        return new SchoolSettings(
            "Little Steps Playschool",
            "123 Education Street, Learning City, LC 12345",
            "+1 234-567-8900"
        );
    }
}
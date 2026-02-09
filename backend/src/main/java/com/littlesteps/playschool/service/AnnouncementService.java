package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.AnnouncementDTO;
import com.littlesteps.playschool.entity.Announcement;
import com.littlesteps.playschool.repository.AnnouncementRepository;
import com.littlesteps.playschool.security.SchoolContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public List<AnnouncementDTO> getAllAnnouncements() {
        String schoolId = SchoolContext.getSchoolId();
        List<Announcement> announcements;
        if (schoolId == null) {
            announcements = announcementRepository.findAll(org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        } else {
            announcements = announcementRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
        }
        return announcements.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto) {
        String schoolId = SchoolContext.getSchoolId();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = auth != null ? auth.getName() : "System";

        Announcement announcement = new Announcement();
        announcement.setSchoolId(schoolId);
        announcement.setTitle(dto.getTitle());
        announcement.setMessage(dto.getMessage());
        announcement.setAudience(Announcement.Audience.valueOf(dto.getAudience()));
        announcement.setTargetId(dto.getTargetId());
        announcement.setTargetName(dto.getTargetName());
        announcement.setCreatedBy(createdBy);
        announcement.setCreatedAt(LocalDateTime.now());

        Announcement saved = announcementRepository.save(announcement);
        return convertToDTO(saved);
    }

    public void deleteAnnouncement(String id) {
        announcementRepository.deleteById(id);
    }

    private AnnouncementDTO convertToDTO(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setMessage(announcement.getMessage());
        dto.setAudience(announcement.getAudience() != null ? announcement.getAudience().name() : "SCHOOL");
        dto.setTargetId(announcement.getTargetId());
        dto.setTargetName(announcement.getTargetName());
        dto.setCreatedBy(announcement.getCreatedBy());
        dto.setCreatedAt(announcement.getCreatedAt());
        return dto;
    }
}

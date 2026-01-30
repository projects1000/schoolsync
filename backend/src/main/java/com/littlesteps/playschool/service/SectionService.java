package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Section;
import com.littlesteps.playschool.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    // @Autowired
    // private AuditService auditService;

    public List<Section> getSectionsByClass(String classId) {
        System.out.println("Processing getSectionsByClass for classId: " + classId);
        if (sectionRepository == null) {
            System.out.println("ERROR: sectionRepository is null!");
            throw new RuntimeException("SectionRepository is not injected");
        }
        List<Section> sections = sectionRepository.findByClassId(classId);
        System.out.println("Found " + sections.size() + " sections");
        return sections;
    }

    @Transactional
    public Section createSection(Section section) {
        if (sectionRepository.existsByClassIdAndName(section.getClassId(), section.getName())) {
            throw new IllegalArgumentException(
                    "Section with name " + section.getName() + " already exists for this class.");
        }

        section.setCreatedAt(LocalDateTime.now());
        // Populate schoolId if not passed? Controller likely handles extracting it from
        // context/user

        Section savedSection = sectionRepository.save(section);

        // Audit log (optional but good practice)
        // auditService.logAction(...)

        return savedSection;
    }

    @Transactional
    public void deleteSection(String id) {
        // Potentially check if students exist in this section first
        sectionRepository.deleteById(id);
    }
}

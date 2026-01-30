package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.AcademicYear;
import com.littlesteps.playschool.entity.ClassTemplate;
import com.littlesteps.playschool.repository.AcademicYearRepository;
import com.littlesteps.playschool.repository.ClassTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AcademicMasterService {

    @Autowired
    private ClassTemplateRepository classTemplateRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    // --- Class Template Operations ---

    public List<ClassTemplate> getAllClassTemplates() {
        return classTemplateRepository.findAll();
    }

    @Transactional
    public ClassTemplate createClassTemplate(ClassTemplate template) {
        if (classTemplateRepository.findByName(template.getName()).isPresent()) {
            throw new IllegalArgumentException("Class Template with name " + template.getName() + " already exists.");
        }
        return classTemplateRepository.save(template);
    }

    @Transactional
    public ClassTemplate updateClassTemplate(String id, ClassTemplate details) {
        ClassTemplate template = classTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class Template not found"));
        template.setName(details.getName());
        template.setMinAge(details.getMinAge());
        template.setMaxAge(details.getMaxAge());
        return classTemplateRepository.save(template);
    }

    @Transactional
    public void deleteClassTemplate(String id) {
        classTemplateRepository.deleteById(id);
    }

    // --- Academic Year Operations ---

    public List<AcademicYear> getAllAcademicYears() {
        return academicYearRepository.findAll();
    }

    public Optional<AcademicYear> getCurrentAcademicYear() {
        return academicYearRepository.findByCurrentTrue();
    }

    @Transactional
    public AcademicYear createAcademicYear(AcademicYear year) {
        if (year.isCurrent()) {
            unsetCurrentAcademicYear();
        }
        return academicYearRepository.save(year);
    }

    @Transactional
    public AcademicYear updateAcademicYear(String id, AcademicYear details) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Academic Year not found"));

        if (details.isCurrent() && !year.isCurrent()) {
            unsetCurrentAcademicYear();
        }

        year.setName(details.getName());
        year.setStartDate(details.getStartDate());
        year.setEndDate(details.getEndDate());
        year.setCurrent(details.isCurrent());

        return academicYearRepository.save(year);
    }

    private void unsetCurrentAcademicYear() {
        Optional<AcademicYear> current = academicYearRepository.findByCurrentTrue();
        current.ifPresent(c -> {
            c.setCurrent(false);
            academicYearRepository.save(c);
        });
    }
}

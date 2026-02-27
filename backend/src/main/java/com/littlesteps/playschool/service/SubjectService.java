package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Subject;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.ClassSubject;
import com.littlesteps.playschool.repository.SubjectRepository;
import com.littlesteps.playschool.repository.ClassesRepository;
import com.littlesteps.playschool.repository.ClassSubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private ClassSubjectRepository classSubjectRepository;

    public List<Subject> getAllSubjects(String schoolId) {
        return subjectRepository.findBySchoolId(schoolId);
    }

    @Transactional
    public Subject createSubject(String schoolId, Subject subject) {
        if (subjectRepository.existsBySchoolIdAndName(schoolId, subject.getName())) {
            throw new RuntimeException("Subject with this name already exists in the school");
        }
        subject.setSchoolId(schoolId);

        if (subject.getCode() == null || subject.getCode().trim().isEmpty()) {
            String prefix = subject.getName().length() >= 3 ? subject.getName().substring(0, 3).toUpperCase()
                    : subject.getName().toUpperCase();
            String randomCode = java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            subject.setCode(prefix + "-" + randomCode);
        }

        Subject savedSubject = subjectRepository.save(subject);

        // Auto-assign class-specific subjects to all sections of the target grade
        if (savedSubject.getType() == Subject.SubjectType.CLASS_SPECIFIC && savedSubject.getTargetGrade() != null) {
            List<Classes> targetClasses = classesRepository.findBySchoolIdAndGradeOrName(schoolId,
                    savedSubject.getTargetGrade());
            for (Classes cls : targetClasses) {
                if (!classSubjectRepository.existsByClassIdAndSubjectId(cls.getId(), savedSubject.getId())) {
                    ClassSubject classSubject = new ClassSubject(schoolId, cls.getId(), savedSubject.getId(), null);
                    classSubjectRepository.save(classSubject);
                }
            }
        }

        return savedSubject;
    }

    @Transactional
    public Subject updateSubject(String id, String schoolId, Subject updates) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!subject.getSchoolId().equals(schoolId)) {
            throw new RuntimeException("Unauthorized access to subject");
        }

        if (updates.getName() != null && !updates.getName().equals(subject.getName())) {
            if (subjectRepository.existsBySchoolIdAndName(schoolId, updates.getName())) {
                throw new RuntimeException("Subject with this name already exists");
            }
            subject.setName(updates.getName());
        }

        if (updates.getCode() != null) {
            subject.setCode(updates.getCode());
        }

        if (updates.getDescription() != null) {
            subject.setDescription(updates.getDescription());
        }

        if (updates.getType() != null) {
            subject.setType(updates.getType());
        }

        // Null is allowed for targetGrade (meaning no target grade)
        subject.setTargetGrade(updates.getTargetGrade());

        if (updates.getExcludedGrades() != null) {
            subject.setExcludedGrades(updates.getExcludedGrades());
        }

        // Handle boolean active
        subject.setActive(updates.isActive());

        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(String id, String schoolId) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!subject.getSchoolId().equals(schoolId)) {
            throw new RuntimeException("Unauthorized access to subject");
        }

        // Check if assigned to any class
        // For now, since Classes entity doesn't have subjects yet, we skip this check.
        // Once Classes table has subject links, we MUST uncomment and implement this.
        /*
         * if (classesRepository.existsBySubjectId(id)) {
         * throw new
         * RuntimeException("Cannot delete subject as it is assigned to one or more classes"
         * );
         * }
         */

        subjectRepository.delete(subject);
    }
}

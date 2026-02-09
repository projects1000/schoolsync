package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Subject;
import com.littlesteps.playschool.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    // TODO: Inject ClassesRepository when we implement assignment checks
    // @Autowired
    // private ClassesRepository classesRepository;

    public List<Subject> getAllSubjects(String schoolId) {
        return subjectRepository.findBySchoolId(schoolId);
    }

    @Transactional
    public Subject createSubject(String schoolId, Subject subject) {
        if (subjectRepository.existsBySchoolIdAndName(schoolId, subject.getName())) {
            throw new RuntimeException("Subject with this name already exists in the school");
        }
        subject.setSchoolId(schoolId);
        return subjectRepository.save(subject);
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

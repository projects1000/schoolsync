package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.ClassSubjectDTO;
import com.littlesteps.playschool.entity.ClassSubject;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.Subject;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.repository.ClassSubjectRepository;
import com.littlesteps.playschool.repository.ClassesRepository;
import com.littlesteps.playschool.repository.SubjectRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClassSubjectService {

    @Autowired
    private ClassSubjectRepository classSubjectRepository;

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AuditService auditService;

    public List<ClassSubjectDTO> getSubjectsForClass(String classId, String schoolId) {
        Classes classes = classesRepository.findById(classId != null ? classId : "")
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        if (!classes.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Class does not belong to this school");
        }

        List<ClassSubject> assignments = classSubjectRepository.findByClassId(classId);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ClassSubjectDTO convertToDTO(ClassSubject entity) {
        ClassSubjectDTO dto = new ClassSubjectDTO();
        dto.setId(entity.getId());
        dto.setSchoolId(entity.getSchoolId());
        dto.setClassId(entity.getClassId());
        String subjectId = entity.getSubjectId();
        dto.setSubjectId(subjectId);
        dto.setTeacherId(entity.getTeacherId());
        dto.setCreatedAt(entity.getCreatedAt());

        if (subjectId != null) {
            subjectRepository.findById(subjectId).ifPresent(s -> {
                dto.setSubjectName(s.getName());
                dto.setSubjectCode(s.getCode());
            });
        }

        if (entity.getTeacherId() != null && !entity.getTeacherId().isEmpty()) {
            teacherRepository.findById(entity.getTeacherId()).ifPresent(t -> {
                dto.setTeacherName(t.getName());
            });
        }

        return dto;
    }

    @Transactional
    public ClassSubject assignSubjectToClass(String classId, String subjectId, String teacherId, String schoolId,
            String createdBy) {
        // Validation
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (!classes.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Class does not belong to this school");
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        if (!subject.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Subject does not belong to this school");
        }

        if (classSubjectRepository.existsByClassIdAndSubjectId(classId, subjectId)) {
            throw new IllegalArgumentException("Subject is already assigned to this class");
        }

        if (teacherId != null && !teacherId.isEmpty()) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            if (!teacher.getSchoolId().equals(schoolId)) {
                throw new IllegalArgumentException("Teacher does not belong to this school");
            }
        }

        ClassSubject classSubject = new ClassSubject(schoolId, classId, subjectId, teacherId);
        ClassSubject saved = classSubjectRepository.save(classSubject);

        auditService.logAction(createdBy != null ? createdBy : "SYSTEM", "ASSIGN_SUBJECT", "CLASS_SUBJECT", saved.getId(), null,
                "Assigned subject " + (subject.getName() != null ? subject.getName() : subjectId) + " to class " + (classes.getName() != null ? classes.getName() : classId));

        return saved;
    }

    @Transactional
    public List<ClassSubject> assignSubjectsToClass(String classId, List<String> subjectIds, String schoolId,
            String createdBy) {
        Classes classes = classesRepository.findById(classId != null ? classId : "")
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (!classes.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Class does not belong to this school");
        }

        List<ClassSubject> assigned = new java.util.ArrayList<>();
        for (String subjectId : subjectIds) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));

            if (!subject.getSchoolId().equals(schoolId)) {
                throw new IllegalArgumentException("Subject does not belong to this school: " + subject.getName());
            }

            if (!classSubjectRepository.existsByClassIdAndSubjectId(classId, subjectId)) {
                ClassSubject classSubject = new ClassSubject(schoolId, classId, subjectId, null);
                assigned.add(classSubjectRepository.save(classSubject));
            }
        }

        auditService.logAction(createdBy != null ? createdBy : "SYSTEM", "BULK_ASSIGN_SUBJECTS", "CLASS_SUBJECT", classId != null ? classId : "NEW", null,
                "Assigned " + assigned.size() + " subjects to class " + (classes.getName() != null ? classes.getName() : classId));

        return assigned;
    }

    @Transactional
    public ClassSubject updateSubjectTeacher(String classSubjectId, String teacherId, String schoolId,
            String updatedBy) {
        ClassSubject classSubject = classSubjectRepository.findById(classSubjectId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if (!classSubject.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Assignment does not belong to this school");
        }

        if (teacherId != null && !teacherId.isEmpty()) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            if (!teacher.getSchoolId().equals(schoolId)) {
                throw new IllegalArgumentException("Teacher does not belong to this school");
            }
        }

        classSubject.setTeacherId(teacherId); // Can be null to remove teacher
        ClassSubject updated = classSubjectRepository.save(classSubject);

        auditService.logAction(updatedBy != null ? updatedBy : "SYSTEM", "UPDATE_SUBJECT_TEACHER", "CLASS_SUBJECT", updated.getId(), null,
                "Updated teacher for class subject assignment");

        return updated;
    }

    @Transactional
    public ClassSubject assignTeacherToSubject(String classId, String subjectId, String teacherId, String schoolId,
            String updatedBy) {
        // Validate dependencies
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (!classes.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Class does not belong to this school");
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        if (!subject.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Subject does not belong to this school");
        }

        if (teacherId != null && !teacherId.isEmpty()) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            if (!teacher.getSchoolId().equals(schoolId)) {
                throw new IllegalArgumentException("Teacher does not belong to this school");
            }
        }

        Optional<ClassSubject> existing = classSubjectRepository.findByClassIdAndSubjectId(classId, subjectId);
        ClassSubject classSubject;

        if (existing.isPresent()) {
            classSubject = existing.get();
            classSubject.setTeacherId(teacherId);
            auditService.logAction(updatedBy != null ? updatedBy : "SYSTEM", "UPDATE_SUBJECT_TEACHER", "CLASS_SUBJECT", classSubject.getId(), null,
                    "Updated teacher for class " + (classes.getName() != null ? classes.getName() : classId) + " subject " + (subject.getName() != null ? subject.getName() : subjectId));
        } else {
            classSubject = new ClassSubject(schoolId, classId, subjectId, teacherId);
            auditService.logAction(updatedBy != null ? updatedBy : "SYSTEM", "ASSIGN_SUBJECT_TEACHER", "CLASS_SUBJECT", null, null,
                    "Created assignment for class " + (classes.getName() != null ? classes.getName() : classId) + " subject " + (subject.getName() != null ? subject.getName() : subjectId));
        }

        return classSubjectRepository.save(classSubject);
    }

    @Transactional
    public void removeSubjectFromClass(String classSubjectId, String schoolId, String deletedBy) {
        ClassSubject classSubject = classSubjectRepository.findById(classSubjectId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if (!classSubject.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Assignment does not belong to this school");
        }

        classSubjectRepository.delete(classSubject);
        auditService.logAction(deletedBy != null ? deletedBy : "SYSTEM", "REMOVE_SUBJECT", "CLASS_SUBJECT", classSubjectId, null,
                "Removed subject from class");
    }
}

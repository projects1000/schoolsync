package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.ClassDTO;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.repository.ClassesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@CacheConfig(cacheNames = "classes")
public class ClassService {

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private com.littlesteps.playschool.repository.TeacherRepository teacherRepository;

    @Autowired
    private StudentService studentService;

    @Cacheable(key = "#schoolId")
    public List<Classes> getClassesBySchoolId(String schoolId) {
        return classesRepository.findBySchoolIdAndStatusNot(schoolId, Classes.Status.DELETED);
    }

    public Page<Classes> getClassesBySchoolId(String schoolId, Pageable pageable) {
        return classesRepository.findBySchoolIdAndStatusNot(schoolId != null ? schoolId : "", Classes.Status.DELETED, pageable);
    }

    @Cacheable(key = "#id")
    public Optional<Classes> getClassById(String id) {
        return classesRepository.findById(id != null ? id : "");
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public Classes createClass(ClassDTO classDTO, String schoolId, String createdBy) {
        if (classDTO.getCapacity() != null && classDTO.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than zero");
        }

        Classes newClass = new Classes();
        newClass.setGrade(classDTO.getGrade());
        newClass.setSection(classDTO.getSection());

        // Generate name automatically: "Grade - Section"
        String className = classDTO.getGrade();
        if (classDTO.getSection() != null && !classDTO.getSection().isEmpty()) {
            className += " - " + classDTO.getSection();
        }
        newClass.setName(className);

        newClass.setCapacity(classDTO.getCapacity());
        newClass.setRoom(classDTO.getRoom());
        newClass.setSchoolId(schoolId);
        newClass.setLocked(false);
        newClass.setStatus(Classes.Status.ACTIVE);
        newClass.setCreatedAt(LocalDateTime.now());
        newClass.setUpdatedAt(LocalDateTime.now());

        // Handle Class Teacher Assignment
        if (classDTO.getClassTeacherId() != null && !classDTO.getClassTeacherId().isEmpty()) {
            assignClassTeacher(newClass, classDTO.getClassTeacherId(), schoolId);
        }

        Classes savedClass = classesRepository.save(newClass);
        auditService.logAction(createdBy != null ? createdBy : "SYSTEM", "CREATE_CLASS", "CLASS", savedClass.getId() != null ? savedClass.getId() : "NEW", classDTO,
                "Created class: " + (savedClass.getName() != null ? savedClass.getName() : "NEW"));
        return savedClass;
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public Classes updateClass(String id, ClassDTO classDTO, String updatedBy) {
        Classes existingClass = classesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        if (Boolean.TRUE.equals(existingClass.getLocked())) {
            throw new IllegalStateException("Cannot edit a locked class");
        }

        if (classDTO.getGrade() != null)
            existingClass.setGrade(classDTO.getGrade());
        if (classDTO.getSection() != null)
            existingClass.setSection(classDTO.getSection());

        // Regenerate name if grade or section changed
        if (classDTO.getGrade() != null || classDTO.getSection() != null) {
            String className = existingClass.getGrade();
            if (existingClass.getSection() != null && !existingClass.getSection().isEmpty()) {
                className += " - " + existingClass.getSection();
            }
            existingClass.setName(className);
        }

        if (classDTO.getCapacity() != null) {
            if (classDTO.getCapacity() <= 0)
                throw new IllegalArgumentException("Capacity must be greater than zero");
            existingClass.setCapacity(classDTO.getCapacity());
        }
        if (classDTO.getRoom() != null)
            existingClass.setRoom(classDTO.getRoom());
        if (classDTO.getLocked() != null)
            existingClass.setLocked(classDTO.getLocked());

        // Handle Class Teacher Assignment
        if (classDTO.getClassTeacherId() != null) {
            if (classDTO.getClassTeacherId().isEmpty()) {
                // Remove class teacher
                existingClass.setClassTeacherId(null);
            } else {
                // Assign new class teacher
                assignClassTeacher(existingClass, classDTO.getClassTeacherId(), existingClass.getSchoolId());
            }
        }

        existingClass.setUpdatedAt(LocalDateTime.now());

        Classes updatedClass = classesRepository.save(existingClass);
        auditService.logAction(updatedBy != null ? updatedBy : "SYSTEM", "UPDATE_CLASS", "CLASS", id != null ? id : "", classDTO,
                "Updated class: " + (updatedClass.getName() != null ? updatedClass.getName() : id));
        return updatedClass;
    }

    private void assignClassTeacher(Classes classesEntity, String teacherId, String schoolId) {
        com.littlesteps.playschool.entity.Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found with ID: " + teacherId));

        // Validate teacher belongs to the same school
        if (!teacher.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Teacher does not belong to this school");
        }

        // Check if teacher is already a CLASS TEACHER of another class
        List<Classes> existingClasses = classesRepository.findByClassTeacherId(teacherId);
        for (Classes existing : existingClasses) {
            // If it's a different class, throw error
            if (!existing.getId().equals(classesEntity.getId())) {
                throw new IllegalArgumentException(
                        "Teacher " + teacher.getName() + " is already the Class Teacher of " + existing.getName());
            }
        }

        classesEntity.setClassTeacherId(teacherId != null ? teacherId : "");
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public Classes assignClassTeacherToClass(String classId, String teacherId, String schoolId, String updatedBy) {
        Classes classesEntity = classesRepository.findById(classId != null ? classId : "")
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        if (!classesEntity.getSchoolId().equals(schoolId)) {
            throw new IllegalArgumentException("Class does not belong to this school");
        }

        if (Boolean.TRUE.equals(classesEntity.getLocked())) {
            throw new IllegalStateException("Cannot edit a locked class");
        }

        if (teacherId == null || teacherId.trim().isEmpty()) {
            classesEntity.setClassTeacherId(null);
        } else {
            assignClassTeacher(classesEntity, teacherId, schoolId);
        }

        classesEntity.setUpdatedAt(LocalDateTime.now());
        Classes updatedClass = classesRepository.save(classesEntity);

        auditService.logAction(updatedBy != null ? updatedBy : "SYSTEM", "ASSIGN_CLASS_TEACHER", "CLASS", classId != null ? classId : "", null,
                "Assigned teacher " + (teacherId != null ? teacherId : "NONE") + " to class " + (classesEntity.getName() != null ? classesEntity.getName() : classId));

        return updatedClass;
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public void deleteClass(String id, String deletedBy) {
        Classes existingClass = classesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (Boolean.TRUE.equals(existingClass.getLocked())) {
            throw new IllegalStateException("Cannot delete a locked class");
        }

        // Soft delete class
        existingClass.setStatus(Classes.Status.DELETED);

        // Unassign teacher
        existingClass.setClassTeacherId(null);

        classesRepository.save(existingClass);

        // Unassign students from this class
        studentService.unassignStudentsFromClass(id);

        auditService.logAction(deletedBy, "DELETE_CLASS", "CLASS", id, null,
                "Deleted class: " + existingClass.getName());
    }

    @Cacheable(key = "{#schoolId, 'deleted'}")
    public List<Classes> getDeletedClassesBySchoolId(String schoolId) {
        return classesRepository.findBySchoolIdAndStatus(schoolId != null ? schoolId : "", Classes.Status.DELETED);
    }

    public Page<Classes> getDeletedClassesBySchoolId(String schoolId, Pageable pageable) {
        return classesRepository.findBySchoolIdAndStatus(schoolId, Classes.Status.DELETED, pageable);
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public Classes restoreClass(String id, String restoredBy) {
        Classes existingClass = classesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        if (existingClass.getStatus() != Classes.Status.DELETED) {
            throw new IllegalStateException("Class is not deleted");
        }

        // Restore class as INACTIVE (admin can activate it later if needed)
        existingClass.setStatus(Classes.Status.INACTIVE);

        Classes savedClass = classesRepository.save(existingClass);

        auditService.logAction(restoredBy, "RESTORE_CLASS", "CLASS", id, null,
                "Restored class: " + existingClass.getName());

        return savedClass;
    }
}

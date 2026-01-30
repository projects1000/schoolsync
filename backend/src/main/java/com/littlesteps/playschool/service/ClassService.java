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

@Service
public class ClassService {

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private AuditService auditService;

    public List<Classes> getClassesBySchoolId(String schoolId) {
        return classesRepository.findBySchoolId(schoolId);
    }

    public Optional<Classes> getClassById(String id) {
        return classesRepository.findById(id);
    }

    @Transactional
    public Classes createClass(ClassDTO classDTO, String schoolId, String createdBy) {
        if (classDTO.getCapacity() != null && classDTO.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than zero");
        }

        Classes newClass = new Classes();
        newClass.setName(classDTO.getName());
        newClass.setCapacity(classDTO.getCapacity());
        newClass.setRoom(classDTO.getRoom());
        newClass.setSchoolId(schoolId);
        newClass.setLocked(false);
        newClass.setStatus(Classes.Status.ACTIVE);
        newClass.setCreatedAt(LocalDateTime.now());
        newClass.setUpdatedAt(LocalDateTime.now());

        // For Backward Compatibility or if Grade/Section is still needed by other parts
        // but not UI
        // We can just set them to name or empty
        newClass.setGrade(classDTO.getName());
        newClass.setSection("");

        Classes savedClass = classesRepository.save(newClass);
        auditService.logAction(createdBy, "CREATE_CLASS", "CLASS", savedClass.getId(), classDTO,
                "Created class: " + savedClass.getName());
        return savedClass;
    }

    @Transactional
    public Classes updateClass(String id, ClassDTO classDTO, String updatedBy) {
        Classes existingClass = classesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        if (Boolean.TRUE.equals(existingClass.getLocked())) {
            throw new IllegalStateException("Cannot edit a locked class");
        }

        if (classDTO.getName() != null)
            existingClass.setName(classDTO.getName());
        if (classDTO.getCapacity() != null) {
            if (classDTO.getCapacity() <= 0)
                throw new IllegalArgumentException("Capacity must be greater than zero");
            existingClass.setCapacity(classDTO.getCapacity());
        }
        if (classDTO.getRoom() != null)
            existingClass.setRoom(classDTO.getRoom());
        if (classDTO.getLocked() != null)
            existingClass.setLocked(classDTO.getLocked());

        existingClass.setUpdatedAt(LocalDateTime.now());

        Classes updatedClass = classesRepository.save(existingClass);
        auditService.logAction(updatedBy, "UPDATE_CLASS", "CLASS", id, classDTO,
                "Updated class: " + updatedClass.getName());
        return updatedClass;
    }

    @Transactional
    public void deleteClass(String id, String deletedBy) {
        Classes existingClass = classesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (Boolean.TRUE.equals(existingClass.getLocked())) {
            throw new IllegalStateException("Cannot delete a locked class");
        }
        // Ideally check for dependencies (students/teachers) before delete
        classesRepository.deleteById(id);
        auditService.logAction(deletedBy, "DELETE_CLASS", "CLASS", id, null,
                "Deleted class: " + existingClass.getName());
    }
}

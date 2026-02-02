package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.ParentStudentMap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentStudentMapRepository extends MongoRepository<ParentStudentMap, String> {

    // Find all students mapped to a parent
    List<ParentStudentMap> findByParentId(String parentId);

    // Find all parents mapped to a student
    List<ParentStudentMap> findByStudentId(String studentId);

    // Find all mappings in a school
    List<ParentStudentMap> findBySchoolId(String schoolId);

    // Find specific parent-student mapping
    Optional<ParentStudentMap> findByParentIdAndStudentId(String parentId, String studentId);

    // Check if mapping exists
    boolean existsByParentIdAndStudentId(String parentId, String studentId);

    // Find mappings for parent within a school
    List<ParentStudentMap> findByParentIdAndSchoolId(String parentId, String schoolId);

    // Find mappings for student within a school
    List<ParentStudentMap> findByStudentIdAndSchoolId(String studentId, String schoolId);

    // Delete specific mapping
    void deleteByParentIdAndStudentId(String parentId, String studentId);

    // Delete all mappings for a parent
    void deleteByParentId(String parentId);

    // Count students for a parent
    long countByParentId(String parentId);

    // Count parents for a student
    long countByStudentId(String studentId);
}

package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByClassId(String classId);
    Page<Assignment> findByClassId(String classId, Pageable pageable);

    List<Assignment> findByTeacherId(String teacherId);
    Page<Assignment> findByTeacherId(String teacherId, Pageable pageable);

    List<Assignment> findByClassIdIn(List<String> classIds);
}

package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByClassId(String classId);

    List<Assignment> findByTeacherId(String teacherId);

    List<Assignment> findByClassIdIn(List<String> classIds);
}

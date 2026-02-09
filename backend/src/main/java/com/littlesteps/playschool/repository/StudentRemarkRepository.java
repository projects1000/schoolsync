package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.StudentRemark;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRemarkRepository extends MongoRepository<StudentRemark, String> {
    List<StudentRemark> findByStudentId(String studentId);
}

package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.ClassSubject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSubjectRepository extends MongoRepository<ClassSubject, String> {

    List<ClassSubject> findByClassId(String classId);

    List<ClassSubject> findByTeacherId(String teacherId);

    Optional<ClassSubject> findByClassIdAndSubjectId(String classId, String subjectId);

    boolean existsByClassIdAndSubjectId(String classId, String subjectId);

    boolean existsByClassIdAndTeacherId(String classId, String teacherId);

    void deleteByClassId(String classId);
}

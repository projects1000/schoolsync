package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.Classes;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassesRepository extends MongoRepository<Classes, String> {

    List<Classes> findBySchoolId(String schoolId);

    List<Classes> findBySchoolIdAndStatusNot(String schoolId, Classes.Status status);

    List<Classes> findBySchoolIdAndStatus(String schoolId, Classes.Status status);

    java.util.Optional<Classes> findBySchoolIdAndName(String schoolId, String name);

    @Query("{ 'schoolId': ?0, $or: [ { 'grade': ?1 }, { 'name': ?1 } ] }")
    List<Classes> findBySchoolIdAndGradeOrName(String schoolId, String identifier);

    List<Classes> findByGrade(String grade);

    List<Classes> findByStatus(Classes.Status status);

    List<Classes> findByClassTeacherId(String teacherId);

    long countByStatus(Classes.Status status);
}
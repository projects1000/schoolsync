package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassesRepository extends MongoRepository<Classes, String> {

    List<Classes> findBySchoolId(String schoolId);

    List<Classes> findByGrade(String grade);

    List<Classes> findByStatus(Classes.Status status);

    List<Classes> findByClassTeacher(Teacher teacher);

    Optional<Classes> findByName(String name);

    List<Classes> findByGradeAndSection(String grade, String section);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'grade': { '$regex': ?0, '$options': 'i' } }, { 'section': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Classes> searchClasses(String search);

    @Query(value = "{ 'status': 'ACTIVE' }", sort = "{ 'grade': 1, 'section': 1 }")
    List<Classes> findActiveClasses();

    boolean existsByName(String name);

    @Query("{ 'classTeacher.id': ?0 }")
    List<Classes> findByClassTeacherId(String teacherId);

    long countByStatus(Classes.Status status);
}
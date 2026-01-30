package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends MongoRepository<Teacher, String> {

    Optional<Teacher> findByEmployeeId(String employeeId);

    Optional<Teacher> findByEmail(String email);

    List<Teacher> findByDepartment(String department);

    List<Teacher> findByStatus(Teacher.Status status);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'employeeId': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Teacher> searchTeachers(String search);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    long countBySchoolIdAndStatus(String schoolId, Teacher.Status status);
}
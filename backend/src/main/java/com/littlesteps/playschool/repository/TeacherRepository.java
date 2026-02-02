package com.littlesteps.playschool.repository;

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

    List<Teacher> findBySchoolId(String schoolId);

    List<Teacher> findBySchoolIdAndDepartment(String schoolId, String department);

    List<Teacher> findBySchoolIdAndStatus(String schoolId, Teacher.Status status);

    @Query("{ 'schoolId': ?0, '$or': [ { 'name': { '$regex': ?1, '$options': 'i' } }, { 'employeeId': { '$regex': ?1, '$options': 'i' } }, { 'email': { '$regex': ?1, '$options': 'i' } } ] }")
    List<Teacher> searchTeachers(String schoolId, String search);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    long countBySchoolIdAndStatus(String schoolId, Teacher.Status status);

    long countBySchoolId(String schoolId);
}
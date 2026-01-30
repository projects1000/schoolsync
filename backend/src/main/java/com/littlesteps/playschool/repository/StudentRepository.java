package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByAdmissionNo(String admissionNo);

    List<Student> findByClassName(String className);

    List<Student> findByStatus(Student.Status status);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'admissionNo': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Student> findByNameContainingOrAdmissionNoContaining(String name);

    boolean existsByAdmissionNo(String admissionNo);

    long countBySchoolIdAndStatus(String schoolId, Student.Status status);
}
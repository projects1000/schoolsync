package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByAdmissionNo(String admissionNo);

    List<Student> findBySchoolId(String schoolId);

    List<Student> findBySchoolIdAndClassName(String schoolId, String className);

    List<Student> findBySchoolIdAndStatus(String schoolId, Student.Status status);

    @Query("{ 'schoolId': ?0, '$or': [ { 'name': { '$regex': ?1, '$options': 'i' } }, { 'admissionNo': { '$regex': ?1, '$options': 'i' } } ] }")
    List<Student> searchStudents(String schoolId, String name);

    boolean existsByAdmissionNo(String admissionNo);

    long countBySchoolIdAndStatus(String schoolId, Student.Status status);

    long countBySchoolId(String schoolId);

    List<Student> findByClassIdIn(List<String> classIds);

    List<Student> findByClassId(String classId);

    Optional<Student> findTopBySchoolIdAndClassIdAndSectionIdOrderByRollNoDesc(String schoolId, String classId,
            String sectionId);

    List<Student> findBySchoolIdAndClassIdAndSectionIdAndStatus(String schoolId, String classId, String sectionId,
            Student.Status status);
}
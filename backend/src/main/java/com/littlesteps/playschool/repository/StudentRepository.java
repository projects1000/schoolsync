package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

        Optional<Student> findByAdmissionNo(String admissionNo);

        List<Student> findBySchoolId(String schoolId);

        List<Student> findBySchoolIdAndStatusNot(String schoolId, Student.Status status);
        Page<Student> findBySchoolIdAndStatusNot(String schoolId, Student.Status status, Pageable pageable);

        List<Student> findBySchoolIdAndClassIdAndStatusNot(String schoolId, String classId, Student.Status status);
        Page<Student> findBySchoolIdAndClassIdAndStatusNot(String schoolId, String classId, Student.Status status, Pageable pageable);

        List<Student> findBySchoolIdAndClassName(String schoolId, String className);
        Page<Student> findBySchoolIdAndClassName(String schoolId, String className, Pageable pageable);

        List<Student> findBySchoolIdAndStatus(String schoolId, Student.Status status);
        Page<Student> findBySchoolIdAndStatus(String schoolId, Student.Status status, Pageable pageable);

        @Query("{ 'schoolId': ?0, 'status': { $ne: 'DELETED' }, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'admissionNo': { $regex: ?1, $options: 'i' } } ] }")
        List<Student> searchStudents(String schoolId, String searchTerm);

        @Query("{ 'schoolId': ?0, 'status': { $ne: 'DELETED' }, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'admissionNo': { $regex: ?1, $options: 'i' } } ] }")
        Page<Student> searchStudents(String schoolId, String searchTerm, Pageable pageable);

        boolean existsByAdmissionNo(String admissionNo);

        long countBySchoolIdAndStatus(String schoolId, Student.Status status);

        long countBySchoolId(String schoolId);

        long countBySchoolIdIsNotNull();

        long countBySchoolIdIsNullAndStatusNot(Student.Status status);

        long countByStatus(com.littlesteps.playschool.entity.Student.Status status);

        List<Student> findByClassIdIn(List<String> classIds);

        List<Student> findByClassId(String classId);

        Optional<Student> findTopBySchoolIdAndClassIdAndSectionIdOrderByRollNoDesc(String schoolId, String classId,
                        String sectionId);

        List<Student> findBySchoolIdAndClassIdAndSectionIdAndStatus(String schoolId, String classId, String sectionId,
                        Student.Status status);


    long countBySchoolIdAndStatusNot(String schoolId, Student.Status status);
}
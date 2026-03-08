package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface TeacherRepository extends MongoRepository<Teacher, String> {

    Optional<Teacher> findByEmployeeId(String employeeId);

    Optional<Teacher> findByEmail(String email);

    List<Teacher> findBySchoolId(String schoolId);

    List<Teacher> findBySchoolIdAndStatusNot(String schoolId, Teacher.Status status);
    Page<Teacher> findBySchoolIdAndStatusNot(String schoolId, Teacher.Status status, Pageable pageable);

    List<Teacher> findBySchoolIdAndStatus(String schoolId, Teacher.Status status);
    Page<Teacher> findBySchoolIdAndStatus(String schoolId, Teacher.Status status, Pageable pageable);

    List<Teacher> findBySchoolIdAndDepartment(String schoolId, String department);
    Page<Teacher> findBySchoolIdAndDepartment(String schoolId, String department, Pageable pageable);

    @Query("{ 'schoolId': ?0, 'status': { $ne: 'DELETED' }, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'email': { $regex: ?1, $options: 'i' } } ] }")
    List<Teacher> searchTeachers(String schoolId, String searchTerm);

    @Query("{ 'schoolId': ?0, 'status': { $ne: 'DELETED' }, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'email': { $regex: ?1, $options: 'i' } } ] }")
    Page<Teacher> searchTeachers(String schoolId, String searchTerm, Pageable pageable);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    long countBySchoolIdAndStatus(String schoolId, Teacher.Status status);

    long countBySchoolId(String schoolId);

    Optional<Teacher> findByUser(com.littlesteps.playschool.entity.User user);
}
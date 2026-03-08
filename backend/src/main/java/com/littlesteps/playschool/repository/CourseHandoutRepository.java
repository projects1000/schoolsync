package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.CourseHandout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseHandoutRepository extends MongoRepository<CourseHandout, String> {

    List<CourseHandout> findByTeacherIdAndSchoolId(String teacherId, String schoolId);
    Page<CourseHandout> findByTeacherIdAndSchoolId(String teacherId, String schoolId, Pageable pageable);

    List<CourseHandout> findByTeacherIdAndSchoolIdAndClassId(String teacherId, String schoolId, String classId);
    Page<CourseHandout> findByTeacherIdAndSchoolIdAndClassId(String teacherId, String schoolId, String classId, Pageable pageable);

    List<CourseHandout> findByTeacherIdAndSchoolIdAndSubject(String teacherId, String schoolId, String subject);
    Page<CourseHandout> findByTeacherIdAndSchoolIdAndSubject(String teacherId, String schoolId, String subject, Pageable pageable);

    List<CourseHandout> findByTeacherIdAndSchoolIdAndClassIdAndSubject(String teacherId, String schoolId,
            String classId, String subject);
    Page<CourseHandout> findByTeacherIdAndSchoolIdAndClassIdAndSubject(String teacherId, String schoolId,
            String classId, String subject, Pageable pageable);

    boolean existsByClassIdAndSubjectAndAcademicYear(String classId, String subject, String academicYear);

    Optional<CourseHandout> findByClassIdAndSubjectAndAcademicYear(String classId, String subject, String academicYear);

    List<CourseHandout> findBySchoolId(String schoolId);
    Page<CourseHandout> findBySchoolId(String schoolId, Pageable pageable);

    List<CourseHandout> findByClassIdAndSchoolId(String classId, String schoolId);
    Page<CourseHandout> findByClassIdAndSchoolId(String classId, String schoolId, Pageable pageable);
}

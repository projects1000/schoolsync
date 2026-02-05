package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.CourseHandout;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseHandoutRepository extends MongoRepository<CourseHandout, String> {

    List<CourseHandout> findByTeacherIdAndSchoolId(String teacherId, String schoolId);

    List<CourseHandout> findByTeacherIdAndSchoolIdAndClassId(String teacherId, String schoolId, String classId);

    List<CourseHandout> findByTeacherIdAndSchoolIdAndSubject(String teacherId, String schoolId, String subject);

    List<CourseHandout> findByTeacherIdAndSchoolIdAndClassIdAndSubject(String teacherId, String schoolId,
            String classId, String subject);

    boolean existsByClassIdAndSubjectAndAcademicYear(String classId, String subject, String academicYear);

    Optional<CourseHandout> findByClassIdAndSubjectAndAcademicYear(String classId, String subject, String academicYear);

    List<CourseHandout> findBySchoolId(String schoolId);

    List<CourseHandout> findByClassIdAndSchoolId(String classId, String schoolId);
}

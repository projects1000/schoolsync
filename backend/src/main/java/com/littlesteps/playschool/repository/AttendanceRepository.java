package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Attendance;
import com.littlesteps.playschool.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    List<Attendance> findByAttendanceDate(LocalDate date);
    Page<Attendance> findByAttendanceDate(LocalDate date, Pageable pageable);

    List<Attendance> findByStudentAndAttendanceDate(Student student, LocalDate date);

    Optional<Attendance> findByStudentIdAndAttendanceDate(String studentId, LocalDate date);

    @Query("{ 'student.className': ?0, 'attendanceDate': ?1 }")
    List<Attendance> findByClassAndDate(String className, LocalDate date);

    @Query("{ 'student.className': ?0, 'attendanceDate': ?1 }")
    Page<Attendance> findByClassAndDate(String className, LocalDate date, Pageable pageable);

    @Query("{ 'student.id': ?0, 'attendanceDate': { '$gte': ?1, '$lte': ?2 } }")
    List<Attendance> findByStudentIdAndDateRange(String studentId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findBySchoolIdAndAttendanceDate(String schoolId, LocalDate date);
    Page<Attendance> findBySchoolIdAndAttendanceDate(String schoolId, LocalDate date, Pageable pageable);

    List<Attendance> findBySchoolIdAndAttendanceDateBetween(String schoolId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findBySchoolIdAndStudentIdAndAttendanceDateBetween(String schoolId, String studentId, LocalDate startDate, LocalDate endDate);
}
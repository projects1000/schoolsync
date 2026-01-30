package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Timetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends MongoRepository<Timetable, String> {

    List<Timetable> findByClassName(String className);

    List<Timetable> findByClassNameAndIsActive(String className, Boolean isActive);

    List<Timetable> findByTeacherId(String teacherId);

    List<Timetable> findByClassNameAndDayOfWeek(String className, Timetable.DayOfWeek dayOfWeek);

    // In Mongo sort works by defining properties in method name or using Sort
    // parameter
    List<Timetable> findByClassNameOrderByDayOfWeekAscTimeSlotAsc(String className);

    List<Timetable> findByTeacherIdAndDayOfWeek(String teacherId, Timetable.DayOfWeek dayOfWeek);

    boolean existsByClassNameAndDayOfWeekAndTimeSlot(
            String className, Timetable.DayOfWeek dayOfWeek, String timeSlot);
}
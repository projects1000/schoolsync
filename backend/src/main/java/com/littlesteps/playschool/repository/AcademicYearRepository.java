package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.AcademicYear;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends MongoRepository<AcademicYear, String> {
    Optional<AcademicYear> findByName(String name);

    Optional<AcademicYear> findByCurrentTrue();
}

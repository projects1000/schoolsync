package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.SchoolSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolSettingsRepository extends MongoRepository<SchoolSettings, String> {

    // Get the first (and usually only) school settings record
    Optional<SchoolSettings> findFirstByOrderByIdAsc();

    // Check if any settings exist
    // Check if any settings exist
    // In Mongo, simple count works or checking existsBy
    boolean existsBySchoolNameIsNotNull();
}
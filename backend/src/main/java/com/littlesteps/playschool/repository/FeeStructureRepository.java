package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.FeeStructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends MongoRepository<FeeStructure, String> {

    Optional<FeeStructure> findByClassName(String className);

    // In Mongo this works out of the box if 'active' field exists
    List<FeeStructure> findByActive(Boolean active);
}
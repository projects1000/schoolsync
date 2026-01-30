package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.ClassTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassTemplateRepository extends MongoRepository<ClassTemplate, String> {
    Optional<ClassTemplate> findByName(String name);
}

package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.School;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {

    Optional<School> findByCode(String code);

    long countByStatus(School.Status status);

    java.util.List<School> findByStatusNot(School.Status status);

    java.util.List<School> findByStatus(School.Status status);

    boolean existsByCode(String code);

    Optional<School> findByPrincipalEmail(String principalEmail);
}

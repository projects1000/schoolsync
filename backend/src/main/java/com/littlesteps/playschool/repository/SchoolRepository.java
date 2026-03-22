package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.School;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {

    Optional<School> findByCode(String code);

    long countByStatus(School.Status status);

    java.util.List<School> findByStatusNot(School.Status status);
    Page<School> findByStatusNot(School.Status status, Pageable pageable);

    java.util.List<School> findByStatus(School.Status status);
    Page<School> findByStatus(School.Status status, Pageable pageable);

    boolean existsByCode(String code);

    Optional<School> findByPrincipalEmail(String principalEmail);

    @org.springframework.data.mongodb.repository.Aggregation(pipeline = {
        "{ '$match': { 'city': { '$ne': null }, 'status': { '$ne': 'DELETED' } } }",
        "{ '$group': { '_id': '$city', 'count': { '$sum': 1 } } }"
    })
    java.util.List<org.bson.Document> getCountByCity();

    java.util.List<School> findTop5ByOrderByCreatedAtDesc();

    long countByStatusNot(School.Status status);
}

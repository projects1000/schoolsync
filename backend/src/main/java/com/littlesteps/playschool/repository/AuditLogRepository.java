package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.AuditLog;
import com.littlesteps.playschool.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findByActorUser(User actorUser);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByTargetType(String targetType);

    List<AuditLog> findByTargetTypeAndTargetId(String targetType, String targetId);

    @Query("{ 'createdAt': { '$gte': ?0, '$lte': ?1 } }")
    List<AuditLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("{ 'actorUser': ?0, 'createdAt': { '$gte': ?1, '$lte': ?2 } }")
    List<AuditLog> findByUserAndDateRange(User user, LocalDateTime start, LocalDateTime end);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    // Distinct queries are different in Mongo Data, might need custom
    // implementation or aggregation
    // For simplicity, we can fetch distinct values using MongoTemplate in service,
    // but let's try this:
    @Query(value = "{}", fields = "{ 'action' : 1 }")
    List<AuditLog> findAllActions(); // We'll process distinct in Service or use aggregation in Custom Repository

    @Query(value = "{}", fields = "{ 'targetType' : 1 }")
    List<AuditLog> findAllTargetTypes(); // We'll process distinct in Service

    long countByActorUser(User user);

    @Query(value = "{ 'createdAt': { '$gte': ?0 } }", count = true)
    long countSince(LocalDateTime since);

    List<AuditLog> findBySchoolId(String schoolId);

    List<AuditLog> findBySchoolIdAndTargetIdAndAction(String schoolId, String targetId, String action);
}
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

    @Query(value = "{}", fields = "{ 'action' : 1 }")
    List<AuditLog> findAllActions();

    @Query(value = "{}", fields = "{ 'targetType' : 1 }")
    List<AuditLog> findAllTargetTypes();

    long countByActorUser(User user);

    @Query(value = "{ 'createdAt': { '$gte': ?0 } }", count = true)
    long countSince(LocalDateTime since);

    Page<AuditLog> findBySchoolId(String schoolId, Pageable pageable);
    
    Page<AuditLog> findBySchoolIdOrderByCreatedAtDesc(String schoolId, Pageable pageable);

    List<AuditLog> findTop1000ByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime createdAt);

    List<AuditLog> findTop1000BySchoolIdAndCreatedAtAfterOrderByCreatedAtDesc(String schoolId, LocalDateTime createdAt);

    Page<AuditLog> findBySchoolIdAndTargetIdAndAction(String schoolId, String targetId, String action, Pageable pageable);

    Page<AuditLog> findBySchoolIdAndTargetId(String schoolId, String targetId, Pageable pageable);

    Page<AuditLog> findBySchoolIdAndAction(String schoolId, String action, Pageable pageable);

    @Query(value = "{ 'schoolId': ?0, 'action': { '$in': ['LOGIN', 'LOGOUT', 'FAILED_LOGIN'] } }")
    Page<AuditLog> findLoginLogs(String schoolId, Pageable pageable);

    @Query(value = "{ 'action': { '$in': ['LOGIN', 'LOGOUT', 'FAILED_LOGIN'] } }")
    Page<AuditLog> findLoginLogsAll(Pageable pageable);

    @Query(value = "{ 'schoolId': ?0, 'action': { '$regex': '^(CREATE_|UPDATE_|DELETE_|MAP_PARENT_STUDENT|UNMAP_PARENT_STUDENT)', '$options': 'i' } }")
    Page<AuditLog> findDataChangeLogs(String schoolId, Pageable pageable);

    @Query(value = "{ 'action': { '$regex': '^(CREATE_|UPDATE_|DELETE_|MAP_PARENT_STUDENT|UNMAP_PARENT_STUDENT)', '$options': 'i' } }")
    Page<AuditLog> findDataChangeLogsAll(Pageable pageable);

    @Query(value = "{ 'schoolId': ?0, 'action': { '$nin': ['LOGIN', 'LOGOUT', 'FAILED_LOGIN'], '$not': { '$regex': '^(CREATE_|UPDATE_|DELETE_|MAP_PARENT_STUDENT|UNMAP_PARENT_STUDENT)', '$options': 'i' } } }")
    Page<AuditLog> findActivityLogs(String schoolId, Pageable pageable);

    @Query(value = "{ 'action': { '$nin': ['LOGIN', 'LOGOUT', 'FAILED_LOGIN'], '$not': { '$regex': '^(CREATE_|UPDATE_|DELETE_|MAP_PARENT_STUDENT|UNMAP_PARENT_STUDENT)', '$options': 'i' } } }")
    Page<AuditLog> findActivityLogsAll(Pageable pageable);

    @Query(value = "{ 'schoolId': ?0, 'createdAt': { '$gte': ?1 } }", count = true)
    long countSinceBySchoolId(String schoolId, LocalDateTime since);

    @Query(value = "{ 'schoolId': ?0, 'action': ?1, 'createdAt': { '$gte': ?2 } }", count = true)
    long countBySchoolIdAndActionSince(String schoolId, String action, LocalDateTime since);

    @Query(value = "{ 'action': ?0, 'createdAt': { '$gte': ?1 } }", count = true)
    long countByActionSince(String action, LocalDateTime since);
}
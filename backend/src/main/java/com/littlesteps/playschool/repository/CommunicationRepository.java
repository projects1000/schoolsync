package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Communication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommunicationRepository extends MongoRepository<Communication, String> {

    @Query("{ '$or': [ { 'recipientIds': ?0 }, { 'senderId': ?0 } ] }")
    List<Communication> findByUserInvolvement(String userId);

    @Query("{ 'recipientIds': ?0 }")
    List<Communication> findByRecipient(String userId);

    List<Communication> findBySenderId(String senderId);

    @Query("{ 'className': ?0 }")
    List<Communication> findByClassName(String className);

    @Query("{ 'readBy': { '$ne': ?0 }, 'recipientIds': ?0 }")
    List<Communication> findUnreadByUser(String userId);

    @Query("{ 'isUrgent': true, 'readBy': { '$ne': ?0 }, 'recipientIds': ?0 }")
    List<Communication> findUrgentUnreadByUser(String userId);

    List<Communication> findByTypeAndCreatedAtAfter(
            Communication.MessageType type, LocalDateTime after);

    @Query("{ 'senderRole': ?0 }")
    List<Communication> findBySenderRole(Communication.SenderRole role);

    List<Communication> findAllByOrderByCreatedAtDesc();

    List<Communication> findBySchoolIdOrderByCreatedAtDesc(String schoolId);

    List<Communication> findBySchoolIdAndSenderRole(String schoolId, Communication.SenderRole role);

    List<Communication> findBySchoolIdAndRecipientType(String schoolId, Communication.RecipientType recipientType);

    List<Communication> findByTargetClassId(String targetClassId);

    List<Communication> findByTargetClassIdAndRecipientType(String targetClassId,
            Communication.RecipientType recipientType);

    List<Communication> findByRecipientIdsContaining(String recipientId);

    List<Communication> findByRecipientType(Communication.RecipientType recipientType);

    List<Communication> findBySenderIdOrderByCreatedAtDesc(String senderId);
}